-- Run this in your Supabase SQL Editor

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  price numeric not null default 0,
  stock int not null default 0,
  low_stock_threshold int default 5,
  created_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  phone text default '',
  notes text default '',
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  order_number text,
  customer_id uuid references customers on delete set null,
  customer_name text not null default '',
  customer_phone text default '',
  items jsonb not null default '[]',
  total numeric not null default 0,
  status text default 'pending',
  payment_method text default '',
  amount_paid numeric default 0,
  notes text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Row-level security
alter table products  enable row level security;
alter table customers enable row level security;
alter table orders    enable row level security;

create policy "users own products"  on products  for all using (auth.uid() = user_id);
create policy "users own customers" on customers for all using (auth.uid() = user_id);
create policy "users own orders"    on orders    for all using (auth.uid() = user_id);
