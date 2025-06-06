import React, { useState } from 'react';

interface WatermarkedImageProps {
  src: string;
  alt: string;
  className?: string;
  timestamp: string;
  location: string;
}

const WatermarkedImage = ({ src, alt, className, timestamp, location }: WatermarkedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
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
          
          {/* Watermark text */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="text-white space-y-2">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xl font-bold">Sourceable</span>
              </div>
              <div className="text-sm space-y-1">
                <p className="text-white/90">{location}</p>
                <p className="text-white/90">{timestamp}</p>
              </div>
            </div>
          </div>

          {/* Corner watermark */}
          <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full">
            <span className="text-white text-sm font-medium">Verified</span>
          </div>
        </>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
};

export default WatermarkedImage; 