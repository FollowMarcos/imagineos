-- Robust and Idempotent handle_new_user
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  random_username text;
  is_unique boolean := false;
begin
  -- Check if profile already exists (idempotency)
  if exists (select 1 from public.profiles where id = new.id) then
    return new;
  end if;

  -- Generate a random username until unique
  while not is_unique loop
    random_username := 'user_' || substr(md5(random()::text), 1, 8);
    
    if not exists (select 1 from public.profiles where username = random_username) then
      is_unique := true;
    end if;
  end loop;

  insert into public.profiles (id, full_name, avatar_url, username)
  values (
    new.id,
    coalesce(
        new.raw_user_meta_data->>'full_name', 
        new.raw_user_meta_data->>'name',
        new.raw_user_meta_data->>'display_name'
    ),
    coalesce(
        new.raw_user_meta_data->>'avatar_url', 
        new.raw_user_meta_data->>'picture',
        new.raw_user_meta_data->>'profile_image_url_https'
    ),
    random_username
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;

  return new;
end;
$$;
