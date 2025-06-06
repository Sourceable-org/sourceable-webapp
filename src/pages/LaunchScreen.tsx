import { useNavigate } from 'react-router-dom';

const LaunchScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-600">Sourceable</h1>
          <p className="mt-2 text-gray-600">Capture verifiable moments</p>
        </div>

        {/* App Description */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <p className="text-gray-600 mb-6">
            Capture photos with verified time and location data. Generate a public verification page
            that proves when and where your photo was taken.
          </p>

          {/* Capture Button */}
          <button
            onClick={() => navigate('/capture')}
            className="w-full btn btn-primary"
          >
            Capture Media
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="h-5 w-5 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm text-gray-600">Verified Timestamp</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="h-5 w-5 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm text-gray-600">GPS Location</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <svg
              className="h-5 w-5 text-primary-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="text-sm text-gray-600">Anonymous by Default</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaunchScreen; 