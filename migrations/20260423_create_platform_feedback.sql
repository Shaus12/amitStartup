-- Dedicated table for product/platform feedback from end users.
create table if not exists public.platform_feedback (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists platform_feedback_created_at_idx
  on public.platform_feedback (created_at desc);

create index if not exists platform_feedback_business_id_idx
  on public.platform_feedback (business_id);

create index if not exists platform_feedback_user_id_idx
  on public.platform_feedback (user_id);

alter table public.platform_feedback enable row level security;

grant select, insert on table public.platform_feedback to authenticated;

drop policy if exists "platform_feedback_select_own" on public.platform_feedback;
create policy "platform_feedback_select_own"
  on public.platform_feedback
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "platform_feedback_insert_own" on public.platform_feedback;
create policy "platform_feedback_insert_own"
  on public.platform_feedback
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.businesses b
      where b.id = business_id
        and b.user_id = auth.uid()
    )
  );
