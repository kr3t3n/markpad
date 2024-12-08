-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  stripe_customer_id text,
  subscription_status text check (subscription_status in ('active', 'inactive', 'past_due', 'canceled')) default 'inactive',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create documents table
create table public.documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create triggers for updated_at
create trigger handle_updated_at_profiles
  before update on public.profiles
  for each row
  execute procedure public.handle_updated_at();

create trigger handle_updated_at_documents
  before update on public.documents
  for each row
  execute procedure public.handle_updated_at();

-- Enable RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.documents enable row level security;

-- Create RLS policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Create RLS policies for documents
create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can create documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on public.documents for delete
  using (auth.uid() = user_id);

-- Create function to handle new user profiles
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, user_id)
  values (new.id, new.id);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();