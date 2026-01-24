-- Secure search_path for SECURITY DEFINER functions to prevent search path hijacking
create or replace function public.handle_new_user()
returns trigger as $$
declare
  random_username text;
  is_unique boolean := false;
begin
  -- Set search path explicitly for security
  SET search_path = public;

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
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    random_username
  );
  return new;
end;
$$ language plpgsql security definer;
