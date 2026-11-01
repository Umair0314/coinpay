import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: notifications, error } = await supabase.from("notifications").select("id,request_id,request_type,title,message,read_at,created_at").order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(error.message);
  return <main className="container-page py-8"><h1 className="text-3xl font-bold">Notifications</h1><div className="mt-6 space-y-3">{notifications?.length ? notifications.map((notification) => <Link className={`card block ${notification.read_at ? "opacity-70" : ""}`} href={notification.request_id ? `/requests/${notification.request_id}` : "/notifications"} key={notification.id}><p className="font-semibold">{notification.title}</p><p className="mt-1 text-sm text-muted">{notification.message}</p><p className="mt-2 text-xs text-muted">{new Date(notification.created_at).toLocaleString("en-PK")}</p></Link>) : <div className="card text-muted">You have no new notifications.</div>}</div></main>;
}
