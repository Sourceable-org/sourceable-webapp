import { GPSPrecision } from '../components/GPSPrecisionSelector';

interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
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
