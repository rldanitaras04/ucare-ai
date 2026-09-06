-- Storage policies for profile avatar uploads in ucare-ai-bucket
-- Run this in Supabase Dashboard > SQL Editor (requires superuser for storage.objects)

-- Allow authenticated users to upload avatars to the profile-avatars folder
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ucare-ai-bucket'
  AND (storage.foldername(name))[1] = 'profile-avatars'
);

-- Allow authenticated users to read their own avatars
CREATE POLICY "Authenticated users can read own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'ucare-ai-bucket'
  AND (storage.foldername(name))[1] = 'profile-avatars'
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Authenticated users can update own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'ucare-ai-bucket'
  AND (storage.foldername(name))[1] = 'profile-avatars'
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Authenticated users can delete own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'ucare-ai-bucket'
  AND (storage.foldername(name))[1] = 'profile-avatars'
);

-- Allow public read access for avatar images (for displaying in navbar, etc.)
CREATE POLICY "Public read access for avatars"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'ucare-ai-bucket'
  AND (storage.foldername(name))[1] = 'profile-avatars'
);
