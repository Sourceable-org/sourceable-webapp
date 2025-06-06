import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatCoordinates } from '../utils/gps';
import { formatTimestamp } from '../utils/timestamp';
import { MediaMetadata, supabase } from '../utils/supabase';
import Map from '../components/Map';
import WatermarkedImage from '../components/WatermarkedImage';

const VerifyScreen = () => {
  const { id } = useParams<{ id: string }>();
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      console.log('Fetching metadata for ID:', id);
      try {
        const { data, error } = await supabase
          .from('media_metadata')
          .select('*')
          .eq('public_url', id)
          .single();

        console.log('Supabase response:', { data, error });

        if (error) throw error;
        setMetadata(data);
      } catch (err) {
        console.error('Failed to fetch metadata:', err);
        setError('Failed to load verification data');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMetadata();
    } else {
      console.error('No ID provided in URL');
      setError('Invalid verification URL');
      setIsLoading(false);
    }
  }, [id]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    // TODO: Show success toast
  };

  const handleDownload = async () => {
    if (!metadata) return;
    
    try {
      const response = await fetch(metadata.watermark_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sourceable-${metadata.public_url}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
      // TODO: Show error toast
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !metadata) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full">
          <p className="text-red-600">{error || 'Verification data not found'}</p>
        </div>
      </div>
    );
  }

  console.log('Rendering with metadata:', metadata);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Media */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <WatermarkedImage
            src={metadata.media_url}
            alt="Verified media"
            className="w-full h-64 object-cover"
            timestamp={formatTimestamp(metadata.timestamp_local)}
            location={formatCoordinates(metadata.gps_lat, metadata.gps_lng)}
          />
        </div>

        {/* Metadata */}
        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1 text-gray-900">
              {formatCoordinates(metadata.gps_lat, metadata.gps_lng)}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Local Time</h3>
            <p className="mt-1 text-gray-900">
              {formatTimestamp(metadata.timestamp_local)}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">UTC Time</h3>
            <p className="mt-1 text-gray-900">
              {formatTimestamp(metadata.timestamp_utc, 'utc')}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Attribution</h3>
            <p className="mt-1 text-gray-900">
              Uploaded by {metadata.uploader_name || 'Anonymous'}
            </p>
          </div>

          {/* Map */}
          {metadata.gps_lat && metadata.gps_lng && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Location Map</h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <Map
                  center={[metadata.gps_lat, metadata.gps_lng]}
                  zoom={13}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={handleCopyLink}
            className="flex-1 btn btn-secondary"
          >
            Copy Link
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 btn btn-primary"
          >
            Download Media
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyScreen; 