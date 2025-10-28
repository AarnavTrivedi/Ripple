import { useState, useEffect, useRef } from 'react';

// Use Overpass API to get green spaces from OpenStreetMap
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export function useGreenSpaces(center, radius = 5000) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastCenter = useRef(null);
  const dataFetched = useRef(false);

  useEffect(() => {
    if (!center) {
      console.log('🌳 Green Spaces Hook: No center location yet');
      return;
    }

    // Prevent infinite loop
    if (lastCenter.current) {
      const [lastLat, lastLng] = lastCenter.current;
      const [newLat, newLng] = center;
      const distance = Math.sqrt(
        Math.pow(newLat - lastLat, 2) + Math.pow(newLng - lastLng, 2)
      );
      
      if (distance < 0.01 && dataFetched.current) {
        console.log('📍 Green Spaces: Location unchanged, using existing data');
        return;
      }
    }

    lastCenter.current = center;
    console.log('🌳 Green Spaces Hook: Fetching data for', center);

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Overpass QL query for parks, forests, nature reserves
        const query = `
          [out:json][timeout:25];
          (
            node["leisure"="park"](around:${radius},${center[0]},${center[1]});
            way["leisure"="park"](around:${radius},${center[0]},${center[1]});
            node["landuse"="forest"](around:${radius},${center[0]},${center[1]});
            way["landuse"="forest"](around:${radius},${center[0]},${center[1]});
            node["leisure"="nature_reserve"](around:${radius},${center[0]},${center[1]});
            way["leisure"="nature_reserve"](around:${radius},${center[0]},${center[1]});
            node["leisure"="garden"](around:${radius},${center[0]},${center[1]});
            way["leisure"="garden"](around:${radius},${center[0]},${center[1]});
          );
          out center;
        `;

        const response = await fetch(OVERPASS_API, {
          method: 'POST',
          body: query
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const json = await response.json();
        console.log('✅ Green Spaces API response:', json.elements?.length || 0, 'spaces');

        // Transform data
        const greenSpaces = json.elements.map(element => ({
          id: element.id,
          lat: element.lat || element.center?.lat,
          lng: element.lon || element.center?.lon,
          type: element.tags?.leisure || element.tags?.landuse || 'green_space',
          name: element.tags?.name || 'Green Space',
          size: calculateSize(element)
        })).filter(space => space.lat && space.lng);

        console.log('🌳 Processed green spaces:', greenSpaces.length);
        setData(greenSpaces);
        setError(null);
        dataFetched.current = true;
      } catch (err) {
        console.warn('⚠️ Green Spaces API failed, using mock data:', err.message);
        setError(err.message);
        
        // Fallback to mock data
        const mockData = generateMockGreenSpaces(center);
        console.log('🎭 Using mock green spaces:', mockData.length);
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

function calculateSize(element) {
  if (element.tags?.area) return 'large';
  if (element.type === 'way') return 'medium';
  return 'small';
}

function generateMockGreenSpaces(center) {
  const spaces = [];
  const types = ['park', 'forest', 'garden', 'nature_reserve'];
  
  for (let i = 0; i < 12; i++) {
    const angle = (Math.PI * 2 * i) / 12;
    const distance = 0.02 + Math.random() * 0.05;
    
    spaces.push({
      id: `mock-${i}`,
      lat: center[0] + Math.cos(angle) * distance,
      lng: center[1] + Math.sin(angle) * distance,
      type: types[Math.floor(Math.random() * types.length)],
      name: `Green Space ${i + 1}`,
      size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)]
    });
  }
  
  return spaces;
}

