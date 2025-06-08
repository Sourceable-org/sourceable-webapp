-- Add media_type column to media_metadata table
ALTER TABLE media_metadata
ADD COLUMN media_type TEXT NOT NULL DEFAULT 'image'
CHECK (media_type IN ('image', 'video'));

-- Update existing records to have 'image' as media_type
UPDATE media_metadata
SET media_type = 'image'
WHERE media_type IS NULL; 