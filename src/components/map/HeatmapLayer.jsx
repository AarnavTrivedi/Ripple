import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

const AQI_GRADIENT = {
  0.0: '#00e400',  // Green (good)
  0.2: '#92d050',
  0.4: '#ffff00',  // Yellow (moderate)
  0.6: '#ff7e00',  // Orange (unhealthy for sensitive)
  0.8: '#ff0000',  // Red (unhealthy)
  1.0: '#8f3f97'   // Purple (very unhealthy/hazardous)
};

export default function HeatmapLayer({ 
  data, 
  intensity = 1.2, 
  radius = 80, 
  blur = 50,
  maxValue = 150 
}) {
  const map = useMap();

  useEffect(() => {
    console.log('🗺️ HeatmapLayer mounted with', data?.length || 0, 'data points');
    
    if (!data || data.length === 0) {
      console.log('⚠️ No heatmap data available');
      return;
    }

    // Convert data to heatmap format: [[lat, lng, intensity], ...]
    const heatData = data.map(point => [
      point.lat,
      point.lng,
      point.value / maxValue // Normalize 0-1
    ]);

    // Create heatmap layer
    const heatLayer = L.heatLayer(heatData, {
      radius,
      blur,
      maxZoom: 17,
      max: intensity,
      minOpacity: 0.5,
      gradient: AQI_GRADIENT
    }).addTo(map);

    console.log('✅ Heatmap layer added to map!', {
      points: heatData.length,
      radius,
      blur,
      intensity
    });

    return () => {
      console.log('🗑️ Heatmap layer removed from map');
      map.removeLayer(heatLayer);
    };
  }, [map, data, intensity, radius, blur, maxValue]);

  return null;
}

