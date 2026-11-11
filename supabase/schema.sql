-- Pedo Edhellen's backend (Supabase project learn-elvish), kept here so it can be rebuilt.
-- Run in the Supabase SQL editor. Nothing here is secret: row-level security is what protects the data.

-- ——— progress: one row per account, readable and writable only by its owner ———
create table if not exists public.progress (
  user_id uuid primary key references auth.users (id) on delete cascade,
  doc jsonb not null check (pg_column_size(doc) < 2000000),
  updated_at timestamptz not null default now()
);
alter table public.progress enable row level security;
revoke all on public.progress from anon;
-- policies (created once): read / add / change / remove own progress, each (select auth.uid()) = user_id

-- ——— deleting your own account (1.5.0) ———
-- Removes the caller's account; their progress row goes with it (on delete cascade). It can only ever delete
-- the account of whoever calls it.
create or replace function public.delete_my_account() returns void
language sql security definer set search_path = '' as $$
  delete from auth.users where id = auth.uid();
$$;
revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- ——— profile pictures (1.5.0) ———
-- One small picture per account at avatars/<user id>/avatar.webp, cropped to 96 × 96 on the device. The bucket
-- refuses anything over 64 KB or that is not WebP or JPEG. Pictures are public by URL (the URL holds only a
-- random account id); only the owner can add, replace or remove theirs.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 65536, array['image/webp', 'image/jpeg'])
on conflict (id) do update set public = true, file_size_limit = 65536, allowed_mime_types = array['image/webp', 'image/jpeg'];

create policy "see own avatar" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "add own avatar" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "replace own avatar" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "remove own avatar" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
