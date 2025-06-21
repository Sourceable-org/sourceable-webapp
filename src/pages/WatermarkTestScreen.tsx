import React, { useState, useEffect } from 'react';
import { 
  createDiagonalWatermark, 
  createCornerWatermark, 
  createFullOverlayWatermark, 
  createMinimalistBorderWatermark, 
  createModernGradientWatermark 
} from '../utils/watermarkDesigns';

const WatermarkTestScreen: React.FC = () => {
  const [watermarkedImages, setWatermarkedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const watermarkOptions = {
    logoUrl: '/images/sourceable.png',
    verificationUrl: 'https://sourceable.com/verify',
    timestamp: new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    }),
    location: 'Mumbai, India',
    gpsLat: 19.076,
    gpsLng: 72.8777
  };

  useEffect(() => {
    const generateWatermarks = async () => {
      try {
        setLoading(true);
        const testImageUrl = '/images/test.png';
        
        const designs = [
          { name: 'Diagonal Watermark', func: createDiagonalWatermark },
          { name: 'Corner Watermark', func: createCornerWatermark },
          { name: 'Full Overlay Watermark', func: createFullOverlayWatermark },
          { name: 'Minimalist Border Watermark', func: createMinimalistBorderWatermark },
          { name: 'Modern Gradient Watermark', func: createModernGradientWatermark }
        ];

        const results = await Promise.all(
          designs.map(design => design.func(testImageUrl, watermarkOptions))
        );

        setWatermarkedImages(results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate watermarks');
      } finally {
        setLoading(false);
      }
    };

    generateWatermarks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg">Generating watermark designs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  const designNames = [
    'Design 1: Diagonal Watermark',
    'Design 2: Corner Watermark', 
    'Design 3: Full Overlay Watermark',
    'Design 4: Minimalist Border Watermark',
    'Design 5: Modern Gradient Watermark'
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Watermark Design Comparison
          </h1>
          <p className="text-lg text-gray-600">
            Choose your preferred watermark design for your photos
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {watermarkedImages.map((imageUrl, index) => (
            <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="p-4 bg-blue-50 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  {designNames[index]}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {index === 0 && "Large diagonal watermark with footer details"}
                  {index === 1 && "Corner watermark with logo and information"}
                  {index === 2 && "Repeating logo pattern overlay"}
                  {index === 3 && "Clean border design with minimal interference"}
                  {index === 4 && "Modern gradient with subtle diagonal text"}
                </p>
              </div>
              
              <div className="p-4">
                <img 
                  src={imageUrl} 
                  alt={`Watermark Design ${index + 1}`}
                  className="w-full h-auto rounded border"
                />
              </div>

              <div className="p-4 bg-gray-50">
                <div className="text-sm text-gray-600 space-y-1">
                  <div><strong>Features:</strong></div>
                  <div>• Sourceable logo and branding</div>
                  <div>• Timestamp: {watermarkOptions.timestamp}</div>
                  <div>• Location: {watermarkOptions.location}</div>
                  <div>• Verification URL: {watermarkOptions.verificationUrl}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Design Features Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Design 1: Diagonal</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Prominent diagonal watermark</li>
                  <li>• Hard to crop out</li>
                  <li>• Professional footer with details</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Design 2: Corner</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Top-right corner placement</li>
                  <li>• Compact information display</li>
                  <li>• Clean and professional look</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Design 3: Full Overlay</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Repeating logo pattern</li>
                  <li>• Very difficult to remove</li>
                  <li>• Subtle but comprehensive coverage</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Design 4: Minimalist Border</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Clean border design</li>
                  <li>• Minimal image interference</li>
                  <li>• Professional appearance</li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-gray-900 mb-2">Design 5: Modern Gradient</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Subtle gradient overlay</li>
                  <li>• Large diagonal text watermark</li>
                  <li>• Modern gradient footer</li>
                  <li>• Professional and contemporary look</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WatermarkTestScreen; 