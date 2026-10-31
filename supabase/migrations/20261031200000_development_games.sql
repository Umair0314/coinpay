-- Development-only seed data for the customer deposit and withdrawal dropdowns.
-- Replace these games and rates with admin-managed production data before launch.
with seed_games(name) as (
  values
    ('Migo Live'),
    ('PUBG Mobile'),
    ('Free Fire'),
    ('Mobile Legends'),
    ('Bigo Live')
),
inserted_games as (
  insert into public.games (name, enabled)
  select seed.name, true
  from seed_games seed
  where not exists (
    select 1 from public.games existing where lower(existing.name) = lower(seed.name)
  )
  returning id, name
)
insert into public.exchange_rates (
  game_id,
  purchase_coins_per_pkr,
  withdrawal_pkr_per_coin,
  min_amount_pkr,
  max_amount_pkr
)
select
  game.id,
  1.2,
  0.8,
  100,
  100000
from inserted_games game;
