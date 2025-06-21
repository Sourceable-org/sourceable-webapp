import { GPSPrecision } from '../components/GPSPrecisionSelector';

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface ReverseGeocodeResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number; accuracy: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(new Error(`Failed to get location: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  });
};

export const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en-US,en;q=0.9',
        },
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }
    
    const data: ReverseGeocodeResult = await response.json();
    
    // Extract the most relevant location name
    const address = data.address;
    const locationParts = [];
    
    if (address.city) {
      locationParts.push(address.city);
    } else if (address.town) {
      locationParts.push(address.town);
    } else if (address.village) {
      locationParts.push(address.village);
    }
    
    if (address.state) {
      locationParts.push(address.state);
    }
    
    if (address.country) {
      locationParts.push(address.country);
    }
    
    // If we couldn't extract specific parts, use the display name
    if (locationParts.length === 0) {
      const displayParts = data.display_name.split(', ');
      return displayParts.slice(0, 2).join(', ');
    }
    
    return locationParts.join(', ');
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    // Fallback to coordinates if reverse geocoding fails
    return `${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°W`;
  }
};

export const formatCoordinates = (
  latitude: number,
  longitude: number,
  precision: GPSPrecision = 'exact'
): string => {
  const latDegrees = Math.floor(Math.abs(latitude));
  const latMinutes = Math.floor((Math.abs(latitude) - latDegrees) * 60);
  const latSeconds = ((Math.abs(latitude) - latDegrees - latMinutes / 60) * 3600).toFixed(2);
  const latDirection = latitude >= 0 ? 'N' : 'S';

  const lngDegrees = Math.floor(Math.abs(longitude));
  const lngMinutes = Math.floor((Math.abs(longitude) - lngDegrees) * 60);
  const lngSeconds = ((Math.abs(longitude) - lngDegrees - lngMinutes / 60) * 3600).toFixed(2);
  const lngDirection = longitude >= 0 ? 'E' : 'W';

  // Format based on precision
  if (precision === 'exact') {
    return `${latDegrees}°${latMinutes}'${latSeconds}"${latDirection}, ${lngDegrees}°${lngMinutes}'${lngSeconds}"${lngDirection}`;
  } else {
    // For 5mile, 10mile, 20mile — only show deg + min + dir
    return `${latDegrees}°${latMinutes}'${latDirection}, ${lngDegrees}°${lngMinutes}'${lngDirection}`;
  }
};

export function formatApproxCoordinates(lat: number, lng: number): string {
  const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`;
  const lngStr = `${Math.abs(lng).toFixed(2)}°${lng >= 0 ? 'E' : 'W'}`;
  return `${latStr}, ${lngStr}`;
}
