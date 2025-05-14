-- Create typing_status table
create table public.typing_status (
  id uuid references auth.users(id) primary key,
  is_typing boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_email text not null
);

-- Set up row level security
alter table public.typing_status enable row level security;

-- Allow read access to all authenticated users
create policy "Allow authenticated users to read typing status"
  on public.typing_status
  for select
  to authenticated
  using (true);

-- Allow users to update their own typing status
create policy "Allow users to update their own typing status"
  on public.typing_status
  for update
  to authenticated
  using (id = auth.uid());

-- Allow users to insert their own typing status
create policy "Allow users to insert their own typing status"
  on public.typing_status
  for insert
  to authenticated
  with check (id = auth.uid());

-- Enable realtime
alter publication supabase_realtime add table typing_status;
