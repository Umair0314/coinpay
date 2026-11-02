-- Finalize the admin action RPC so Processing, Complete, and Reject are usable.
create or replace function public.admin_update_request_status(
  request_id uuid, request_kind public.request_type, next_status text, status_note text default null,
  processing_ref text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare current_status text; old_row jsonb; new_row jsonb; required_permission text;
begin
  required_permission := case when request_kind = 'deposit' then 'deposits.verify' else 'withdrawals.approve' end;
  if not public.has_admin_permission(required_permission) then raise exception 'permission_denied'; end if;

  if request_kind = 'deposit' then
    select to_jsonb(d), d.status::text into old_row, current_status
    from public.deposit_requests d where d.id = request_id for update;
    if current_status is null then raise exception 'request_not_found'; end if;
    if next_status = 'completed' and not public.has_admin_permission('deposits.complete') then raise exception 'permission_denied'; end if;
    if next_status not in ('processing', 'completed', 'rejected') then raise exception 'invalid_status'; end if;
    if current_status in ('completed', 'rejected', 'cancelled') then raise exception 'invalid_status_transition'; end if;
    update public.deposit_requests set status = next_status::public.request_status, updated_at = now()
      where id = request_id returning to_jsonb(deposit_requests) into new_row;
  else
    select to_jsonb(w), w.status::text into old_row, current_status
    from public.withdrawal_requests w where w.id = request_id for update;
    if current_status is null then raise exception 'request_not_found'; end if;
    if next_status = 'completed' and not public.has_admin_permission('withdrawals.complete') then raise exception 'permission_denied'; end if;
    if next_status not in ('processing', 'completed', 'rejected') then raise exception 'invalid_status'; end if;
    if current_status in ('completed', 'rejected', 'cancelled') then raise exception 'invalid_status_transition'; end if;
    update public.withdrawal_requests set status = next_status::public.request_status, updated_at = now()
      where id = request_id returning to_jsonb(withdrawal_requests) into new_row;
  end if;

  insert into public.transaction_status_history(request_id, request_type, from_status, to_status, actor_id, note)
    values (request_id, request_kind, current_status, next_status, auth.uid(), nullif(trim(status_note), ''));
  insert into public.audit_logs(actor_id, action, entity_type, entity_id, before_data, after_data)
    values (auth.uid(), 'status_changed', request_kind::text, request_id, old_row, new_row);
  return new_row;
end;
$$;

grant execute on function public.admin_update_request_status(uuid, public.request_type, text, text, text) to authenticated;
