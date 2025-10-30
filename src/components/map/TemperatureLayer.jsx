import { useEffect } from 'react';
import { Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Thermometer, Wind, Droplets, Sun, Cloud, CloudRain } from 'lucide-react';

// Temperature ranges with colors
const TEMP_RANGES = {
  freezing: { min: -50, max: 32, color: '#60a5fa', label: 'Freezing', icon: '❄️' },
  cold: { min: 33, max: 50, color: '#93c5fd', label: 'Cold', icon: '🥶' },
  cool: { min: 51, max: 60, color: '#bfdbfe', label: 'Cool', icon: '😌' },
  mild: { min: 61, max: 70, color: '#86efac', label: 'Mild', icon: '😊' },
  warm: { min: 71, max: 80, color: '#fbbf24', label: 'Warm', icon: '☀️' },
  hot: { min: 81, max: 95, color: '#f97316', label: 'Hot', icon: '🥵' },
  veryHot: { min: 96, max: 150, color: '#dc2626', label: 'Very Hot', icon: '🔥' },
};

const getTempRange = (temp) => {
  for (const [key, range] of Object.entries(TEMP_RANGES)) {
    if (temp >= range.min && temp <= range.max) {
      return { key, ...range };
    }
  }
  return { key: 'mild', ...TEMP_RANGES.mild };
};

const createTempIcon = (temp, range, isFahrenheit = true) => {
  return new L.DivIcon({
    className: 'temperature-marker',
    html: `
      <div style="
        background: linear-gradient(135deg, ${range.color} 0%, ${adjustColor(range.color, -20)} 100%);
        color: ${['freezing', 'cold', 'cool'].includes(range.key) ? '#000' : '#fff'};
        border: 3px solid white;
        border-radius: 12px;
        padding: 8px 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        font-weight: bold;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        min-width: 60px;
      ">
        <div style="font-size: 18px; margin-bottom: 2px;">${range.icon}</div>
        <div style="font-size: 16px;">${Math.round(temp)}°${isFahrenheit ? 'F' : 'C'}</div>
      </div>
    `,
    iconSize: [60, 56],
    iconAnchor: [30, 28],
    popupAnchor: [0, -28]
  });
};

// Helper to adjust color brightness
function adjustColor(color, percent) {
  const num = parseInt(color.replace("#",""), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
    (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
    .toString(16).slice(1);
}

export default function TemperatureLayer({ data, showZones = true, unit = 'F' }) {
  const map = useMap();

  useEffect(() => {
    console.log('🌡️ Temperature Layer mounted with', data?.length || 0, 'temperature zones');
  }, [data]);

  if (!data || data.length === 0) {
    console.log('⚠️ No temperature data available');
    return null;
  }

  return (
    <>
      {data.map((zone) => {
        const isFahrenheit = unit === 'F';
        
        return (
          <div key={zone.id}>
            {/* Temperature zone circle */}
            {showZones && (
              <Circle
                center={[zone.lat, zone.lng]}
                radius={zone.radius || 1000}
                pathOptions={{
                  color: zone.range.color,
                  fillColor: zone.range.color,
                  fillOpacity: 0.15,
                  weight: 2,
                  opacity: 0.5,
                }}
              />
            )}

            {/* Temperature marker */}
            <Marker
              position={[zone.lat, zone.lng]}
              icon={createTempIcon(zone.temp, zone.range, isFahrenheit)}
            >
              <Popup className="temperature-popup">
                <div className="min-w-[260px] p-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Thermometer className="w-5 h-5" />
                      {zone.name}
                    </h3>
                    <span className="text-3xl">{zone.range.icon}</span>
                  </div>

                  <div 
                    className="p-4 rounded-lg mb-3 text-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${zone.range.color} 0%, ${adjustColor(zone.range.color, -20)} 100%)`,
                      color: ['freezing', 'cold', 'cool'].includes(zone.range.key) ? '#000' : '#fff'
                    }}
                  >
                    <div className="text-sm font-medium opacity-90">Current Temperature</div>
                    <div className="text-4xl font-bold my-1">
                      {Math.round(zone.temp)}°{isFahrenheit ? 'F' : 'C'}
                    </div>
                    <div className="text-sm font-semibold">{zone.range.label}</div>
                    {zone.tempCelsius && isFahrenheit && (
                      <div className="text-xs opacity-75 mt-1">
                        ({Math.round(zone.tempCelsius)}°C)
                      </div>
                    )}
                  </div>

                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Thermometer className="w-4 h-4" />
                        Feels Like:
                      </span>
                      <span className="font-semibold">
                        {Math.round(zone.feelsLike)}°{isFahrenheit ? 'F' : 'C'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Droplets className="w-4 h-4" />
                        Humidity:
                      </span>
                      <span className="font-semibold">{zone.humidity}%</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 flex items-center gap-1">
                        <Wind className="w-4 h-4" />
                        Wind Speed:
                      </span>
                      <span className="font-semibold">{zone.windSpeed} mph</span>
                    </div>

                    {zone.uvIndex !== undefined && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1">
                          <Sun className="w-4 h-4" />
                          UV Index:
                        </span>
                        <span className="font-semibold">{zone.uvIndex} - {getUVLevel(zone.uvIndex)}</span>
                      </div>
                    )}

                    {zone.conditions && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 flex items-center gap-1">
                          {getWeatherIcon(zone.conditions)}
                          Conditions:
                        </span>
                        <span className="font-semibold capitalize">{zone.conditions}</span>
                      </div>
                    )}

                    <div className="mt-3 p-2.5 bg-gray-50 rounded text-xs">
                      <p className="text-gray-700 font-medium mb-1">💡 Recommendation:</p>
                      <p className="text-gray-600">
                        {getTempAdvice(zone.temp, zone.range.key, zone.humidity)}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-400 mt-2 text-center">
                    Updated: {new Date(zone.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        );
      })}
    </>
  );
}

// Get weather icon component
function getWeatherIcon(conditions) {
  const conditionsLower = conditions?.toLowerCase() || '';
  if (conditionsLower.includes('rain')) return <CloudRain className="w-4 h-4" />;
  if (conditionsLower.includes('cloud')) return <Cloud className="w-4 h-4" />;
  return <Sun className="w-4 h-4" />;
}

// Get UV level description
function getUVLevel(uvIndex) {
  if (uvIndex <= 2) return 'Low';
  if (uvIndex <= 5) return 'Moderate';
  if (uvIndex <= 7) return 'High';
  if (uvIndex <= 10) return 'Very High';
  return 'Extreme';
}

// Get temperature advice
function getTempAdvice(temp, rangeKey, humidity) {
  if (rangeKey === 'freezing') {
    return "Dress warmly in layers. Limit outdoor exposure. Watch for ice.";
  } else if (rangeKey === 'cold') {
    return "Wear warm clothing. Great for winter activities with proper gear.";
  } else if (rangeKey === 'cool') {
    return "Light jacket recommended. Comfortable for outdoor activities.";
  } else if (rangeKey === 'mild') {
    return "Perfect weather for outdoor activities! Enjoy the pleasant conditions.";
  } else if (rangeKey === 'warm') {
    return "Stay hydrated. Comfortable but consider lighter clothing.";
  } else if (rangeKey === 'hot') {
    return `Stay hydrated! ${humidity > 70 ? 'High humidity may make it feel hotter.' : 'Seek shade during peak hours.'}`;
  } else {
    return "Extreme heat! Stay indoors if possible. Stay hydrated and avoid strenuous activities.";
  }
}

