-- Hallstones Widows Sons MBA — Supabase schema
-- Run this in the Supabase SQL editor (Project → SQL Editor → New query)

-- ========== NEWS ==========
create table if not exists news (
  id uuid primary key default gen_random_uuid(),
  tag text not null,               -- e.g. CHAPTER / CHARITY / PROVINCE
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

-- ========== RIDES ==========
create table if not exists rides (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  ride_date date not null,
  ride_time text not null,         -- stored as text e.g. "09:00" for simplicity
  meet_point text not null,
  miles integer,
  description text,
  created_at timestamptz not null default now()
);

-- ========== RSVPS ==========
create table if not exists rsvps (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid not null references rides(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now(),
  unique (ride_id, email)
);

-- ========== GALLERY ==========
-- Store images in a Supabase Storage bucket called "gallery" and keep captions/urls here.
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  caption text not null,
  image_url text not null,
  created_at timestamptz not null default now()
);

-- ========== SHOP ==========
create table if not exists shop_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price_pence integer not null,    -- store price in pence to avoid float issues
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_name text not null,
  buyer_email text not null,
  items jsonb not null,            -- [{ item_id, name, qty, price_pence }]
  total_pence integer not null,
  status text not null default 'pending', -- pending / paid / fulfilled
  stripe_session_id text,
  created_at timestamptz not null default now()
);

-- ========== JOIN REQUESTS ==========
create table if not exists join_requests (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  mother_lodge text,
  bike text,
  status text not null default 'new', -- new / contacted / accepted / declined
  created_at timestamptz not null default now()
);

-- ========== ROW LEVEL SECURITY ==========
-- Public (anon key) can READ news/rides/gallery/shop, and INSERT rsvps/orders/join_requests.
-- Nobody public can update/delete anything — do that from the Supabase dashboard as an officer.

alter table news enable row level security;
alter table rides enable row level security;
alter table rsvps enable row level security;
alter table gallery_items enable row level security;
alter table shop_items enable row level security;
alter table orders enable row level security;
alter table join_requests enable row level security;

create policy "public read news" on news for select using (true);
create policy "public read rides" on rides for select using (true);
create policy "public read gallery" on gallery_items for select using (true);
create policy "public read shop" on shop_items for select using (active = true);

create policy "public insert rsvps" on rsvps for insert with check (true);
create policy "public read rsvps count" on rsvps for select using (true);

create policy "public insert orders" on orders for insert with check (true);
create policy "public insert join requests" on join_requests for insert with check (true);

-- ========== SEED DATA (optional — remove if you'd rather start empty) ==========
insert into news (tag, title, body) values
  ('CHAPTER', 'New patch order lands next week', 'Ladies'' back patches have arrived from the supplier — collection at the next social meet.'),
  ('CHARITY', 'MCF escort ride raised £2,140', 'Thanks to everyone who rode London–Newhaven for the Masonic Charitable Foundation. Cheque presented to the Province this month.'),
  ('PROVINCE', 'Provincial gathering — save the date', 'All Widows Sons chapters in the Province are invited. Details and RSVP under Rides.');

insert into rides (title, ride_date, ride_time, meet_point, miles, description) values
  ('Sunday Run', current_date + interval '4 days', '09:00', 'TBC — Buckinghamshire', 62, 'Easy pace loop, coffee stop included. All bikes welcome.'),
  ('Provincial Gathering Ride', current_date + interval '17 days', '10:30', 'Aylesbury Masonic Centre', 40, 'Widows Sons chapters from across the Province riding in together. Formation briefing on arrival.'),
  ('Evening Run & Chips', current_date + interval '23 days', '18:30', 'The Squadron, Bourne End', 28, 'Short one after work — pub stop included.');

insert into shop_items (name, price_pence) values
  ('Back Patch — Standard', 2800),
  ('Back Patch — Ladies', 2800),
  ('Chapter Pin', 650),
  ('Hoodie — Black/Brass', 3400),
  ('Buff / Neck Tube', 900),
  ('Enamel Mug', 850);
