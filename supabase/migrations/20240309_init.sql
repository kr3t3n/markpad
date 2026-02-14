-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
    id uuid primary key default uuid_generate_v4(),
    email text not null unique,
    stripe_customer_id text,
    subscription_status text check (subscription_status in ('active', 'inactive', 'past_due', 'canceled')),
    subscription_end_date timestamptz,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- Drop existing RLS policies if they exist
drop policy if exists "Allow public read access" on public.profiles;
drop policy if exists "Allow service role to manage profiles" on public.profiles;

-- Add subscription_end_date column if it doesn't exist
do $$ 
begin 
  if not exists (
    select column_name 
    from information_schema.columns 
    where table_name = 'profiles' 
    and column_name = 'subscription_end_date'
  ) then
    alter table public.profiles
    add column subscription_end_date timestamptz;
  end if;
end $$;

-- Update table structure if needed (this won't affect existing data)
alter table public.profiles 
  alter column email set not null;

-- Add unique constraint on email if it doesn't exist
do $$ 
begin 
  if not exists (
    select constraint_name 
    from information_schema.table_constraints 
    where table_name = 'profiles' 
    and constraint_name = 'profiles_email_unique'
  ) then
    alter table public.profiles
    add constraint profiles_email_unique unique (email);
  end if;
end $$;

-- Add check constraint if it doesn't exist
do $$ 
begin 
  if not exists (
    select constraint_name 
    from information_schema.table_constraints 
    where table_name = 'profiles' 
    and constraint_name = 'profiles_subscription_status_check'
  ) then
    alter table public.profiles
    add constraint profiles_subscription_status_check 
    check (subscription_status in ('active', 'inactive', 'past_due', 'canceled'));
  end if;
end $$;

-- Enable RLS if not already enabled
alter table public.profiles enable row level security;

-- Create new policies
create policy "Allow public read access"
    on public.profiles
    for select
    using (true);

create policy "Allow service role to manage profiles"
    on public.profiles
    using (auth.role() = 'service_role')
    with check (auth.role() = 'service_role');

-- Create index if it doesn't exist
create index if not exists profiles_email_idx on public.profiles(email);

-- Grant permissions
grant usage on schema public to public;
grant select on public.profiles to anon, authenticated;
grant insert, update on public.profiles to service_role;
