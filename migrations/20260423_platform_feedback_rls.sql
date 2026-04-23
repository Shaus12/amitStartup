-- Apply RLS + policies for existing platform_feedback table.
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
