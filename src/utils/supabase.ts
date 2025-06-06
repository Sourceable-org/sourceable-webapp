import { createClient } from '@supabase/supabase-js';

// These should be environment variables in production
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MediaMetadata {
  id: string;
  timestamp_local: string;
  timestamp_utc: string;
  gps_lat: number;
  gps_lng: number;
  media_url: string;
  public_url: string;
  watermark_url: string;
  uploader_name?: string;
}

export const uploadMedia = async (
  file: File,
  metadata: Omit<MediaMetadata, 'id' | 'media_url' | 'watermark_url'>
): Promise<MediaMetadata> => {
  // Generate a unique slug for the public URL
  const slug = Math.random().toString(36).substring(2, 15);
  
  // Upload original file
  const { data: originalData, error: originalError } = await supabase.storage
    .from('media')
    .upload(`${slug}/original.jpg`, file);
    
  if (originalError) throw originalError;
  
  // Get the public URL for the original file
  const { data: { publicUrl: mediaUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(`${slug}/original.jpg`);
    
  // Upload watermarked file (assuming it's already processed)
  const { data: watermarkData, error: watermarkError } = await supabase.storage
    .from('media')
    .upload(`${slug}/watermarked.jpg`, file);
    
  if (watermarkError) throw watermarkError;
  
  // Get the public URL for the watermarked file
  const { data: { publicUrl: watermarkUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(`${slug}/watermarked.jpg`);
    
  // Create the metadata record
  const { data, error } = await supabase
    .from('media_metadata')
    .insert([
      {
        ...metadata,
        media_url: mediaUrl,
        watermark_url: watermarkUrl,
        public_url: slug,
      },
    ])
    .select()
    .single();
    
  if (error) throw error;
  
  return data;
}; 