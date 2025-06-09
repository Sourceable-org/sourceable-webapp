import React from 'react';

export type GPSPrecision = 'exact' | '5mi' | '10mi' | '20mi';

interface GPSPrecisionSelectorProps {
  value: GPSPrecision;
  onChange: (precision: GPSPrecision) => void;
}

const GPSPrecisionSelector: React.FC<GPSPrecisionSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        GPS Display Precision
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange('exact')}
          className={`px-4 py-2 text-sm rounded-lg border ${
            value === 'exact'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          Exact Location
        </button>
        <button
          type="button"
          onClick={() => onChange('5mi')}
          className={`px-4 py-2 text-sm rounded-lg border ${
            value === '5mi'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          5-mile Radius
        </button>
        <button
          type="button"
          onClick={() => onChange('10mi')}
          className={`px-4 py-2 text-sm rounded-lg border ${
            value === '10mi'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          10-mile Radius
        </button>
        <button
          type="button"
          onClick={() => onChange('20mi')}
          className={`px-4 py-2 text-sm rounded-lg border ${
            value === '20mi'
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          20-mile Radius
        </button>
      </div>
    </div>
  );
};

export default GPSPrecisionSelector; 