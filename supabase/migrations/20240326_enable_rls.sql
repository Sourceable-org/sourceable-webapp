-- Enable RLS on the media_metadata table
ALTER TABLE media_metadata ENABLE ROW LEVEL SECURITY;

-- Create policy to allow inserts for authenticated and anonymous users
CREATE POLICY "Allow public inserts to media_metadata"
ON media_metadata
FOR INSERT
TO public
WITH CHECK (true);

-- Create policy to allow public reads
CREATE POLICY "Allow public reads from media_metadata"
ON media_metadata
FOR SELECT
TO public
USING (true);

-- Enable RLS on the storage bucket
CREATE POLICY "Allow public uploads to media bucket"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'media');

-- Allow public reads from the media bucket
CREATE POLICY "Allow public reads from media bucket"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'media'); 