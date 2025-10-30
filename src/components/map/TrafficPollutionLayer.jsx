import { useEffect } from 'react';
import { Circle, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Car, Truck, AlertTriangle } from 'lucide-react';

// Traffic pollution levels
const TRAFFIC_LEVELS = {
  low: { min: 0, max: 20, color: '#10b981', label: 'Low', icon: '🟢' },
  moderate: { min: 21, max: 40, color: '#fbbf24', label: 'Moderate', icon: '🟡' },
  high: { min: 41, max: 70, color: '#f97316', label: 'High', icon: '🟠' },
  veryHigh: { min: 71, max: 100, color: '#ef4444', label: 'Very High', icon: '🔴' },
};

const getTrafficLevel = (pollution) => {
  for (const [key, level] of Object.entries(TRAFFIC_LEVELS)) {
    if (pollution >= level.min && pollution <= level.max) {
      return { key, ...level };
    }
  }
  return { key: 'low', ...TRAFFIC_LEVELS.low };
};

const createTrafficIcon = (pollution, level) => {
  return new L.DivIcon({
    className: 'traffic-pollution-marker',
    html: `
      <div style="
        background-color: ${level.color};
        border: 2px solid white;
        border-radius: 8px;
        padding: 6px 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        font-weight: bold;
        font-size: 11px;
        color: white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        white-space: nowrap;
      ">
        <span style="font-size: 14px;">${level.icon}</span>
        <span>${pollution}%</span>
      </div>
    `,
    iconSize: [60, 28],
    iconAnchor: [30, 14],
    popupAnchor: [0, -14]
  });
};

export default function TrafficPollutionLayer({ data, showRoads = true }) {
  const map = useMap();

  useEffect(() => {
    console.log('🚗 Traffic Pollution Layer mounted with', data?.length || 0, 'traffic zones');
  }, [data]);

  if (!data || data.length === 0) {
    console.log('⚠️ No traffic pollution data available');
    return null;
  }

  return (
    <>
      {data.map((zone) => (
        <div key={zone.id}>
          {/* Traffic pollution zone */}
          <Circle
            center={[zone.lat, zone.lng]}
            radius={zone.radius || 500}
            pathOptions={{
              color: zone.level.color,
              fillColor: zone.level.color,
              fillOpacity: 0.2,
              weight: 2,
              opacity: 0.7,
              dashArray: '5, 5',
            }}
          />

          {/* Traffic pollution marker */}
          <Marker
            position={[zone.lat, zone.lng]}
            icon={createTrafficIcon(zone.pollution, zone.level)}
          >
            <Popup className="traffic-popup">
              <div className="min-w-[240px] p-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    {zone.name}
                  </h3>
                  <span className="text-2xl">{zone.level.icon}</span>
                </div>

                <div 
                  className="p-3 rounded-lg mb-3 text-center text-white"
                  style={{ backgroundColor: zone.level.color }}
                >
                  <div className="text-sm font-medium opacity-90">Traffic Pollution</div>
                  <div className="text-3xl font-bold">{zone.pollution}%</div>
                  <div className="text-sm font-semibold">{zone.level.label}</div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Road Type:</span>
                    <span className="font-semibold capitalize">{zone.roadType}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Traffic Density:</span>
                    <span className="font-semibold">{zone.density}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">CO₂ Level:</span>
                    <span className="font-semibold">{zone.co2} ppm</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">NO₂ Level:</span>
                    <span className="font-semibold">{zone.no2} μg/m³</span>
                  </div>

                  {zone.congestion && (
                    <div className="flex items-center gap-2 p-2 bg-amber-50 rounded text-xs mt-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-800 font-medium">
                        Congested Area - High Emissions
                      </span>
                    </div>
                  )}

                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <p className="text-gray-600">
                      {getTrafficAdvice(zone.pollution, zone.level.key)}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-400 mt-2 text-center">
                  Updated: {new Date(zone.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Road segment polyline */}
          {showRoads && zone.roadSegments && (
            <Polyline
              positions={zone.roadSegments}
              pathOptions={{
                color: zone.level.color,
                weight: 6,
                opacity: 0.7,
                dashArray: zone.congestion ? '10, 10' : null,
              }}
            />
          )}
        </div>
      ))}
    </>
  );
}

// Get traffic advice based on pollution level
function getTrafficAdvice(pollution, levelKey) {
  if (levelKey === 'low') {
    return "Low traffic pollution. Safe for outdoor activities and walking near roads.";
  } else if (levelKey === 'moderate') {
    return "Moderate traffic pollution. Consider using alternative routes for walking or cycling.";
  } else if (levelKey === 'high') {
    return "High traffic pollution. Avoid prolonged exposure. Use sidewalks away from traffic.";
  } else {
    return "Very high traffic pollution. Avoid this area if possible. Consider alternative routes.";
  }
}

