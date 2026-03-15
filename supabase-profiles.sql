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
