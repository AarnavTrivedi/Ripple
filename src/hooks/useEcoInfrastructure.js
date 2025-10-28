import { useState, useEffect, useRef } from 'react';

// Use Overpass API for OSM data
const OVERPASS_API = 'https://overpass-api.de/api/interpreter';

export function useEcoInfrastructure(center, radius = 5000) {
  const [data, setData] = useState({ evCharging: [], publicTransit: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastCenter = useRef(null);
  const dataFetched = useRef(false);

  useEffect(() => {
    if (!center) {
      console.log('⚡ Infrastructure Hook: No center location yet');
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
        console.log('📍 Infrastructure: Location unchanged');
        return;
      }
    }

    lastCenter.current = center;
    console.log('⚡ Infrastructure Hook: Fetching data for', center);

    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Query for EV charging stations and public transit
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="charging_station"](around:${radius},${center[0]},${center[1]});
            node["amenity"="bus_station"](around:${radius},${center[0]},${center[1]});
            node["railway"="station"](around:${radius},${center[0]},${center[1]});
            node["railway"="subway_entrance"](around:${radius},${center[0]},${center[1]});
            node["public_transport"="station"](around:${radius},${center[0]},${center[1]});
          );
          out;
        `;

        const response = await fetch(OVERPASS_API, {
          method: 'POST',
          body: query
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        const json = await response.json();
        console.log('✅ Infrastructure API response:', json.elements?.length || 0, 'locations');

        // Separate EV charging and public transit
        const evCharging = [];
        const publicTransit = [];

        json.elements.forEach(element => {
          const point = {
            id: element.id,
            lat: element.lat,
            lng: element.lon,
            name: element.tags?.name || 'Unnamed',
            operator: element.tags?.operator,
            network: element.tags?.network
          };

          if (element.tags?.amenity === 'charging_station') {
            evCharging.push({
              ...point,
              type: 'ev_charging',
              capacity: element.tags?.capacity || 'Unknown',
              socketType: element.tags?.socket || 'Standard'
            });
          } else {
            publicTransit.push({
              ...point,
              type: element.tags?.railway || element.tags?.public_transport || element.tags?.amenity || 'transit',
              lines: element.tags?.lines
            });
          }
        });

        console.log('⚡ EV Charging stations:', evCharging.length);
        console.log('🚇 Public transit stations:', publicTransit.length);
        
        setData({ evCharging, publicTransit });
        setError(null);
        dataFetched.current = true;
      } catch (err) {
        console.warn('⚠️ Infrastructure API failed, using mock data:', err.message);
        setError(err.message);
        
        // Fallback to mock data
        const mockData = generateMockInfrastructure(center);
        console.log('🎭 Using mock infrastructure data');
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

function generateMockInfrastructure(center) {
  const evCharging = [];
  const publicTransit = [];
  
  // Generate 8 EV charging stations
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * 2 * i) / 8;
    const distance = 0.015 + Math.random() * 0.04;
    
    evCharging.push({
      id: `ev-${i}`,
      lat: center[0] + Math.cos(angle) * distance,
      lng: center[1] + Math.sin(angle) * distance,
      type: 'ev_charging',
      name: ['Tesla Supercharger', 'ChargePoint', 'EVgo', 'Electrify America'][Math.floor(Math.random() * 4)],
      capacity: `${Math.floor(Math.random() * 8) + 2} slots`,
      socketType: ['Type 2', 'CCS', 'CHAdeMO'][Math.floor(Math.random() * 3)]
    });
  }
  
  // Generate 10 public transit stations
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI * 2 * i) / 10 + 0.3;
    const distance = 0.02 + Math.random() * 0.05;
    
    publicTransit.push({
      id: `transit-${i}`,
      lat: center[0] + Math.cos(angle) * distance,
      lng: center[1] + Math.sin(angle) * distance,
      type: ['station', 'bus_station', 'subway_entrance'][Math.floor(Math.random() * 3)],
      name: `Transit Station ${i + 1}`,
      lines: `Lines ${Math.floor(Math.random() * 5) + 1}, ${Math.floor(Math.random() * 5) + 6}`
    });
  }
  
  return { evCharging, publicTransit };
}

