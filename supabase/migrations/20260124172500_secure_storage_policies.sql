-- Secure storage policies for avatars bucket to prevent unauthorized uploads/overwrites

-- Drop insecure policies
drop policy if exists "Anyone can upload an avatar." on storage.objects;
drop policy if exists "Anyone can update their own avatar." on storage.objects;

-- Create stricter policies
-- Users can only upload files to a folder matching their user ID
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can update files in their own folder
create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.uid() = owner
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete files in their own folder (optional but good practice)
create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid() = owner
    and (storage.foldername(name))[1] = auth.uid()::text
  );
