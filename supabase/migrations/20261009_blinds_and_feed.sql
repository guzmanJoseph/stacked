-- =====================================================
-- STACKED UPDATE: Blinds tracking + Group feed
-- Run this in Supabase Dashboard -> SQL Editor
-- =====================================================

-- =====================================================
-- 1. BLINDS TRACKING
-- =====================================================

-- Add blinds columns to poker_sessions
alter table poker_sessions
  add column if not exists small_blind numeric,
  add column if not exists big_blind numeric;

-- =====================================================
-- 2. POSTS (social feed)
-- =====================================================

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  group_id uuid references groups(id) on delete cascade,
  caption text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx
  on posts (created_at desc);

create index if not exists posts_group_id_idx
  on posts (group_id);

-- Enable RLS so posts are only visible to group members
alter table posts enable row level security;

-- Create: own posts, or posts to a group you belong to
create policy "Users can create posts"
  on posts for insert to authenticated
  with check (
    user_id = auth.uid()
    or exists (
      select 1 from group_members
      where group_id = coalesce(posts.group_id, '00000000-0000-0000-0000-000000000000'::uuid)
        and user_id = auth.uid()
    )
  );

-- Read: own posts, or posts to a group you belong to
create policy "Members can read group posts"
  on posts for select to authenticated
  using (
    user_id = auth.uid()
    or (
      group_id is not null
      and exists (
        select 1 from group_members
        where group_members.group_id = posts.group_id
          and group_members.user_id = auth.uid()
      )
    )
  );

-- Update / Delete: own posts only
create policy "Users can update own posts"
  on posts for update to authenticated
  using (user_id = auth.uid());

create policy "Users can delete own posts"
  on posts for delete to authenticated
  using (user_id = auth.uid());

-- =====================================================
-- 3. PHOTO STORAGE BUCKET
-- =====================================================

-- Public-read bucket for feed photos
insert into storage.buckets (id, name, public)
values ('posts', 'posts', true)
on conflict (id) do nothing;

-- Authenticated users can upload their own photos
create policy "Users can upload feed photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'posts');

-- Everyone (app users) can view feed photos
create policy "Public read feed photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'posts');

-- Owners can delete their photos
create policy "Users can delete own feed photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'posts' and owner = auth.uid());
