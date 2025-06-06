import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { MediaMetadata } from '../utils/supabase';

const PostPublishScreen = () => {
  const navigate = useNavigate();
  const [verificationUrl, setVerificationUrl] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadUploadResult = async () => {
      const storedResult = sessionStorage.getItem('uploadResult');
      if (!storedResult) {
        navigate('/');
        return;
      }

      try {
        const result: MediaMetadata = JSON.parse(storedResult);
        const url = `${window.location.origin}/verify/${result.public_url}`;
        setVerificationUrl(url);

        // Generate QR code
        const qrCode = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrCodeUrl(qrCode);
      } catch (err) {
        console.error('Failed to load upload result:', err);
        setError('Failed to load verification data');
      }
    };

    loadUploadResult();
  }, [navigate]);

  const handleViewPage = () => {
    window.open(verificationUrl, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    // TODO: Show success toast
  };

  const handleNewCapture = () => {
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 p-4 rounded-lg max-w-md w-full">
          <p className="text-red-600">{error}</p>
          <button
            onClick={handleNewCapture}
            className="mt-4 w-full btn btn-secondary"
          >
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Success Message */}
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-medium text-gray-900">
            Verification Page Created!
          </h2>
          <p className="mt-2 text-gray-600">
            Your media has been successfully uploaded and verified.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={handleViewPage}
            className="w-full btn btn-primary"
          >
            View Verification Page
          </button>
          <button
            onClick={handleCopyLink}
            className="w-full btn btn-secondary"
          >
            Copy Verification Link
          </button>
          <button
            onClick={handleNewCapture}
            className="w-full btn btn-secondary"
          >
            Capture New Media
          </button>
        </div>

        {/* QR Code */}
        {qrCodeUrl && (
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Scan to View
            </h3>
            <img
              src={qrCodeUrl}
              alt="QR Code"
              className="w-48 h-48 mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPublishScreen; 