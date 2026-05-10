import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import type { FacilityData } from '../UI/FacilityCard';

// Fix for default marker icons in Leaflet + React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface FacilityMapProps {
  facilities: FacilityData[];
  height?: string;
  zoom?: number;
}

const FacilityMap: React.FC<FacilityMapProps> = ({ facilities, height = "600px", zoom = 14 }) => {
  const navigate = useNavigate();
  const center: [number, number] = [30.3165, 78.0322]; // Dehradun ISBT area

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'GREEN': return '#22c55e';
      case 'AMBER': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="w-full rounded-[40px] overflow-hidden border border-white/5 shadow-2xl relative z-0" style={{ height }}>
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles-dark"
        />
        {facilities.map((f) => (
          <React.Fragment key={f.id}>
            <Circle 
              center={[f.lat || 30.3165, f.lng || 78.0322]}
              radius={100}
              pathOptions={{ 
                fillColor: getStatusColor(f.current_status || 'GREEN'),
                color: getStatusColor(f.current_status || 'GREEN'),
                fillOpacity: 0.2,
                weight: 1
              }}
            />
            <Marker position={[f.lat || 30.3165, f.lng || 78.0322]}>
              <Popup className="saaf-popup">
                <div className="p-2">
                  <h4 className="font-bold text-lg mb-1">{f.name}</h4>
                  <div className="text-xs text-gray-500 mb-3">{f.location}</div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: getStatusColor(f.current_status || 'GREEN') }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: getStatusColor(f.current_status || 'GREEN') }}>
                      {f.current_status} STATUS
                    </span>
                  </div>

                  {f.health?.verification_photo && (
                    <div className="mb-3 rounded-lg overflow-hidden border border-gray-200">
                      <img src={f.health.verification_photo} alt="Verification" className="w-full h-24 object-cover" />
                      <div className="bg-gray-50 p-1 text-[8px] text-gray-500 text-center font-bold">
                        LIVE VERIFICATION · {f.health.last_cleaned_at ? new Date(f.health.last_cleaned_at).toLocaleTimeString() : 'NOW'}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => navigate(`/facility/${f.id}`)}
                    className="w-full py-2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg"
                  >
                    Enter Neural View
                  </button>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default FacilityMap;
