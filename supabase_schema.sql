-- Create members table
create table if not exists members (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create expenses table
create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount numeric not null,
  paid_by text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  involved text[] not null,
  split_type text default 'equal',
  split_details jsonb,
  category text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create payments table
create table if not exists payments (
  id uuid default gen_random_uuid() primary key,
  from_user text not null,
  to_user text not null,
  amount numeric not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table members enable row level security;
alter table expenses enable row level security;
alter table payments enable row level security;

-- Create policies to allow public read/write access
create policy "Public Access Members" on members for all using (true) with check (true);
create policy "Public Access Expenses" on expenses for all using (true) with check (true);
create policy "Public Access Payments" on payments for all using (true) with check (true);
