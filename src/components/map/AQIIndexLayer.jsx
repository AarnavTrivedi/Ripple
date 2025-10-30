import { useEffect, useState, useMemo } from 'react';
import { Circle, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// EPA AQI Categories with official color standards
// Source: https://www.airnow.gov/aqi/aqi-basics/
const AQI_CATEGORIES = {
  good: { min: 0, max: 50, color: '#00e400', label: 'Good', icon: '😊' },
  moderate: { min: 51, max: 100, color: '#ffff00', label: 'Moderate', icon: '😐' },
  unhealthySensitive: { min: 101, max: 150, color: '#ff7e00', label: 'Unhealthy for Sensitive Groups', icon: '😷' },
  unhealthy: { min: 151, max: 200, color: '#ff0000', label: 'Unhealthy', icon: '😨' },
  veryUnhealthy: { min: 201, max: 300, color: '#8f3f97', label: 'Very Unhealthy', icon: '🚨' },
  hazardous: { min: 301, max: 500, color: '#7e0023', label: 'Hazardous', icon: '☠️' },
};

const getAQICategory = (aqi) => {
  for (const [key, category] of Object.entries(AQI_CATEGORIES)) {
    if (aqi >= category.min && aqi <= category.max) {
      return { key, ...category };
    }
  }
  return { key: 'good', ...AQI_CATEGORIES.good };
};

const createAQIIcon = (aqi, category) => {
  return new L.DivIcon({
    className: 'aqi-marker',
    html: `
      <div style="
        background-color: ${category.color};
        color: ${aqi > 150 ? '#fff' : '#000'};
        border: 3px solid white;
        border-radius: 50%;
        width: 48px;
        height: 48px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 13px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: transform 0.2s;
      ">
        <div style="font-size: 16px;">${category.icon}</div>
        <div style="font-size: 12px;">${aqi}</div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24]
  });
};

export default function AQIIndexLayer({ data, showCircles = true }) {
  const map = useMap();
  
  // Use useMemo for performance optimization - only recalculate when data changes
  const aqiStations = useMemo(() => {
    console.log('🎯 AQI Index Layer processing', data?.length || 0, 'data points');
    
    if (!data || data.length === 0) {
      console.log('⚠️ No AQI data available');
      return [];
    }

    // Convert air quality data to AQI stations with clustering
    // Group nearby points into stations for better performance
    const stations = [];
    const processed = new Set();
    
    data.forEach((point, idx) => {
      if (processed.has(idx)) return;
      
      // Find nearby points (within ~1.5km) - clustering radius
      const nearby = data.filter((p, i) => {
        if (processed.has(i)) return false;
        const distance = Math.sqrt(
          Math.pow(p.lat - point.lat, 2) + Math.pow(p.lng - point.lng, 2)
        );
        return distance < 0.015; // ~1.5km radius for clustering
      });
      
      // Calculate average AQI for the station
      const avgValue = nearby.reduce((sum, p) => sum + (p.value || 0), 0) / nearby.length;
      const aqi = Math.round(convertPM25ToAQI(avgValue));
      const category = getAQICategory(aqi);
      
      stations.push({
        id: `aqi-station-${idx}`,
        lat: point.lat,
        lng: point.lng,
        aqi,
        pm25: Math.round(avgValue),
        category,
        name: point.name || `Station ${stations.length + 1}`,
        timestamp: new Date().toISOString(),
        clusterSize: nearby.length, // Track cluster size for debugging
      });
      
      // Mark nearby points as processed (clustering)
      nearby.forEach(p => {
        const i = data.indexOf(p);
        if (i >= 0) processed.add(i);
      });
    });
    
    console.log('✅ Created', stations.length, 'AQI stations (clustered from', data.length, 'points)');
    return stations;
  }, [data]);

  if (!aqiStations || aqiStations.length === 0) {
    return null;
  }

  return (
    <>
      {aqiStations.map((station) => (
        <div key={station.id}>
          {/* AQI Circle Zone */}
          {showCircles && (
            <Circle
              center={[station.lat, station.lng]}
              radius={800} // ~800m radius per station
              pathOptions={{
                color: station.category.color,
                fillColor: station.category.color,
                fillOpacity: 0.15,
                weight: 2,
                opacity: 0.6,
              }}
            />
          )}
          
          {/* AQI Marker */}
          <Marker
            position={[station.lat, station.lng]}
            icon={createAQIIcon(station.aqi, station.category)}
          >
            <Popup className="aqi-popup">
              <div className="min-w-[220px] p-2">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{station.name}</h3>
                  <span className="text-2xl">{station.category.icon}</span>
                </div>
                
                <div 
                  className="p-3 rounded-lg mb-3 text-center"
                  style={{ 
                    backgroundColor: station.category.color,
                    color: station.aqi > 150 ? '#fff' : '#000'
                  }}
                >
                  <div className="text-sm font-medium opacity-90">Air Quality Index</div>
                  <div className="text-3xl font-bold">{station.aqi}</div>
                  <div className="text-sm font-semibold">{station.category.label}</div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">PM2.5:</span>
                    <span className="font-semibold">{station.pm25} μg/m³</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold">{station.category.label}</span>
                  </div>
                  
                  <div className="mt-3 p-2 bg-gray-50 rounded text-xs">
                    <p className="text-gray-600">
                      {getHealthAdvice(station.aqi)}
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-400 mt-2 text-center">
                  Updated: {new Date(station.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        </div>
      ))}
    </>
  );
}

// Convert PM2.5 to AQI using EPA formula
function convertPM25ToAQI(pm25) {
  // Breakpoints for PM2.5 to AQI conversion
  const breakpoints = [
    { pm_low: 0, pm_high: 12.0, aqi_low: 0, aqi_high: 50 },
    { pm_low: 12.1, pm_high: 35.4, aqi_low: 51, aqi_high: 100 },
    { pm_low: 35.5, pm_high: 55.4, aqi_low: 101, aqi_high: 150 },
    { pm_low: 55.5, pm_high: 150.4, aqi_low: 151, aqi_high: 200 },
    { pm_low: 150.5, pm_high: 250.4, aqi_low: 201, aqi_high: 300 },
    { pm_low: 250.5, pm_high: 500.4, aqi_low: 301, aqi_high: 500 },
  ];
  
  for (const bp of breakpoints) {
    if (pm25 >= bp.pm_low && pm25 <= bp.pm_high) {
      const aqi = ((bp.aqi_high - bp.aqi_low) / (bp.pm_high - bp.pm_low)) * 
                   (pm25 - bp.pm_low) + bp.aqi_low;
      return aqi;
    }
  }
  
  return pm25 > 500 ? 500 : 0;
}

// Get health advice based on AQI
function getHealthAdvice(aqi) {
  if (aqi <= 50) {
    return "Air quality is excellent. Perfect for outdoor activities!";
  } else if (aqi <= 100) {
    return "Air quality is acceptable. Sensitive individuals should consider limiting prolonged outdoor exertion.";
  } else if (aqi <= 150) {
    return "Sensitive groups should reduce prolonged outdoor exertion.";
  } else if (aqi <= 200) {
    return "Everyone should avoid prolonged outdoor exertion. Sensitive groups should remain indoors.";
  } else if (aqi <= 300) {
    return "Health alert! Everyone should avoid all outdoor physical activity.";
  } else {
    return "Health warning! Remain indoors and keep activity levels low.";
  }
}

