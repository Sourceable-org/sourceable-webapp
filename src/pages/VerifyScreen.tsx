import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { formatCoordinates, formatApproxCoordinates } from '../utils/gps';
import { formatTimestamp } from '../utils/timestamp';
import { MediaMetadata, supabase } from '../utils/supabase';
import Map from '../components/Map';
import WatermarkedImage from '../components/WatermarkedImage';
import { addWatermark, addVideoWatermark } from '../utils/watermark';

const VerifyScreen = () => {
  const { id } = useParams<{ id: string }>();
  const [metadata, setMetadata] = useState<MediaMetadata | null>(null);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const verificationUrl = `${window.location.origin}/verify/${id}`;

  const getMediaType = (url: string): 'image' | 'video' => {
    const extension = url.split('.').pop()?.toLowerCase();
    return extension === 'mp4' ? 'video' : 'image';
  };

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
  };

  const handleDownload = async () => {
    if (!metadata) return;

    try {
      const response = await fetch(metadata.media_url);
      const blob = await response.blob();
      const mediaUrl = URL.createObjectURL(blob);

      let watermarkedUrl: string;
      const watermarkOptions = {
        logoUrl: '/images/image.png',
        verificationUrl: verificationUrl,
        gpsPrecision: metadata.gps_precision,
        gpsRadiusMiles: metadata.gps_radius_miles,
        timestamp: formatTimestamp(metadata.timestamp_local),
      };

      const mediaType = getMediaType(metadata.media_url);
      if (mediaType === 'video') {
        watermarkedUrl = await addVideoWatermark(mediaUrl, watermarkOptions);
      } else {
        watermarkedUrl = await addWatermark(mediaUrl, watermarkOptions);
      }

      const a = document.createElement('a');
      a.href = watermarkedUrl;
      a.download = `sourceable-${metadata.public_url}.${mediaType === 'video' ? 'webm' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(mediaUrl);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Download failed:', err);
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

  const renderLocationLabel = () => {
    if (metadata.gps_precision === 'exact') {
      return formatCoordinates(metadata.gps_lat, metadata.gps_lng, 'exact');
    } else {
      return `Within ${metadata.gps_radius_miles} mile radius`;
    }
  };

  const renderApproxCoordinates = () => {
    if (metadata.gps_lat !== undefined && metadata.gps_lng !== undefined) {
      return formatApproxCoordinates(metadata.gps_lat, metadata.gps_lng);
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          {metadata && getMediaType(metadata.media_url) === 'video' ? (
            <video
              src={metadata.media_url}
              controls
              className="w-full h-64 object-cover"
            />
          ) : (
            <WatermarkedImage
              src={metadata?.media_url || ''}
              alt="Verified media"
              className="w-full h-64 object-cover"
              timestamp={formatTimestamp(metadata?.timestamp_local || '')}
              location={renderLocationLabel()}
              verificationUrl={verificationUrl}
            />
          )}
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <p className="mt-1 text-gray-900">
              {renderLocationLabel()}
            </p>
            <p className="mt-1 text-gray-500 text-sm italic">
              Approx. coordinates: {renderApproxCoordinates()}
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

          {metadata.gps_lat && metadata.gps_lng && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Location Map</h3>
              <div className="h-64 rounded-lg overflow-hidden">
                <Map
                  center={[metadata.gps_lat, metadata.gps_lng]}
                  zoom={13}
                  radiusMiles={metadata.gps_precision !== 'exact' ? metadata.gps_radius_miles : undefined}
                />
              </div>
            </div>
          )}
        </div>

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
