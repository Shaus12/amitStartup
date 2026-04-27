create table if not exists api_usage_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete set null,
  user_id uuid references users(id) on delete set null,
  call_type text not null,
  input_tokens int not null,
  output_tokens int not null,
  estimated_cost_usd float,
  model text,
  created_at timestamptz default now()
);

create index if not exists api_usage_logs_business_id_idx on api_usage_logs (business_id);
create index if not exists api_usage_logs_user_id_idx on api_usage_logs (user_id);
create index if not exists api_usage_logs_call_type_idx on api_usage_logs (call_type);
create index if not exists api_usage_logs_created_at_idx on api_usage_logs (created_at desc);
