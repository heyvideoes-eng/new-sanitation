import React from 'react';
import { MapContainer, TileLayer, Marker, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { FacilityData } from '../UI/FacilityCard';

// Fix for default marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [20, 32],
    iconAnchor: [10, 32]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface FacilityMapProps {
  facilities: FacilityData[];
  height?: string;
  zoom?: number;
  onMarkerClick?: (id: number) => void;
}

const FacilityMap: React.FC<FacilityMapProps> = ({ facilities, height = "100%", zoom = 14, onMarkerClick }) => {
  const center: [number, number] = [30.3165, 78.0322];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'GREEN': return '#10b981';
      case 'AMBER': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="w-full h-full relative z-0" style={{ height }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#02040a' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />
        {facilities.map((f) => (
          <React.Fragment key={f.id}>
            <Circle 
              center={[f.lat || 30.3165, f.lng || 78.0322] as any}
              radius={80}
              pathOptions={{ 
                fillColor: getStatusColor(f.current_status || 'GREEN'),
                color: getStatusColor(f.current_status || 'GREEN'),
                fillOpacity: 0.15,
                weight: 1
              }}
            />
            <Marker 
              position={[f.lat || 30.3165, f.lng || 78.0322] as any}
              eventHandlers={{
                click: () => onMarkerClick?.(f.id)
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default FacilityMap;

