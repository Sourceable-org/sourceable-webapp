import React, { useState } from 'react';

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  timestamp: string;
  location: string;
  verificationUrl?: string;
}

const WatermarkedImage = ({ src, alt, className, timestamp, location, verificationUrl }: WatermarkedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {/* Main image */}
      <img
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
      />
      
      {!isLoading && (
        <>
          {/* Semi-transparent overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          {/* Black box with logo and URL */}
          <div className="absolute bottom-0 left-0 right-0 bg-black p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <img src="/images/image.png" alt="Sourceable Logo" className="h-6 w-auto" />
                <span className="text-white text-lg font-bold">Sourceable</span>
              </div>
              <div className="text-white/80 text-sm">
                <p>{timestamp}</p>
                {verificationUrl && (
                  <a 
                    href={verificationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/80 hover:text-white text-sm break-all"
                  >
                    {verificationUrl}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Corner watermark */}
          <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">Verified</span>
          </div>
        </>
      )}
      
      {/* GPS coordinates outside image frame */}
      <div className="mt-2 text-sm text-gray-600">
        <p>{location}</p>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
};

export default WatermarkedImage; 