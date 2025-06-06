import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentLocation } from '../utils/gps';
import { getCurrentTimestamps } from '../utils/timestamp';

interface CaptureData {
  image: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamps: {
    local: string;
    utc: string;
  };
}

const CaptureScreen = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    const setupCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        setError('Could not access camera. Please ensure you have granted camera permissions.');
      }
    };

    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = async () => {
    if (!videoRef.current || !stream) return;

    setIsCapturing(true);
    try {
      // Create canvas and capture frame
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(videoRef.current, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg');

      // Get location and timestamp
      const location = await getCurrentLocation();
      const timestamps = getCurrentTimestamps();

      // Store data in session storage for next screen
      const captureData: CaptureData = {
        image: imageData,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
        },
        timestamps,
      };

      sessionStorage.setItem('captureData', JSON.stringify(captureData));
      navigate('/confirm');
    } catch (err) {
      setError('Failed to capture photo. Please try again.');
    } finally {
      setIsCapturing(false);
    }
  };

  const handleCancel = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full">
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleCancel}
            className="mt-4 w-full btn btn-secondary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Camera View */}
      <div className="flex-1 relative bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      </div>

      {/* Controls */}
      <div className="bg-white p-4 flex justify-center space-x-4">
        <button
          onClick={handleCancel}
          className="btn btn-secondary"
          disabled={isCapturing}
        >
          Cancel
        </button>
        <button
          onClick={capturePhoto}
          className="btn btn-primary"
          disabled={isCapturing}
        >
          {isCapturing ? 'Capturing...' : 'Capture'}
        </button>
      </div>
    </div>
  );
};

export default CaptureScreen; 