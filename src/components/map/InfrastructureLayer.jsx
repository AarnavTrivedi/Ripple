import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Zap, Train, Bus } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// Create custom icons for different types
const createCustomIcon = (IconComponent, color) => {
  const iconMarkup = renderToStaticMarkup(
    <div style={{
      backgroundColor: color,
      borderRadius: '50%',
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '3px solid white',
      boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
    }}>
      <IconComponent color="white" size={18} />
    </div>
  );

  return L.divIcon({
    html: iconMarkup,
    className: 'custom-marker-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

const evIcon = createCustomIcon(Zap, '#3b82f6');
const transitIcon = createCustomIcon(Train, '#8b5cf6');
const busIcon = createCustomIcon(Bus, '#f59e0b');

function getIcon(type) {
  if (type === 'ev_charging') return evIcon;
  if (type === 'bus_station') return busIcon;
  return transitIcon;
}

export default function InfrastructureLayer({ evCharging = [], publicTransit = [], showEV = true, showTransit = true }) {
  console.log('⚡ Rendering infrastructure:', {
    evCharging: evCharging.length,
    publicTransit: publicTransit.length,
    showEV,
    showTransit
  });

  return (
    <>
      {/* EV Charging Stations */}
      {showEV && evCharging.map((station) => (
        <Marker
          key={station.id}
          position={[station.lat, station.lng]}
          icon={evIcon}
        >
          <Popup>
            <div className="p-2 min-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-sm">{station.name}</h3>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p>⚡ EV Charging Station</p>
                {station.capacity && <p>Capacity: {station.capacity}</p>}
                {station.socketType && <p>Socket: {station.socketType}</p>}
                {station.operator && <p>Operator: {station.operator}</p>}
              </div>
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800">
                🔌 Zero-emission charging available
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Public Transit Stations */}
      {showTransit && publicTransit.map((station) => (
        <Marker
          key={station.id}
          position={[station.lat, station.lng]}
          icon={getIcon(station.type)}
        >
          <Popup>
            <div className="p-2 min-w-[220px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  {station.type === 'bus_station' ? (
                    <Bus className="w-4 h-4 text-white" />
                  ) : (
                    <Train className="w-4 h-4 text-white" />
                  )}
                </div>
                <h3 className="font-semibold text-sm">{station.name}</h3>
              </div>
              <div className="text-xs text-gray-600 space-y-1">
                <p className="capitalize">Type: {station.type.replace('_', ' ')}</p>
                {station.lines && <p>Lines: {station.lines}</p>}
                {station.operator && <p>Operator: {station.operator}</p>}
              </div>
              <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-800">
                🚇 Public transit reduces carbon emissions by 45% vs driving
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}

