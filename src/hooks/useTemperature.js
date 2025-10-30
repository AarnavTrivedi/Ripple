import { useState, useEffect, useRef } from 'react';

// OpenWeatherMap Weather API
const OWM_API_KEY = '549ab6fbf6d6452588835e84e3c6c0e7'; // Replace with your key
const OWM_WEATHER_API = 'https://api.openweathermap.org/data/2.5/weather';
const OWM_ONECALL_API = 'https://api.openweathermap.org/data/2.5/onecall';

export function useTemperature(center, radius = 5000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastCenter = useRef(null);
  const dataFetched = useRef(false);

  useEffect(() => {
    if (!center) {
      console.log('🌡️ Temperature Hook: No center location yet');
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
        console.log('📍 Location unchanged, using existing temperature data');
        return;
      }
    }

    lastCenter.current = center;
    console.log('🌡️ Temperature Hook: Fetching data for', center);

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Try OpenWeatherMap Weather API
        const url = `${OWM_WEATHER_API}?lat=${center[0]}&lon=${center[1]}&appid=${OWM_API_KEY}&units=imperial`;
        
        console.log('📡 Fetching temperature data from OpenWeatherMap...');
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
        
        const json = await response.json();
        console.log('✅ OpenWeatherMap Weather response:', json);
        
        if (json.main) {
          // Use real weather data to generate temperature zones
          const tempData = generateTempZonesFromWeather(
            center,
            json,
            radius
          );
          
          console.log('📊 Generated', tempData.length, 'temperature zones from real data');
          setData(tempData);
          setError(null);
          dataFetched.current = true;
          return;
        } else {
          throw new Error('No weather data in API response');
        }
      } catch (err) {
        console.warn('⚠️ Temperature API failed:', err.message);
        console.warn('⚠️ Using mock temperature data');
        setError(err.message);
        const mockData = generateMockTempData(center, radius);
        console.log('🎭 Using mock temperature data:', mockData.length, 'zones');
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

function getTempRange(temp) {
  for (const [key, range] of Object.entries(TEMP_RANGES)) {
    if (temp >= range.min && temp <= range.max) {
      return { key, ...range };
    }
  }
  return { key: 'mild', ...TEMP_RANGES.mild };
}

// Convert Fahrenheit to Celsius
function fahrenheitToCelsius(f) {
  return (f - 32) * 5 / 9;
}

// Generate temperature zones from real weather data
function generateTempZonesFromWeather(center, weatherData, radius) {
  const zones = [];
  const baseTemp = weatherData.main.temp; // in Fahrenheit
  const feelsLike = weatherData.main.feels_like;
  const humidity = weatherData.main.humidity;
  const windSpeed = weatherData.wind?.speed || 0;
  const conditions = weatherData.weather?.[0]?.main || 'Clear';
  
  // Create temperature variations across different areas
  // Urban heat islands, parks, water bodies, etc.
  const areaTypes = [
    { 
      name: 'City Center',
      offset: [0, 0],
      tempModifier: 2, // Urban heat island effect
      radiusMultiplier: 1.2,
    },
    { 
      name: 'Park Area',
      offset: [0.015, 0.015],
      tempModifier: -3, // Cooler due to vegetation
      radiusMultiplier: 1.5,
    },
    { 
      name: 'Residential',
      offset: [-0.015, 0.01],
      tempModifier: 0,
      radiusMultiplier: 1.0,
    },
    { 
      name: 'Industrial Zone',
      offset: [0.01, -0.015],
      tempModifier: 4, // Hotter due to industrial activity
      radiusMultiplier: 0.8,
    },
    { 
      name: 'Waterfront',
      offset: [-0.02, -0.02],
      tempModifier: -2, // Cooler near water
      radiusMultiplier: 1.3,
    },
  ];

  areaTypes.forEach((area, idx) => {
    const zoneTemp = baseTemp + area.tempModifier + (Math.random() - 0.5) * 2;
    const zoneFeelsLike = feelsLike + area.tempModifier + (Math.random() - 0.5) * 2;
    const zoneHumidity = Math.min(100, Math.max(0, humidity + (Math.random() - 0.5) * 10));
    const range = getTempRange(zoneTemp);
    
    zones.push({
      id: `temp-zone-${idx}`,
      lat: center[0] + area.offset[0],
      lng: center[1] + area.offset[1],
      temp: zoneTemp,
      tempCelsius: fahrenheitToCelsius(zoneTemp),
      feelsLike: zoneFeelsLike,
      range,
      humidity: Math.round(zoneHumidity),
      windSpeed: Math.round(windSpeed * 10) / 10,
      uvIndex: calculateUVIndex(zoneTemp, conditions),
      conditions,
      radius: (radius / 111000) * area.radiusMultiplier, // Convert to degrees
      name: area.name,
      timestamp: new Date().toISOString(),
    });
  });
  
  return zones;
}

// Calculate approximate UV index based on temperature and conditions
function calculateUVIndex(temp, conditions) {
  let baseUV = 5;
  
  // Higher temp generally means more sun exposure potential
  if (temp > 80) baseUV += 2;
  else if (temp > 70) baseUV += 1;
  else if (temp < 50) baseUV -= 2;
  
  // Weather conditions affect UV
  const conditionsLower = conditions.toLowerCase();
  if (conditionsLower.includes('cloud')) baseUV -= 2;
  if (conditionsLower.includes('rain')) baseUV -= 3;
  if (conditionsLower.includes('clear')) baseUV += 2;
  
  return Math.max(0, Math.min(11, baseUV));
}

// Generate mock temperature data for fallback
function generateMockTempData(center, radius) {
  const zones = [];
  const baseTemp = 72; // Default pleasant temperature
  
  const mockAreas = [
    { name: 'City Center', offset: [0, 0], temp: baseTemp + 3, humidity: 55 },
    { name: 'Park Area', offset: [0.015, 0.015], temp: baseTemp - 2, humidity: 65 },
    { name: 'Residential', offset: [-0.015, 0.01], temp: baseTemp, humidity: 58 },
    { name: 'Industrial Zone', offset: [0.01, -0.015], temp: baseTemp + 5, humidity: 48 },
    { name: 'Waterfront', offset: [-0.02, -0.02], temp: baseTemp - 1, humidity: 70 },
  ];

  mockAreas.forEach((area, idx) => {
    const range = getTempRange(area.temp);
    
    zones.push({
      id: `temp-zone-mock-${idx}`,
      lat: center[0] + area.offset[0],
      lng: center[1] + area.offset[1],
      temp: area.temp,
      tempCelsius: fahrenheitToCelsius(area.temp),
      feelsLike: area.temp + (area.humidity > 70 ? 3 : -1),
      range,
      humidity: area.humidity,
      windSpeed: 5 + Math.random() * 5,
      uvIndex: calculateUVIndex(area.temp, 'Clear'),
      conditions: 'Clear',
      radius: (radius / 111000) * 1.0,
      name: area.name,
      timestamp: new Date().toISOString(),
    });
  });
  
  return zones;
}

