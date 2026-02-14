create type subscription_status as enum ('trialing', 'active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid');

create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  status subscription_status not null,
  price_id text,
  quantity integer,
  cancel_at_period_end boolean,
  cancel_at timestamp with time zone,
  canceled_at timestamp with time zone,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created timestamp with time zone default timezone('utc'::text, now()) not null,
  ended_at timestamp with time zone,
  trial_start timestamp with time zone,
  trial_end timestamp with time zone,

  unique(user_id)
);
