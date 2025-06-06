-- Make map_snapshot_url nullable
ALTER TABLE media_metadata 
ALTER COLUMN map_snapshot_url DROP NOT NULL;

-- Make qr_code_url nullable if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'media_metadata' 
        AND column_name = 'qr_code_url'
    ) THEN
        ALTER TABLE media_metadata 
        ALTER COLUMN qr_code_url DROP NOT NULL;
    END IF;
END $$; 