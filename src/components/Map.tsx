import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  center: [number, number];
  zoom: number;
  radiusMiles?: number;
}

const Map = ({ center, zoom, radiusMiles }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    if (radiusMiles && radiusMiles > 0) {
      const radiusMeters = radiusMiles * 1609.34;
      const circle = L.circle(center, {
        radius: radiusMeters,
        color: 'blue',
        fillColor: '#blue',
        fillOpacity: 0.2
      }).addTo(map);
      circle.bindPopup(`
        <strong>Approximate location</strong><br/>
        Center: ${center[0].toFixed(4)}, ${center[1].toFixed(4)}<br/>
        Radius: ${radiusMiles} miles
      `).openPopup();
    } else {
      const marker = L.marker(center).addTo(map);
      marker.bindPopup('Photo taken here').openPopup();
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, radiusMiles]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%' }} />;
};

export default Map;
