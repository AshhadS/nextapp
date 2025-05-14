-- Add image_url column to messages table
alter table public.messages add column image_url text;

-- Create storage bucket for chat images
insert into storage.buckets (id, name, public) values ('chat-images', 'chat-images', true);

-- Allow authenticated users to upload images
create policy "Allow authenticated users to upload images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'chat-images');

-- Allow public access to view images
create policy "Allow public to view images"
  on storage.objects
  for select
  to public
  using (bucket_id = 'chat-images');
