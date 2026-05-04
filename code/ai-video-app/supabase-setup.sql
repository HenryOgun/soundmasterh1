-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)

-- Videos table
create table if not exists videos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  type        text not null check (type in ('text-to-video', 'image-to-video')),
  prompt      text,
  url         text not null,
  file_path   text not null,
  created_at  timestamptz default now()
);

-- Only owners can read/delete their videos
alter table videos enable row level security;

create policy "Users see own videos"   on videos for select using (auth.uid() = user_id);
create policy "Users insert own videos" on videos for insert with check (auth.uid() = user_id);
create policy "Users delete own videos" on videos for delete using (auth.uid() = user_id);

-- Storage bucket (also do this in Supabase Dashboard → Storage → New Bucket)
-- Bucket name: videos
-- Public: true
