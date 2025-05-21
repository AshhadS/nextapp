-- Modify messages table to add recipient_id for direct messages
alter table public.messages add column recipient_id uuid references auth.users(id);

-- Create profiles table to store user information
create table public.profiles (
  id uuid references auth.users(id) primary key,
  username text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up row level security for profiles
alter table public.profiles enable row level security;

-- Allow users to read all profiles
create policy "Allow users to view all profiles"
  on public.profiles
  for select
  to authenticated
  using (true);

-- Allow users to update their own profile
create policy "Allow users to update own profile"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id);

-- Create trigger to create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (
    id,
    username,
    created_at,
    updated_at
  )
  values (
    new.id,
    split_part(new.email, '@', 1),
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update messages policies for direct messages
drop policy if exists "Allow authenticated users to read messages" on public.messages;
create policy "Allow users to read messages"
  on public.messages
  for select
  to authenticated
  using (
    recipient_id is null -- public messages
    or user_id = auth.uid() -- sent by user
    or recipient_id = auth.uid() -- received by user
  );

-- Enable realtime for profiles
alter publication supabase_realtime add table profiles;
