import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentLocation } from '../utils/gps';
import { getCurrentTimestamps } from '../utils/timestamp';

interface CaptureData {
  media: string;
  mediaType: 'image' | 'video';
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamps: {
    local: string;
    utc: string;
  };
  facingMode: 'environment' | 'user';   // added
  rotationAngle: number;                // added
}

export const CaptureScreen: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startCamera = async () => {
    try {
      if (cameraBusy) return;
      setCameraBusy(true);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const constraints = {
        video: {
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: mode === 'video'
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      streamRef.current = stream;
      setIsCameraActive(true);
      setError(null);
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please check your permissions.');
    } finally {
      setCameraBusy(false);
    }
  };

  const stopCamera = async () => {
    setCameraBusy(true);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setCameraBusy(false);
  };

  const toggleCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  useEffect(() => {
    let permissionStatus: PermissionStatus | null = null;

    const initializeCamera = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');

        if (!hasCamera) {
          setError('No camera found on your device.');
          return;
        }

        permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });

        const handlePermissionChange = () => {
          if (permissionStatus?.state === 'granted') {
            startCamera();
          } else if (permissionStatus?.state === 'denied') {
            stopCamera();
            setError('Camera access is blocked. Please enable camera access in your browser settings.');
          }
        };

        permissionStatus.onchange = handlePermissionChange;

        if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
          startCamera();
        } else {
          setError('Camera access is blocked. Please enable camera access in your browser settings.');
        }
      } catch (err) {
        startCamera();
      }
    };

    initializeCamera();

    return () => {
      stopCamera();
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, []);

  useEffect(() => {
    const switchCamera = async () => {
      await stopCamera();
      await startCamera();
    };

    switchCamera();
  }, [mode, facingMode]);

  // Rotate video based on device orientation
  useEffect(() => {
    const handleOrientationChange = () => {
      let angle = 0;

      if (screen.orientation && screen.orientation.angle !== undefined) {
        angle = screen.orientation.angle;
      } else if (window.orientation !== undefined) {
        angle = (window.orientation as number) || 0;
      }

      if (videoRef.current) {
        videoRef.current.style.transform = `rotate(${-angle}deg) ${
          facingMode === 'user' ? ' scaleX(-1)' : ''
        }`;
      }
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
    }

    handleOrientationChange();

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      if (screen.orientation) {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      }
    };
  }, [facingMode]);

  const handleCapture = async () => {
    if (!videoRef.current || !streamRef.current) {
      setError('Camera not ready. Please try again.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      ctx.drawImage(videoRef.current, 0, 0);

      const imageBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create image blob'));
        }, 'image/jpeg', 0.8);
      });

      const location = await getCurrentLocation();
      const timestamps = getCurrentTimestamps();

      const angle = screen.orientation?.angle ?? (window.orientation as number) ?? 0;

      const captureData: CaptureData = {
        media: URL.createObjectURL(imageBlob),
        mediaType: 'image',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy
        },
        timestamps,
        facingMode,
        rotationAngle: angle
      };

      sessionStorage.setItem('captureData', JSON.stringify(captureData));
      navigate('/confirm');
    } catch (err) {
      setError('Failed to capture image. Please try again.');
      console.error('Capture error:', err);
    }
  };

  const handleVideoStart = () => {
    if (!videoRef.current || !streamRef.current) {
      setError('Camera not ready. Please try again.');
      return;
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp8,opus',
        videoBitsPerSecond: 1000000,
        audioBitsPerSecond: 128000
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        try {
          const videoBlob = new Blob(chunksRef.current, { type: 'video/webm' });
          const videoUrl = URL.createObjectURL(videoBlob);

          const location = await getCurrentLocation();
          const timestamps = getCurrentTimestamps();

          const angle = screen.orientation?.angle ?? (window.orientation as number) ?? 0;

          const captureData: CaptureData = {
            media: videoUrl,
            mediaType: 'video',
            location: {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy
            },
            timestamps,
            facingMode,
            rotationAngle: angle
          };

          sessionStorage.setItem('captureData', JSON.stringify(captureData));
          navigate('/confirm');
        } catch (err) {
          setError('Failed to process video. Please try again.');
          console.error('Video processing error:', err);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setError(null);
    } catch (err) {
      setError('Failed to start recording. Please try again.');
      console.error('Recording error:', err);
    }
  };

  const handleVideoStop = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleBack = () => {
    stopCamera();
    navigate('/');
  };

  return (
    <div className="h-screen flex flex-col bg-black">
      <div className="relative flex-1">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out"
        />
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-90 z-20">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm mx-4 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Camera Access Required
                </h3>
                <p className="text-gray-600 text-center mb-6">{error}</p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={async () => {
                      setError(null);
                      try {
                        const permissions = await navigator.permissions.query({
                          name: 'camera' as PermissionName
                        });
                        if (permissions.state === 'granted' || permissions.state === 'prompt') {
                          await startCamera();
                        } else {
                          setError('Camera access is still blocked. Please enable camera access in your browser settings.');
                        }
                      } catch {
                        await startCamera();
                      }
                    }}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={handleBack}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-75 p-4 z-10">
        <div className="flex justify-center mb-4">
          <div className="bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setMode('photo')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'photo' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Photo
            </button>
            <button
              onClick={() => setMode('video')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                mode === 'video' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Video
            </button>
          </div>
        </div>

        <div className="flex justify-center items-center gap-4">
        <button
  onClick={handleBack}
  className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
>
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19l-7-7 7-7"
    />
  </svg>
</button>


          {mode === 'photo' ? (
            <button
              onClick={handleCapture}
              className="p-4 rounded-full bg-white hover:bg-gray-100 transition-colors"
            >
              <div className="w-16 h-16 rounded-full border-4 border-gray-800" />
            </button>
          ) : (
            <button
              onClick={isRecording ? handleVideoStop : handleVideoStart}
              className={`p-4 rounded-full transition-colors ${
                isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-white hover:bg-gray-100'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full border-4 ${
                  isRecording ? 'border-white' : 'border-gray-800'
                }`}
              />
            </button>
          )}

          <button
            onClick={toggleCamera}
            className="p-3 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptureScreen;
