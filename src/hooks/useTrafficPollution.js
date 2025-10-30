import { useState, useEffect, useRef } from 'react';

// TomTom Traffic API (free tier available)
// OpenWeatherMap can also provide air pollution near roads
const OWM_API_KEY = '549ab6fbf6d6452588835e84e3c6c0e7'; // Replace with your key
const OWM_API = 'https://api.openweathermap.org/data/2.5/air_pollution';

export function useTrafficPollution(center, radius = 5000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastCenter = useRef(null);
  const dataFetched = useRef(false);

  useEffect(() => {
    if (!center) {
      console.log('🚗 Traffic Pollution Hook: No center location yet');
      return;
    }

    // Prevent infinite loop - only fetch if location changed significantly
    if (lastCenter.current) {
      const [lastLat, lastLng] = lastCenter.current;
      const [newLat, newLng] = center;
      const distance = Math.sqrt(
        Math.pow(newLat - lastLat, 2) + Math.pow(newLng - lastLng, 2)
      );
      
      // Only refetch if moved more than 0.01 degrees (~1km)
      if (distance < 0.01 && dataFetched.current) {
        console.log('📍 Location unchanged, using existing traffic data');
        return;
      }
    }

    lastCenter.current = center;
    console.log('🚗 Traffic Pollution Hook: Fetching data for', center);

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Try OpenWeatherMap Air Pollution API for pollutant data
        const url = `${OWM_API}?lat=${center[0]}&lon=${center[1]}&appid=${OWM_API_KEY}`;
        
        console.log('📡 Fetching traffic pollution data from OpenWeatherMap...');
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const json = await response.json();
        console.log('✅ OpenWeatherMap Air Pollution response:', json);
        
        if (json.list && json.list[0]) {
          const components = json.list[0].components;
          
          // Use real pollution data to generate traffic zones
          const trafficData = generateTrafficZonesFromPollution(
            center,
            components,
            radius
          );
          
          console.log('📊 Generated', trafficData.length, 'traffic pollution zones from real data');
          setData(trafficData);
          setError(null);
          dataFetched.current = true;
          return;
        } else {
          throw new Error('No pollution data in API response');
        }
      } catch (err) {
        console.warn('⚠️ Traffic Pollution API failed:', err.message);
        console.warn('⚠️ Using mock traffic pollution data');
        setError(err.message);
        const mockData = generateMockTrafficData(center, radius);
        console.log('🎭 Using mock traffic data:', mockData.length, 'zones');
        setData(mockData);
        dataFetched.current = true;
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [center, radius]);

  return { data, loading, error };
}

// Generate traffic zones from real pollution data
function generateTrafficZonesFromPollution(center, components, radius) {
  const zones = [];
  const radiusInDegrees = radius / 111000; // Convert meters to degrees
  
  // Main components from OpenWeatherMap: CO, NO, NO2, O3, SO2, PM2.5, PM10
  const baseCO2 = components.co || 400; // CO in μg/m³
  const baseNO2 = components.no2 || 20;
  const basePM25 = components.pm2_5 || 10;
  
  // Create traffic zones in major road patterns (highways, arterials, etc.)
  const roadPatterns = [
    // Highway (high traffic)
    { 
      offset: [0, 0], 
      segments: generateRoadSegments(center, 0, 0.04, 5),
      type: 'highway',
      multiplier: 1.8,
      density: 'Heavy'
    },
    // Major arterial (moderate-high traffic)
    { 
      offset: [0.02, 0.02], 
      segments: generateRoadSegments(center, 0.02, 0.02, 4),
      type: 'arterial',
      multiplier: 1.4,
      density: 'Moderate-Heavy'
    },
    // Secondary road (moderate traffic)
    { 
      offset: [-0.02, 0.01], 
      segments: generateRoadSegments(center, -0.02, 0.01, 3),
      type: 'secondary',
      multiplier: 1.1,
      density: 'Moderate'
    },
    // Collector road (light-moderate traffic)
    { 
      offset: [0.01, -0.02], 
      segments: generateRoadSegments(center, 0.01, -0.02, 3),
      type: 'collector',
      multiplier: 0.8,
      density: 'Light-Moderate'
    },
  ];

  roadPatterns.forEach((pattern, idx) => {
    // Calculate pollution levels based on real data + traffic multiplier
    const co2Level = Math.round(baseCO2 * pattern.multiplier);
    const no2Level = Math.round(baseNO2 * pattern.multiplier);
    const pm25Level = Math.round(basePM25 * pattern.multiplier);
    
    // Calculate overall pollution percentage (0-100 scale)
    const pollutionPercent = Math.min(100, Math.round(
      (no2Level / 200 * 40) + // NO2 weight: 40%
      (co2Level / 2000 * 30) + // CO weight: 30%
      (pm25Level / 100 * 30)   // PM2.5 weight: 30%
    ));
    
    const level = getTrafficLevel(pollutionPercent);
    
    zones.push({
      id: `traffic-zone-${idx}`,
      lat: center[0] + pattern.offset[0],
      lng: center[1] + pattern.offset[1],
      pollution: pollutionPercent,
      level,
      co2: co2Level,
      no2: no2Level,
      pm25: pm25Level,
      roadType: pattern.type,
      density: pattern.density,
      congestion: pollutionPercent > 60,
      radius: pattern.type === 'highway' ? 700 : 500,
      roadSegments: pattern.segments,
      name: `${pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)} - Zone ${idx + 1}`,
      timestamp: new Date().toISOString(),
    });
  });
  
  return zones;
}

// Generate road segment polylines
function generateRoadSegments(center, offsetLat, offsetLng, numPoints) {
  const segments = [];
  const baseAngle = Math.atan2(offsetLng, offsetLat);
  
  for (let i = 0; i < numPoints; i++) {
    const progress = i / (numPoints - 1);
    const curveFactor = Math.sin(progress * Math.PI) * 0.005;
    
    segments.push([
      center[0] + offsetLat * progress + curveFactor,
      center[1] + offsetLng * progress - curveFactor * 0.5
    ]);
  }
  
  return segments;
}

// Get traffic pollution level
function getTrafficLevel(pollution) {
  const TRAFFIC_LEVELS = {
    low: { min: 0, max: 20, color: '#10b981', label: 'Low', icon: '🟢' },
    moderate: { min: 21, max: 40, color: '#fbbf24', label: 'Moderate', icon: '🟡' },
    high: { min: 41, max: 70, color: '#f97316', label: 'High', icon: '🟠' },
    veryHigh: { min: 71, max: 100, color: '#ef4444', label: 'Very High', icon: '🔴' },
  };

  for (const [key, level] of Object.entries(TRAFFIC_LEVELS)) {
    if (pollution >= level.min && pollution <= level.max) {
      return { key, ...level };
    }
  }
  return { key: 'low', ...TRAFFIC_LEVELS.low };
}

// Generate mock traffic data for fallback
function generateMockTrafficData(center, radius) {
  const zones = [];
  
  const mockPatterns = [
    { lat: 0, lng: 0, pollution: 65, type: 'highway', density: 'Heavy', co2: 850, no2: 78 },
    { lat: 0.02, lng: 0.02, pollution: 45, type: 'arterial', density: 'Moderate-Heavy', co2: 620, no2: 52 },
    { lat: -0.02, lng: 0.01, pollution: 32, type: 'secondary', density: 'Moderate', co2: 480, no2: 38 },
    { lat: 0.01, lng: -0.02, pollution: 18, type: 'collector', density: 'Light-Moderate', co2: 420, no2: 25 },
    { lat: 0.03, lng: -0.01, pollution: 55, type: 'arterial', density: 'Heavy', co2: 720, no2: 62 },
  ];

  mockPatterns.forEach((pattern, idx) => {
    const level = getTrafficLevel(pattern.pollution);
    const roadSegments = generateRoadSegments(
      [center[0] + pattern.lat, center[1] + pattern.lng],
      pattern.lat > 0 ? 0.015 : -0.015,
      pattern.lng > 0 ? 0.015 : -0.015,
      4
    );
    
    zones.push({
      id: `traffic-zone-mock-${idx}`,
      lat: center[0] + pattern.lat,
      lng: center[1] + pattern.lng,
      pollution: pattern.pollution,
      level,
      co2: pattern.co2,
      no2: pattern.no2,
      pm25: Math.round(pattern.pollution * 0.4),
      roadType: pattern.type,
      density: pattern.density,
      congestion: pattern.pollution > 60,
      radius: pattern.type === 'highway' ? 700 : 500,
      roadSegments,
      name: `${pattern.type.charAt(0).toUpperCase() + pattern.type.slice(1)} - Zone ${idx + 1}`,
      timestamp: new Date().toISOString(),
    });
  });
  
  return zones;
}

