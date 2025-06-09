-- Add gps_precision column to media_metadata table
ALTER TABLE media_metadata
ADD COLUMN gps_precision TEXT NOT NULL DEFAULT '10mi'
CHECK (gps_precision IN ('exact', '5mi', '10mi', '20mi'));

-- Update existing records to have '10mi' as gps_precision
UPDATE media_metadata
SET gps_precision = '10mi'
WHERE gps_precision IS NULL; 