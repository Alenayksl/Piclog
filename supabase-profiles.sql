-- Profil tablosu: Ad soyad ve kullanıcı adı auth.users ile birlikte tutulur.
-- Supabase Dashboard → SQL Editor'da bu sorguyu çalıştır.

create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  username text unique,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Kullanıcılar kendi profilini görebilir."
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Kullanıcılar kendi profilini güncelleyebilir."
  on public.profiles for update
  using ( auth.uid() = id );

-- Yeni kayıt olduğunda auth.users'dan profil satırı oluştur
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Kullanici kendi hesabini (auth.users) silebilsin.
-- Uygulama tarafinda supabase.rpc('delete_my_account') cagrilir.
-- Not: storage.objects tablosundan dogrudan silme yapma.
-- Fotograflar uygulama tarafinda Storage API ile silinmelidir.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  -- Some projects may not have logs/profiles. Delete only if relation exists.
  if to_regclass('public.logs') is not null then
    execute 'delete from public.logs where user_id = auth.uid()';
  end if;

  if to_regclass('public.profiles') is not null then
    execute 'delete from public.profiles where id = auth.uid()';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;

-- Photos bucket and policies (user can manage only their own folder).
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "photos_insert_own" on storage.objects;
create policy "photos_insert_own"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_select_own" on storage.objects;
create policy "photos_select_own"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_update_own" on storage.objects;
create policy "photos_update_own"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_delete_own" on storage.objects;
create policy "photos_delete_own"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
