import React, { useState, useEffect, useRef, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Navigation, Plus, X, AlertTriangle, Calendar, 
  MapPin, Activity, Car, Bike, Train, Footprints,
  Layers, Eye, EyeOff, Route, Zap, Search
} from "lucide-react";
import L from "leaflet";
import { format, differenceInMinutes } from "date-fns";
import "leaflet/dist/leaflet.css";

const HeatmapLayer = ({ points, intensity = 0.5 }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.L?.heatLayer) return;

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    if (points && points.length > 0) {
      const heatLayer = window.L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
        max: 1.0,
        gradient: {
          0.0: '#ff0000',
          0.3: '#ff6600',
          0.5: '#ffff00',
          0.7: '#90ee90',
          1.0: '#10b981'
        }
      });
      heatLayer.addTo(map);
      heatLayerRef.current = heatLayer;
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, points, intensity]);

  return null;
};

const LocationMarker = ({ position, accuracy }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true, duration: 0.5 });
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <>
      <Circle
        center={position}
        radius={accuracy || 100}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.1,
          weight: 2
        }}
      />
      <Circle
        center={position}
        radius={10}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.8,
          weight: 3
        }}
      />
    </>
  );
};

export default function MapPage() {
  const queryClient = useQueryClient();
  
  const [userLocation, setUserLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(100);
  const [routeHistory, setRouteHistory] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTransportMode, setCurrentTransportMode] = useState('walking');
  const [journeyStartTime, setJourneyStartTime] = useState(null);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dialogType, setDialogType] = useState('waypoint');
  const [showLayersSheet, setShowLayersSheet] = useState(false);
  const [showTransportSheet, setShowTransportSheet] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(true);
  
  const [showHazards, setShowHazards] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [showGreenActions, setShowGreenActions] = useState(true);
  const [showRouteHistory, setShowRouteHistory] = useState(true);
  
  const [addressSearch, setAddressSearch] = useState('');
  const [searchingAddress, setSearchingAddress] = useState(false);

  const [newWaypoint, setNewWaypoint] = useState({
    name: '',
    description: '',
    type: 'park',
    latitude: null,
    longitude: null
  });

  const [newVolunteerEvent, setNewVolunteerEvent] = useState({
    title: '',
    description: '',
    action_type: 'volunteer',
    date: format(new Date(), 'yyyy-MM-dd'),
    points_reward: 50,
    latitude: null,
    longitude: null,
    address: ''
  });

  const [journeyStats, setJourneyStats] = useState({
    distance: 0,
    carbonSaved: 0,
    duration: 0,
    ecoScore: 0
  });

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          const accuracy = position.coords.accuracy;
          
          setUserLocation(newLocation);
          setLocationAccuracy(accuracy);
          
          if (isTracking && userLocation) {
            setRouteHistory(prev => {
              const updated = [...prev, newLocation];
              
              if (prev.length > 0) {
                const lastPoint = prev[prev.length - 1];
                const distance = calculateDistance(
                  lastPoint[0], lastPoint[1],
                  newLocation[0], newLocation[1]
                );
                
                setJourneyStats(prevStats => {
                  const newDistance = prevStats.distance + distance;
                  const carbonSaved = calculateCarbonSaved(newDistance, currentTransportMode);
                  const duration = journeyStartTime ? 
                    differenceInMinutes(new Date(), journeyStartTime) : 0;
                  const ecoScore = calculateEcoScore(currentTransportMode, duration, carbonSaved);
                  
                  return {
                    distance: newDistance,
                    carbonSaved,
                    duration,
                    ecoScore
                  };
                });
              }
              
              return updated;
            });
          }

          if (showAddDialog) {
            if (dialogType === 'waypoint' && !newWaypoint.latitude) {
              setNewWaypoint(prev => ({
                ...prev,
                latitude: newLocation[0],
                longitude: newLocation[1]
              }));
            }
            if (dialogType === 'volunteer' && !newVolunteerEvent.latitude) {
              setNewVolunteerEvent(prev => ({
                ...prev,
                latitude: newLocation[0],
                longitude: newLocation[1]
              }));
            }
          }
        },
        (error) => {
          console.error("Location error:", error);
          setUserLocation([37.5407, -77.4360]);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, [isTracking, userLocation, currentTransportMode, journeyStartTime, showAddDialog, dialogType, newWaypoint.latitude, newVolunteerEvent.latitude]);

  const { data: waypoints } = useQuery({
    queryKey: ['waypoints'],
    queryFn: () => base44.entities.EcoWaypoint.list(),
    initialData: [],
  });

  const { data: greenActions } = useQuery({
    queryKey: ['greenActions'],
    queryFn: () => base44.entities.GreenAction.list(),
    initialData: [],
  });

  const { data: hazards } = useQuery({
    queryKey: ['hazards'],
    queryFn: () => base44.entities.HazardZone.list(),
    initialData: [],
  });

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateCarbonSaved = (distanceMiles, transportMode) => {
    const emissionFactors = {
      walking: 0,
      cycling: 0,
      public_transport: 0.14,
      driving: 0.404,
    };
    
    const carEmissions = 0.404;
    const modeEmissions = emissionFactors[transportMode] || 0;
    const savedPerMile = carEmissions - modeEmissions;
    
    return Math.max(0, savedPerMile * distanceMiles);
  };

  const calculateEcoScore = (transportMode, durationMinutes, carbonSaved) => {
    const modeScores = {
      walking: 100,
      cycling: 95,
      public_transport: 75,
      driving: 30,
    };
    
    const baseScore = modeScores[transportMode] || 50;
    const durationBonus = Math.min(durationMinutes * 0.5, 20);
    const carbonBonus = Math.min(carbonSaved * 10, 30);
    
    return Math.min(100, Math.round(baseScore + durationBonus + carbonBonus));
  };

  const heatmapData = useMemo(() => {
    if (!showHeatmap) return [];
    
    const points = [];
    
    waypoints.forEach(waypoint => {
      if (waypoint.latitude && waypoint.longitude) {
        const intensity = (waypoint.eco_rating || 70) / 100;
        points.push([waypoint.latitude, waypoint.longitude, intensity]);
      }
    });
    
    greenActions.forEach(action => {
      if (action.latitude && action.longitude && !action.completed) {
        points.push([action.latitude, action.longitude, 0.9]);
      }
    });
    
    hazards.forEach(hazard => {
      if (hazard.latitude && hazard.longitude) {
        const intensity = 1 - (hazard.hazard_level / 100);
        points.push([hazard.latitude, hazard.longitude, intensity]);
      }
    });
    
    return points;
  }, [waypoints, greenActions, hazards, showHeatmap]);

  const createWaypointMutation = useMutation({
    mutationFn: (data) => base44.entities.EcoWaypoint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waypoints'] });
      setShowAddDialog(false);
      setNewWaypoint({
        name: '',
        description: '',
        type: 'park',
        latitude: null,
        longitude: null
      });
    },
  });

  const createVolunteerMutation = useMutation({
    mutationFn: (data) => base44.entities.GreenAction.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greenActions'] });
      setShowAddDialog(false);
      setNewVolunteerEvent({
        title: '',
        description: '',
        action_type: 'volunteer',
        date: format(new Date(), 'yyyy-MM-dd'),
        points_reward: 50,
        latitude: null,
        longitude: null,
        address: ''
      });
      setAddressSearch('');
    },
  });

  const handleSearchAddress = async () => {
    if (!addressSearch) return;
    
    setSearchingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addressSearch)}, Virginia`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        const location = data[0];
        if (dialogType === 'volunteer') {
          setNewVolunteerEvent(prev => ({
            ...prev,
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon),
            address: location.display_name
          }));
        } else {
          setNewWaypoint(prev => ({
            ...prev,
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lon)
          }));
        }
      } else {
        alert('Address not found. Please try a different address.');
      }
    } catch (error) {
      console.error("Error searching address:", error);
      alert('Error searching address. Please try again.');
    } finally {
      setSearchingAddress(false);
    }
  };

  const handleAddWaypoint = (e) => {
    e.preventDefault();
    
    const lat = newWaypoint.latitude || userLocation[0];
    const lon = newWaypoint.longitude || userLocation[1];
    
    createWaypointMutation.mutate({
      ...newWaypoint,
      latitude: lat,
      longitude: lon,
      is_user_created: true,
      eco_rating: 85
    });
  };

  const handleAddVolunteer = (e) => {
    e.preventDefault();
    
    const lat = newVolunteerEvent.latitude || userLocation[0];
    const lon = newVolunteerEvent.longitude || userLocation[1];
    
    createVolunteerMutation.mutate({
      title: newVolunteerEvent.title,
      description: newVolunteerEvent.description,
      action_type: newVolunteerEvent.action_type,
      date: newVolunteerEvent.date,
      points_reward: newVolunteerEvent.points_reward,
      latitude: lat,
      longitude: lon,
      completed: false
    });
  };

  const handleStartJourney = () => {
    setIsTracking(true);
    setJourneyStartTime(new Date());
    setRouteHistory(userLocation ? [userLocation] : []);
    setJourneyStats({ distance: 0, carbonSaved: 0, duration: 0, ecoScore: 0 });
    setShowTransportSheet(true);
    setShowStatsOverlay(true);
  };

  const handleStopJourney = () => {
    setIsTracking(false);
    setShowTransportSheet(false);
    
    if (journeyStats.distance > 0) {
      alert(`Journey Complete!\n\nDistance: ${journeyStats.distance.toFixed(2)} miles\nCO₂ Saved: ${journeyStats.carbonSaved.toFixed(2)} kg\nDuration: ${journeyStats.duration} min\nEco Score: ${journeyStats.ecoScore}/100`);
    }
    
    setJourneyStats({ distance: 0, carbonSaved: 0, duration: 0, ecoScore: 0 });
    setRouteHistory([]);
  };

  const handleChangeTransportMode = (mode) => {
    setCurrentTransportMode(mode);
    setShowTransportSheet(false);
  };

  const getMarkerIcon = (type, isGreenAction = false) => {
    const colors = {
      recycling_center: '#10b981',
      charging_station: '#3b82f6',
      bike_station: '#8b5cf6',
      park: '#22c55e',
      community_garden: '#84cc16',
      water_refill: '#06b6d4',
      eco_store: '#f59e0b',
      green_action: '#fbbf24'
    };

    const color = isGreenAction ? colors.green_action : (colors[type] || '#10b981');

    return new L.Icon({
      iconUrl: `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  const transportIcons = {
    walking: Footprints,
    cycling: Bike,
    public_transport: Train,
    driving: Car
  };

  const TransportIcon = transportIcons[currentTransportMode] || Footprints;

  if (!userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 to-green-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      <div className="bg-[#0f5132]/95 backdrop-blur border-b border-emerald-500/20 px-4 py-3 z-[1001]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h1 className="text-lg font-bold text-white">Eco Map</h1>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-500/30 h-8 px-2 text-white hover:bg-emerald-500/20"
              onClick={() => setShowLayersSheet(true)}
            >
              <Layers className="w-4 h-4 mr-1" />
              Layers
            </Button>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 h-8 px-2 text-white"
              onClick={() => {
                setDialogType('waypoint');
                setShowAddDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <MapContainer
          center={userLocation}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {showHeatmap && heatmapData.length > 0 && window.L?.heatLayer && (
            <HeatmapLayer points={heatmapData} intensity={0.6} />
          )}
          
          <LocationMarker position={userLocation} accuracy={locationAccuracy} />

          {showRouteHistory && routeHistory.length > 1 && (
            <Polyline
              positions={routeHistory}
              pathOptions={{
                color: currentTransportMode === 'walking' ? '#10b981' :
                       currentTransportMode === 'cycling' ? '#8b5cf6' :
                       currentTransportMode === 'public_transport' ? '#3b82f6' : '#f59e0b',
                weight: 4,
                opacity: 0.7
              }}
            />
          )}

          {showWaypoints && waypoints.map((waypoint) => (
            <Marker
              key={waypoint.id}
              position={[waypoint.latitude, waypoint.longitude]}
              icon={getMarkerIcon(waypoint.type)}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-semibold text-base mb-1">{waypoint.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{waypoint.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize text-emerald-600">
                      {waypoint.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-emerald-700 font-medium">
                      ⭐ {waypoint.eco_rating || 85}/100
                    </span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {showGreenActions && greenActions.filter(a => a.latitude && a.longitude).map((action) => (
            <Marker
              key={action.id}
              position={[action.latitude, action.longitude]}
              icon={getMarkerIcon(null, true)}
            >
              <Popup>
                <div className="min-w-[220px]">
                  <h3 className="font-semibold text-base mb-1">{action.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div>📅 {format(new Date(action.date), 'MMM d, yyyy')}</div>
                    {action.points_reward && (
                      <div className="text-emerald-600 font-semibold">
                        🏆 +{action.points_reward} Eco Points
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {showHazards && hazards.map((hazard) => {
            const color = hazard.hazard_level > 60 ? '#ef4444' : 
                          hazard.hazard_level > 40 ? '#f59e0b' : '#fbbf24';
            return (
              <Circle
                key={hazard.id}
                center={[hazard.latitude, hazard.longitude]}
                radius={hazard.hazard_level * 10}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 2
                }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <h3 className="font-semibold text-base mb-1">⚠️ {hazard.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{hazard.description}</p>
                    <div className="text-xs">
                      <span className="font-medium">Hazard Level:</span>
                      <span className={`ml-1 font-bold ${
                        hazard.hazard_level > 60 ? 'text-red-600' :
                        hazard.hazard_level > 40 ? 'text-orange-600' : 'text-yellow-600'
                      }`}>
                        {hazard.hazard_level}/100
                      </span>
                    </div>
                  </div>
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>

        {isTracking && showStatsOverlay && (
          <Card className="absolute top-4 left-4 right-4 bg-[#0f5132]/95 backdrop-blur border-emerald-500/30 z-[1000] p-3 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-semibold text-sm">Journey Active</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-emerald-400 hover:bg-emerald-500/20"
                onClick={() => setShowStatsOverlay(false)}
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-emerald-200/60 text-[10px] uppercase">Distance</div>
                <div className="text-white font-bold text-sm">
                  {journeyStats.distance.toFixed(2)}mi
                </div>
              </div>
              <div className="text-center">
                <div className="text-emerald-200/60 text-[10px] uppercase">CO₂ Saved</div>
                <div className="text-white font-bold text-sm">
                  {journeyStats.carbonSaved.toFixed(2)}kg
                </div>
              </div>
              <div className="text-center">
                <div className="text-emerald-200/60 text-[10px] uppercase">Time</div>
                <div className="text-white font-bold text-sm">
                  {journeyStats.duration}min
                </div>
              </div>
              <div className="text-center">
                <div className="text-emerald-200/60 text-[10px] uppercase">Score</div>
                <div className="text-white font-bold text-sm">
                  {journeyStats.ecoScore}
                </div>
              </div>
            </div>
          </Card>
        )}

        {isTracking && !showStatsOverlay && (
          <Button
            size="sm"
            className="absolute top-4 left-4 z-[1000] bg-emerald-500/90 hover:bg-emerald-600 text-white shadow-lg"
            onClick={() => setShowStatsOverlay(true)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-2">
          {!isTracking ? (
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 shadow-lg text-white"
              onClick={handleStartJourney}
            >
              <Route className="w-5 h-5 mr-2" />
              Start Journey
            </Button>
          ) : (
            <>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/90 hover:bg-white border-emerald-500/30 text-emerald-700 shadow-lg"
                onClick={() => setShowTransportSheet(true)}
              >
                <TransportIcon className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 shadow-lg text-white"
                onClick={handleStopJourney}
              >
                <X className="w-5 h-5 mr-2" />
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

      <Sheet open={showTransportSheet} onOpenChange={setShowTransportSheet}>
        <SheetContent side="bottom" className="bg-[#0f5132] border-emerald-500/30 text-white">
          <SheetHeader>
            <SheetTitle className="text-white">Select Transport Mode</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 mt-6 pb-6">
            {[
              { mode: 'walking', icon: Footprints, label: 'Walking' },
              { mode: 'cycling', icon: Bike, label: 'Cycling' },
              { mode: 'public_transport', icon: Train, label: 'Public Transit' },
              { mode: 'driving', icon: Car, label: 'Driving' }
            ].map(({ mode, icon: Icon, label }) => (
              <Button
                key={mode}
                variant={currentTransportMode === mode ? "default" : "outline"}
                className={`h-24 flex flex-col gap-2 ${
                  currentTransportMode === mode 
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                    : 'border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20'
                }`}
                onClick={() => handleChangeTransportMode(mode)}
              >
                <Icon className="w-8 h-8" />
                <span className="text-sm font-medium">{label}</span>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={showLayersSheet} onOpenChange={setShowLayersSheet}>
        <SheetContent side="bottom" className="bg-[#0f5132] border-emerald-500/30 text-white">
          <SheetHeader>
            <SheetTitle className="text-white">Map Layers</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-medium">Heatmap</span>
              </div>
              <Button
                size="sm"
                variant={showHeatmap ? "default" : "outline"}
                className={showHeatmap ? "bg-emerald-500 hover:bg-emerald-600" : "border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20"}
                onClick={() => setShowHeatmap(!showHeatmap)}
              >
                {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-emerald-400" />
                <span className="text-white font-medium">Eco Waypoints</span>
              </div>
              <Button
                size="sm"
                variant={showWaypoints ? "default" : "outline"}
                className={showWaypoints ? "bg-emerald-500 hover:bg-emerald-600" : "border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20"}
                onClick={() => setShowWaypoints(!showWaypoints)}
              >
                {showWaypoints ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-white font-medium">Green Actions</span>
              </div>
              <Button
                size="sm"
                variant={showGreenActions ? "default" : "outline"}
                className={showGreenActions ? "bg-emerald-500 hover:bg-emerald-600" : "border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20"}
                onClick={() => setShowGreenActions(!showGreenActions)}
              >
                {showGreenActions ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-white font-medium">Hazard Zones</span>
              </div>
              <Button
                size="sm"
                variant={showHazards ? "default" : "outline"}
                className={showHazards ? "bg-emerald-500 hover:bg-emerald-600" : "border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20"}
                onClick={() => setShowHazards(!showHazards)}
              >
                {showHazards ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Route className="w-5 h-5 text-purple-400" />
                <span className="text-white font-medium">Route History</span>
              </div>
              <Button
                size="sm"
                variant={showRouteHistory ? "default" : "outline"}
                className={showRouteHistory ? "bg-emerald-500 hover:bg-emerald-600" : "border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20"}
                onClick={() => setShowRouteHistory(!showRouteHistory)}
              >
                {showRouteHistory ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>

            <div className="pt-4 border-t border-emerald-500/20">
              <Button
                size="sm"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => {
                  setShowLayersSheet(false);
                  setDialogType('volunteer');
                  setShowAddDialog(true);
                }}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Add Volunteer Event
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
          <Card className="bg-[#0f5132] border-emerald-500/30 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {dialogType === 'waypoint' ? 'Add Eco Spot' : 'Add Volunteer Event'}
              </h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  setShowAddDialog(false);
                  setAddressSearch('');
                }}
                className="text-white hover:bg-emerald-500/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {dialogType === 'volunteer' && (
              <div className="mb-4 p-3 bg-emerald-900/30 border border-emerald-500/30 rounded-lg">
                <p className="text-xs text-emerald-200/70 mb-2">
                  📍 Enter an address or use your current location
                </p>
                <div className="flex gap-2">
                  <Input
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                    placeholder="Enter address in Virginia..."
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white placeholder-emerald-300/70"
                  />
                  <Button
                    size="sm"
                    onClick={handleSearchAddress}
                    disabled={searchingAddress}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {searchingAddress ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {newVolunteerEvent.address && (
                  <p className="text-xs text-emerald-300 mt-2">
                    ✓ {newVolunteerEvent.address}
                  </p>
                )}
              </div>
            )}

            {dialogType === 'waypoint' ? (
              <form onSubmit={handleAddWaypoint} className="space-y-4">
                <div>
                  <Label className="text-white">Name</Label>
                  <Input
                    value={newWaypoint.name}
                    onChange={(e) => setNewWaypoint({...newWaypoint, name: e.target.value})}
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white placeholder-emerald-300/70"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={newWaypoint.description}
                    onChange={(e) => setNewWaypoint({...newWaypoint, description: e.target.value})}
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white placeholder-emerald-300/70"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-white">Type</Label>
                  <Select
                    value={newWaypoint.type}
                    onValueChange={(value) => setNewWaypoint({...newWaypoint, type: value})}
                  >
                    <SelectTrigger className="bg-[#1e4d3a] border-emerald-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e4d3a] border-emerald-500/30 text-white">
                      <SelectItem value="park">Park</SelectItem>
                      <SelectItem value="recycling_center">Recycling Center</SelectItem>
                      <SelectItem value="charging_station">EV Charging</SelectItem>
                      <SelectItem value="bike_station">Bike Station</SelectItem>
                      <SelectItem value="community_garden">Community Garden</SelectItem>
                      <SelectItem value="water_refill">Water Refill</SelectItem>
                      <SelectItem value="eco_store">Eco Store</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white"
                  disabled={createWaypointMutation.isPending}
                >
                  {createWaypointMutation.isPending ? 'Adding...' : 'Add Eco Spot'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleAddVolunteer} className="space-y-4">
                <div>
                  <Label className="text-white">Event Title *</Label>
                  <Input
                    value={newVolunteerEvent.title}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, title: e.target.value})}
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white placeholder-emerald-300/70"
                    placeholder="e.g., Beach Cleanup"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Description *</Label>
                  <Textarea
                    value={newVolunteerEvent.description}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, description: e.target.value})}
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white placeholder-emerald-300/70"
                    placeholder="Describe the volunteer opportunity..."
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Event Type</Label>
                  <Select
                    value={newVolunteerEvent.action_type}
                    onValueChange={(value) => setNewVolunteerEvent({...newVolunteerEvent, action_type: value})}
                  >
                    <SelectTrigger className="bg-[#1e4d3a] border-emerald-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e4d3a] border-emerald-500/30 text-white">
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="plant_tree">Tree Planting</SelectItem>
                      <SelectItem value="cleanup_event">Cleanup Event</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Event Date *</Label>
                  <Input
                    type="date"
                    value={newVolunteerEvent.date}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, date: e.target.value})}
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Eco Points Reward</Label>
                  <Input
                    type="number"
                    value={newVolunteerEvent.points_reward}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, points_reward: parseInt(e.target.value) || 0})}
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white placeholder-emerald-300/70"
                    min="10"
                    max="200"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={createVolunteerMutation.isPending}
                >
                  {createVolunteerMutation.isPending ? 'Creating...' : 'Create Event'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}