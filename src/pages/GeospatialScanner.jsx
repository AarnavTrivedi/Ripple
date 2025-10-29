import { useState, useEffect, useMemo, useRef } from 'react';
import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Layers, Eye, EyeOff, Navigation, Leaf } from 'lucide-react';
import { useAirQualityData } from '@/hooks/useAirQualityData';
import { useGreenSpaces } from '@/hooks/useGreenSpaces';
import { useEcoInfrastructure } from '@/hooks/useEcoInfrastructure';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

// Set Mapbox access token
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// Initial view state (will center on user location)
const INITIAL_VIEW_STATE = {
  longitude: -122.41669,
  latitude: 37.7853,
  zoom: 13,
  pitch: 45,
  bearing: 0,
  maxZoom: 20,
  minZoom: 10
};

const GeospatialScanner = () => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [userLocation, setUserLocation] = useState(null);
  const [routeHistory, setRouteHistory] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const deckRef = useRef(null);
  
  // Layer visibility toggles
  const [activeLayers, setActiveLayers] = useState({
    airQuality: true,
    greenSpaces: true,
    infrastructure: false,
    route: true,
    challenges: true
  });
  
  // Fetch environmental data
  const { data: airQualityData } = useAirQualityData(
    userLocation ? [userLocation.latitude, userLocation.longitude] : null,
    25000
  );
  
  const { data: greenSpacesData } = useGreenSpaces(
    userLocation ? [userLocation.latitude, userLocation.longitude] : null,
    5000
  );
  
  const { data: infrastructureData } = useEcoInfrastructure(
    userLocation ? [userLocation.latitude, userLocation.longitude] : null,
    5000
  );
  
  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    
    console.log('🗺️ Initializing Mapbox with token:', MAPBOX_TOKEN ? 'Token present' : 'NO TOKEN!');
    
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [viewState.longitude, viewState.latitude],
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing
    });
    
    map.on('error', (e) => {
      console.error('❌ Mapbox error:', e);
    });
    
    map.on('load', () => {
      console.log('✅ Mapbox map loaded successfully!');
      // Initialize Deck.gl overlay
      const deck = new Deck({
        canvas: 'deck-canvas',
        width: '100%',
        height: '100%',
        initialViewState: viewState,
        controller: true,
        onViewStateChange: ({ viewState: newViewState }) => {
          setViewState(newViewState);
          // Sync with Mapbox
          map.jumpTo({
            center: [newViewState.longitude, newViewState.latitude],
            zoom: newViewState.zoom,
            bearing: newViewState.bearing,
            pitch: newViewState.pitch
          });
        },
        getTooltip: ({ object }) => {
          if (object) {
            return {
              html: `<div style="background: rgba(0,0,0,0.9); color: white; padding: 8px; border-radius: 4px; font-size: 12px;">
                ${object.name || 'Environmental Data'}
                ${object.value ? `<br/>PM2.5: ${object.value.toFixed(1)} μg/m³` : ''}
                ${object.type ? `<br/>Type: ${object.type}` : ''}
              </div>`
            };
          }
          return null;
        }
      });
      
      deckRef.current = deck;
    });
    
    mapRef.current = map;
    
    return () => {
      if (deckRef.current) {
        deckRef.current.finalize();
      }
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);
  
  // Get user location and track movement
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error('Geolocation not supported');
      return;
    }
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          longitude: position.coords.longitude,
          latitude: position.coords.latitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
        
        setUserLocation(location);
        
        // Update view to center on user (first time only)
        if (!userLocation) {
          setViewState(prev => ({
            ...prev,
            longitude: location.longitude,
            latitude: location.latitude
          }));
        }
        
        // Add to route history if tracking
        if (isTracking) {
          setRouteHistory(prev => [
            ...prev,
            { position: [location.longitude, location.latitude], timestamp: location.timestamp }
          ]);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000
      }
    );
    
    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, userLocation]);
  
  // Create deck.gl layers
  const layers = useMemo(() => {
    const layerList = [];
    
    // 1. Air Quality Heatmap (3D Hexagons)
    if (activeLayers.airQuality && airQualityData && airQualityData.length > 0) {
      layerList.push(
        new HexagonLayer({
          id: 'air-quality-hexagon',
          data: airQualityData,
          getPosition: d => [d.lng, d.lat],
          getElevationWeight: d => d.value,
          elevationScale: 50,
          extruded: true,
          radius: 500,
          coverage: 0.8,
          elevationRange: [0, 3000],
          colorRange: [
            [16, 185, 129],      // Green (good)
            [251, 191, 36],      // Yellow (moderate)
            [249, 115, 22],      // Orange (unhealthy for sensitive)
            [239, 68, 68],       // Red (unhealthy)
            [153, 27, 27]        // Dark red (very unhealthy)
          ],
          getColorWeight: d => d.value,
          pickable: true,
          opacity: 0.8
        })
      );
    }
    
    // 2. Green Spaces Layer (Parks, Forests)
    if (activeLayers.greenSpaces && greenSpacesData && greenSpacesData.length > 0) {
      layerList.push(
        new ScatterplotLayer({
          id: 'green-spaces',
          data: greenSpacesData,
          getPosition: d => [d.lng, d.lat],
          getFillColor: [34, 197, 94, 180],
          getLineColor: [22, 163, 74],
          lineWidthMinPixels: 2,
          getRadius: d => d.size || 100,
          radiusScale: 6,
          radiusMinPixels: 5,
          radiusMaxPixels: 50,
          pickable: true,
          opacity: 0.6
        })
      );
    }
    
    // 3. Infrastructure Layer (EV Charging + Public Transit)
    if (activeLayers.infrastructure && infrastructureData) {
      const infraPoints = [
        ...(infrastructureData.evCharging || []).map(ev => ({ ...ev, type: 'ev' })),
        ...(infrastructureData.publicTransit || []).map(pt => ({ ...pt, type: 'transit' }))
      ];
      
      if (infraPoints.length > 0) {
        layerList.push(
          new ScatterplotLayer({
            id: 'infrastructure',
            data: infraPoints,
            getPosition: d => [d.lng, d.lat],
            getFillColor: d => d.type === 'ev' ? [59, 130, 246] : [139, 92, 246],
            getRadius: 50,
            radiusMinPixels: 4,
            radiusMaxPixels: 20,
            pickable: true,
            opacity: 0.8
          })
        );
      }
    }
    
    // 4. User Route Path
    if (activeLayers.route && routeHistory.length > 1) {
      layerList.push(
        new PathLayer({
          id: 'user-route',
          data: [{ path: routeHistory.map(r => r.position) }],
          getPath: d => d.path,
          getColor: [16, 185, 129],
          getWidth: 5,
          widthMinPixels: 2,
          widthMaxPixels: 10,
          opacity: 0.9,
          pickable: false
        })
      );
    }
    
    // 5. User Current Location
    if (userLocation) {
      layerList.push(
        new ScatterplotLayer({
          id: 'user-location',
          data: [userLocation],
          getPosition: d => [d.longitude, d.latitude],
          getFillColor: [59, 130, 246, 255],
          getLineColor: [255, 255, 255, 255],
          lineWidthMinPixels: 3,
          getRadius: userLocation.accuracy || 20,
          radiusMinPixels: 8,
          radiusMaxPixels: 30,
          pickable: false
        })
      );
    }
    
    // 6. Eco Challenges (at real locations)
    if (activeLayers.challenges) {
      const challenges = [
        { id: 1, lng: viewState.longitude + 0.005, lat: viewState.latitude + 0.005, type: 'recycle', name: 'Recycling Center' },
        { id: 2, lng: viewState.longitude - 0.005, lat: viewState.latitude + 0.003, type: 'tree', name: 'Community Garden' },
        { id: 3, lng: viewState.longitude + 0.003, lat: viewState.latitude - 0.005, type: 'transit', name: 'Bus Station' }
      ];
      
      layerList.push(
        new ScatterplotLayer({
          id: 'challenges',
          data: challenges,
          getPosition: d => [d.lng, d.lat],
          getFillColor: d => {
            const colors = {
              recycle: [6, 182, 212],
              tree: [34, 197, 94],
              transit: [59, 130, 246]
            };
            return colors[d.type] || [139, 92, 246];
          },
          getRadius: 80,
          radiusMinPixels: 10,
          radiusMaxPixels: 40,
          pickable: true,
          opacity: 0.9
        })
      );
    }
    
    return layerList;
  }, [activeLayers, airQualityData, greenSpacesData, infrastructureData, routeHistory, userLocation, viewState]);
  
  // Update deck layers when they change
  useEffect(() => {
    if (deckRef.current && layers) {
      deckRef.current.setProps({ layers });
    }
  }, [layers]);
  
  const handleLayerToggle = (layerKey) => {
    setActiveLayers(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };
  
  const handleStartTracking = () => {
    setIsTracking(true);
    setRouteHistory([]);
  };
  
  const handleStopTracking = () => {
    setIsTracking(false);
  };
  
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'pk.your_mapbox_token_here') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-green-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-xl border-emerald-500/20 p-8 max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">Mapbox Token Required</h2>
          <p className="text-white/80 mb-4">
            To use the 3D Geospatial Scanner, you need a Mapbox API token.
          </p>
          <ol className="text-white/70 text-sm space-y-2 mb-4 list-decimal list-inside">
            <li>Go to <a href="https://account.mapbox.com/access-tokens/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">Mapbox Access Tokens</a></li>
            <li>Create a new token (free tier: 50k requests/month)</li>
            <li>Add it to <code className="bg-black/30 px-2 py-1 rounded">.env</code> file:</li>
          </ol>
          <pre className="bg-black/50 p-3 rounded text-emerald-400 text-xs overflow-x-auto mb-4">
            VITE_MAPBOX_TOKEN=pk.your_token_here
          </pre>
          <p className="text-white/60 text-xs">
            Restart the dev server after adding the token.
          </p>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-screen">
      {/* Mapbox Container - Base layer */}
      <div 
        ref={mapContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      />
      
      {/* Deck.gl Canvas Overlay - On top of map */}
      <canvas 
        id="deck-canvas"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'auto'
        }}
      />
      
      {/* Header UI */}
      <div className="absolute top-0 left-0 right-0 bg-[#0f5132]/80 backdrop-blur-xl border-b border-emerald-500/20 px-4 py-3" style={{ zIndex: 10 }}>
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-white">🌍 Geospatial Scanner</h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => handleLayerToggle('airQuality')}
              className={activeLayers.airQuality ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-white/10 hover:bg-white/20'}
            >
              {activeLayers.airQuality ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              <span className="ml-1">Air Quality</span>
            </Button>
            <Button
              size="sm"
              onClick={() => handleLayerToggle('greenSpaces')}
              className={activeLayers.greenSpaces ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-white/10 hover:bg-white/20'}
            >
              <Leaf className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Tracking Controls */}
      <div className="absolute bottom-4 left-4 right-4" style={{ zIndex: 10 }}>
        <div className="bg-black/60 backdrop-blur-md rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-semibold">
                  {isTracking ? 'Tracking Your Route' : 'Ready to Track'}
                </div>
                <div className="text-xs text-white/70">
                  {routeHistory.length > 0 && `${routeHistory.length} points tracked`}
                </div>
              </div>
            </div>
            <Button
              onClick={isTracking ? handleStopTracking : handleStartTracking}
              className={isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'}
            >
              {isTracking ? 'Stop Tracking' : 'Start Tracking'}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="absolute top-20 right-4 bg-black/60 backdrop-blur-md rounded-lg p-3 text-white text-xs max-w-xs" style={{ zIndex: 10 }}>
        <div className="font-semibold mb-2">Legend</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
            <span>Good Air Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Poor Air Quality</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Green Spaces</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Your Location</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeospatialScanner;

