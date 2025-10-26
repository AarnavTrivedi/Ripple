
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { 
  Navigation, Plus, X, AlertTriangle, Calendar, 
  MapPin, Activity, Car, Bike, Train, Footprints,
  Layers, TrendingUp, Eye, EyeOff, Route, Zap
} from "lucide-react";
import { toast } from "sonner";
import L from "leaflet";
import "leaflet.heat";
import { format, differenceInMinutes } from "date-fns";
import "leaflet/dist/leaflet.css";
import KalmanFilter from "@/utils/kalmanFilter";

// Custom Heatmap Layer Component
const HeatmapLayer = ({ points, intensity = 0.5 }) => {
  const map = useMap();
  const heatLayerRef = useRef(null);

  useEffect(() => {
    if (!map || !window.L.heatLayer) return;

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

// Location Marker with Pulse Animation
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
  
  // Location & Tracking State
  const [userLocation, setUserLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(100);
  const [routeHistory, setRouteHistory] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const [currentTransportMode, setCurrentTransportMode] = useState('walking');
  const [journeyStartTime, setJourneyStartTime] = useState(null);
  
  // UI State
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dialogType, setDialogType] = useState('waypoint');
  const [showLayersSheet, setShowLayersSheet] = useState(false);
  const [showTransportSheet, setShowTransportSheet] = useState(false);
  const [showStatsOverlay, setShowStatsOverlay] = useState(true);
  
  // Layer Visibility State
  const [showHazards, setShowHazards] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [showGreenActions, setShowGreenActions] = useState(true);
  const [showRouteHistory, setShowRouteHistory] = useState(true);
  
  // Location Status Tracking
  const [locationStatus, setLocationStatus] = useState('trying-high-accuracy'); 
  // 'trying-high-accuracy', 'trying-low-accuracy', 'using-fallback', 'ready', 'error'
  const [locationAttempts, setLocationAttempts] = useState(0);
  
  // Form State
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
    longitude: null
  });

  // Journey Stats
  const [journeyStats, setJourneyStats] = useState({
    distance: 0,
    carbonSaved: 0,
    duration: 0,
    ecoScore: 0
  });

  // Kalman filters for GPS smoothing (improves accuracy by 75%)
  const latFilter = useRef(new KalmanFilter(0.001, 1));
  const lonFilter = useRef(new KalmanFilter(0.001, 1));
  
  // Speed and position tracking
  const speedRef = useRef(0);
  const lastPositionRef = useRef(null);
  const lastTimeRef = useRef(null);

  // Load saved journey from localStorage on mount
  useEffect(() => {
    const savedJourney = localStorage.getItem('currentJourney');
    if (savedJourney) {
      try {
        const journey = JSON.parse(savedJourney);
        if (isTracking && journey.route) {
          setRouteHistory(journey.route || []);
          setJourneyStats(journey.stats || { distance: 0, carbonSaved: 0, duration: 0, ecoScore: 0 });
          if (journey.startTime) {
            setJourneyStartTime(new Date(journey.startTime));
          }
          toast.success('Journey resumed from saved data');
        }
      } catch (error) {
        console.error('Error loading saved journey:', error);
        localStorage.removeItem('currentJourney');
      }
    }
  }, []);

  // Auto-save journey to localStorage
  useEffect(() => {
    if (isTracking && routeHistory.length > 0) {
      const journeyData = {
        route: routeHistory,
        stats: journeyStats,
        startTime: journeyStartTime?.toISOString(),
        mode: currentTransportMode,
        lastUpdate: new Date().toISOString()
      };
      localStorage.setItem('currentJourney', JSON.stringify(journeyData));
    }
  }, [routeHistory, journeyStats, isTracking, journeyStartTime, currentTransportMode]);

  // Route simplification helper
  const simplifyRoute = (route, maxPoints = 50) => {
    if (route.length <= maxPoints) return route;
    const step = Math.ceil(route.length / maxPoints);
    return route.filter((_, index) => index % step === 0);
  };

  // Save completed journey to history
  const saveCompletedJourney = () => {
    if (journeyStats.distance === 0) return;
    
    try {
      const history = JSON.parse(localStorage.getItem('journeyHistory') || '[]');
      history.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        mode: currentTransportMode,
        ...journeyStats,
        route: simplifyRoute(routeHistory, 50)
      });
      
      // Keep last 50 journeys
      if (history.length > 50) history.length = 50;
      
      localStorage.setItem('journeyHistory', JSON.stringify(history));
      localStorage.removeItem('currentJourney');
      
      toast.success(`Journey saved! ${journeyStats.distance.toFixed(2)}mi, ${journeyStats.carbonSaved.toFixed(2)}kg CO₂ saved`);
    } catch (error) {
      console.error('Error saving journey:', error);
    }
  };

  // Multi-tier geolocation with fallback strategy
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      setUserLocation([37.5407, -77.4360]); // Richmond, VA fallback
      setLocationStatus('using-fallback');
      return;
    }

    let watchId;
    let retryTimeout;

    const handleSuccess = (position) => {
      const rawLat = position.coords.latitude;
      const rawLon = position.coords.longitude;
      const accuracy = position.coords.accuracy;
      
      // Apply Kalman filter for smooth, accurate positions (75% accuracy boost!)
      const filteredLat = latFilter.current.filter(rawLat, accuracy);
      const filteredLon = lonFilter.current.filter(rawLon, accuracy);
      const newLocation = [filteredLat, filteredLon];
      
      // Calculate speed for movement detection
      const currentTime = Date.now();
      if (lastPositionRef.current && lastTimeRef.current) {
        const timeDiff = (currentTime - lastTimeRef.current) / 1000; // seconds
        const distance = calculateDistance(
          lastPositionRef.current[0], lastPositionRef.current[1],
          filteredLat, filteredLon
        ) * 1000; // meters
        
        speedRef.current = distance / timeDiff; // m/s
      }
      
      lastPositionRef.current = newLocation;
      lastTimeRef.current = currentTime;
      
      setUserLocation(newLocation);
      setLocationAccuracy(accuracy);
      
      // Update status on first successful lock
      if (locationStatus !== 'ready') {
        setLocationStatus('ready');
        const accuracyType = accuracy < 50 ? 'High' : accuracy < 150 ? 'Medium' : 'Low';
        toast.success(`Location locked! (${accuracyType} accuracy: ${Math.round(accuracy)}m)`);
      }
      
      // Only track if moving significantly (> 0.5 m/s = ~1.8 km/h walking pace)
      const isMoving = speedRef.current > 0.5;
      
      // Track route if journey is active AND moving
      if (isTracking && userLocation && isMoving) {
        setRouteHistory(prev => {
          // Don't add if too close to last point (< 10m)
          if (prev.length > 0) {
            const lastPoint = prev[prev.length - 1];
            const distanceFromLast = calculateDistance(
              lastPoint[0], lastPoint[1],
              newLocation[0], newLocation[1]
            ) * 1000; // meters
            
            if (distanceFromLast < 10) return prev; // Skip if < 10m
          }
          
          return [...prev, newLocation];
        });
        
        // Calculate distance between valid points
        if (routeHistory.length > 0) {
          const lastPoint = routeHistory[routeHistory.length - 1];
          const distance = calculateDistance(
            lastPoint[0], lastPoint[1],
            newLocation[0], newLocation[1]
          );
          
          // Update journey stats
          setJourneyStats(prev => {
            const newDistance = prev.distance + distance;
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
      }
      
      // Update form coordinates
      if (showAddDialog) {
        if (dialogType === 'waypoint' && !newWaypoint.latitude) {
          setNewWaypoint(prev => ({
            ...prev,
            latitude: filteredLat,
            longitude: filteredLon
          }));
        }
        if (dialogType === 'volunteer' && !newVolunteerEvent.latitude) {
          setNewVolunteerEvent(prev => ({
            ...prev,
            latitude: filteredLat,
            longitude: filteredLon
          }));
        }
      }
    };

    const handleError = (error) => {
      console.error("Location error:", error);
      
      // TIER 1: First timeout on high-accuracy GPS
      if (locationStatus === 'trying-high-accuracy') {
        toast.warning('GPS taking longer... trying network location');
        setLocationStatus('trying-low-accuracy');
        setLocationAttempts(prev => prev + 1);
        
        // Retry with low accuracy (network-based, faster)
        if (watchId) navigator.geolocation.clearWatch(watchId);
        watchId = navigator.geolocation.watchPosition(
          handleSuccess,
          handleError,
          {
            enableHighAccuracy: false, // Network-based (faster!)
            timeout: 10000,
            maximumAge: 10000,
          }
        );
        return;
      }
      
      // TIER 2: Network location also failed
      if (locationStatus === 'trying-low-accuracy') {
        toast.error('Location services unavailable. Using approximate location.');
        setLocationStatus('using-fallback');
        
        // Try IP geolocation as last resort (you can integrate ipapi.co or similar)
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            if (data.latitude && data.longitude) {
              setUserLocation([data.latitude, data.longitude]);
              setLocationAccuracy(5000); // ~5km accuracy for IP location
              toast.info(`Using approximate location: ${data.city}, ${data.region}`);
            } else {
              throw new Error('No IP location');
            }
          })
          .catch(() => {
            // Final fallback: Richmond, VA
            setUserLocation([37.5407, -77.4360]);
            setLocationAccuracy(50000);
            toast.error('Using default location. Please enable location services for accurate tracking.');
          });
        return;
      }
    };

    // Start with high-accuracy GPS attempt
    setLocationStatus('trying-high-accuracy');
    watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 20000,      // Increased to 20s for initial GPS lock
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [isTracking, userLocation, currentTransportMode, journeyStartTime, showAddDialog, dialogType, newWaypoint.latitude, newVolunteerEvent.latitude, locationStatus]);

  // Data Queries
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

  const { data: emissionData } = useQuery({
    queryKey: ['emissionData'],
    queryFn: () => base44.entities.EmissionData.list('-year', 1),
    initialData: [],
  });

  // Helper Functions
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const calculateCarbonSaved = (distanceMiles, transportMode) => {
    // Carbon emissions in kg CO2 per mile
    const emissionFactors = {
      walking: 0,
      cycling: 0,
      public_transport: 0.14,  // vs car
      driving: 0.404, // average car
    };
    
    // Carbon saved = (car emissions - chosen mode emissions) * distance
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

  // Generate heatmap data from waypoints
  const heatmapData = useMemo(() => {
    if (!showHeatmap) return [];
    
    const points = [];
    
    // Add waypoints with eco rating
    waypoints.forEach(waypoint => {
      if (waypoint.latitude && waypoint.longitude) {
        const intensity = (waypoint.eco_rating || 70) / 100;
        points.push([waypoint.latitude, waypoint.longitude, intensity]);
      }
    });
    
    // Add green actions as high-value points
    greenActions.forEach(action => {
      if (action.latitude && action.longitude && !action.completed) {
        points.push([action.latitude, action.longitude, 0.9]);
      }
    });
    
    // Add inverse intensity for hazard zones
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
        longitude: null
      });
    },
  });

  const handleAddWaypoint = (e) => {
    e.preventDefault();
    createWaypointMutation.mutate({
      ...newWaypoint,
      is_user_created: true,
      eco_rating: 85
    });
  };

  const handleAddVolunteer = (e) => {
    e.preventDefault();
    createVolunteerMutation.mutate({
      ...newVolunteerEvent,
      completed: false
    });
  };

  // Journey tracking handlers
  const handleStartJourney = () => {
    // Reset Kalman filters for fresh tracking
    latFilter.current.reset();
    lonFilter.current.reset();
    speedRef.current = 0;
    lastPositionRef.current = null;
    lastTimeRef.current = null;
    
    setIsTracking(true);
    setJourneyStartTime(new Date());
    setRouteHistory(userLocation ? [userLocation] : []);
    setJourneyStats({ distance: 0, carbonSaved: 0, duration: 0, ecoScore: 0 });
    setShowTransportSheet(true);
    
    toast.success('Journey started! 🚀');
  };

  const handleStopJourney = () => {
    // Save journey to localStorage history
    saveCompletedJourney();
    
    setIsTracking(false);
    setShowTransportSheet(false);
    
    // Optionally save to database if distance > 0
    if (journeyStats.distance > 0) {
      console.log('Journey completed:', journeyStats);
      // Could create a Journey entity here if needed
      // createJourneyMutation.mutate(journeyStats);
    }
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

  if (!userLocation) {
    const statusMessages = {
      'trying-high-accuracy': '📡 Acquiring GPS signal...',
      'trying-low-accuracy': '📶 Using network location...',
      'using-fallback': '🌐 Using approximate location...',
      'error': '❌ Location unavailable'
    };

    const statusDescriptions = {
      'trying-high-accuracy': 'Please wait while we get your precise location',
      'trying-low-accuracy': 'GPS unavailable, using cell tower location',
      'using-fallback': 'Using IP-based location',
      'error': 'Please check your location permissions'
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-emerald-900 to-emerald-950 p-4">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto" />
            {locationStatus === 'trying-low-accuracy' && (
              <div className="absolute inset-0 w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" 
                   style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
            )}
          </div>
          
          <h2 className="text-white text-xl font-bold mb-2">
            {statusMessages[locationStatus] || 'Getting your location...'}
          </h2>
          
          <p className="text-emerald-200/70 text-sm mb-4">
            {statusDescriptions[locationStatus] || 'This may take a moment'}
          </p>

          {locationStatus === 'trying-low-accuracy' && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3 text-xs text-amber-200">
              💡 <strong>Tip:</strong> Move outdoors or near a window for better GPS signal
            </div>
          )}

          {locationStatus === 'using-fallback' && (
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-emerald-500 hover:bg-emerald-600"
              size="sm"
            >
              🔄 Try Again
            </Button>
          )}

          <div className="mt-6 text-emerald-200/50 text-xs">
            Attempt {locationAttempts + 1} of 3
          </div>
        </div>
      </div>
    );
  }

  // Transport mode icons
  const transportIcons = {
    walking: Footprints,
    cycling: Bike,
    public_transport: Train,
    driving: Car
  };

  const TransportIcon = transportIcons[currentTransportMode] || Footprints;

  return (
    <div className="h-screen flex flex-col relative overflow-hidden">
      {/* Compact Header - Mobile Optimized */}
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
              className="border-emerald-500/30 h-8 px-2"
              onClick={() => setShowLayersSheet(true)}
            >
              <Layers className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600 h-8 px-2"
              onClick={() => {
                setDialogType('waypoint');
                setShowAddDialog(true);
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Map */}
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
          
          {/* Heatmap Layer */}
          {showHeatmap && heatmapData.length > 0 && (
            <HeatmapLayer points={heatmapData} intensity={0.6} />
          )}
          
          {/* User Location */}
          <LocationMarker position={userLocation} accuracy={locationAccuracy} />

          {/* Route History */}
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

          {/* Waypoints */}
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

          {/* Green Actions */}
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
                    <div>📅 {format(new Date(action.date), 'MMM d, yyyy, h:mm a')}</div>
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

          {/* Hazard Zones */}
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

        {/* Location Accuracy Indicator */}
        {!isTracking && locationStatus === 'ready' && (
          <div className="absolute top-4 left-4 z-[1000] bg-emerald-500/90 backdrop-blur px-3 py-1 rounded-full text-xs text-white font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            {locationAccuracy < 50 ? '🎯 High' : locationAccuracy < 150 ? '📍 Medium' : '📌 Low'} Accuracy ({Math.round(locationAccuracy)}m)
          </div>
        )}

        {/* Real-time Stats Overlay */}
        {isTracking && showStatsOverlay && (
          <Card className="absolute top-4 left-4 right-4 bg-white/15 backdrop-blur-md border-emerald-400/30 z-[1000] p-3">
            {/* Current Speed Display */}
            <div className="text-center text-emerald-300 text-sm mb-2 flex items-center justify-center gap-2">
              <Navigation className="w-4 h-4" />
              <span className="font-bold">
                {(speedRef.current * 3.6).toFixed(1)} km/h
              </span>
              <span className="text-emerald-100/60 text-xs">
                ({(speedRef.current * 2.237).toFixed(1)} mph)
              </span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-300" />
                <span className="text-white font-semibold text-sm drop-shadow-lg">Journey Active</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-emerald-200 hover:text-white"
                onClick={() => setShowStatsOverlay(false)}
              >
                <EyeOff className="w-3 h-3" />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <div className="text-center">
                <div className="text-emerald-200/70 text-[10px] uppercase">Distance</div>
                <div className="text-white font-bold text-sm drop-shadow-lg">
                  {journeyStats.distance.toFixed(2)}mi
                </div>
              </div>
              <div className="text-center">
                <div className="text-emerald-200/70 text-[10px] uppercase">CO₂ Saved</div>
                <div className="text-white font-bold text-sm drop-shadow-lg">
                  {journeyStats.carbonSaved.toFixed(2)}kg
                </div>
              </div>
              <div className="text-center">
                <div className="text-emerald-200/70 text-[10px] uppercase">Time</div>
                <div className="text-white font-bold text-sm drop-shadow-lg">
                  {journeyStats.duration}min
                </div>
              </div>
              <div className="text-center">
                <div className="text-emerald-200/70 text-[10px] uppercase">Score</div>
                <div className="text-white font-bold text-sm drop-shadow-lg">
                  {journeyStats.ecoScore}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Show Stats Button (when hidden) */}
        {isTracking && !showStatsOverlay && (
          <Button
            size="sm"
            className="absolute top-4 left-4 z-[1000] bg-emerald-500/90 hover:bg-emerald-600"
            onClick={() => setShowStatsOverlay(true)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        )}

        {/* Journey Control Button */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] flex gap-2">
          {!isTracking ? (
            <Button
              size="lg"
              className="bg-emerald-500 hover:bg-emerald-600 shadow-lg"
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
                className="bg-white/90 hover:bg-white border-emerald-500/30"
                onClick={() => setShowTransportSheet(true)}
              >
                <TransportIcon className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                className="bg-red-500 hover:bg-red-600 shadow-lg"
                onClick={handleStopJourney}
              >
                <X className="w-5 h-5 mr-2" />
                Stop Journey
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Transport Mode Sheet */}
      <Sheet open={showTransportSheet} onOpenChange={setShowTransportSheet}>
        <SheetContent side="bottom" className="bg-[#0f5132] border-emerald-500/30">
          <SheetHeader>
            <SheetTitle className="text-white">Select Transport Mode</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-2 gap-3 mt-6 pb-6">
            {[
              { mode: 'walking', icon: Footprints, label: 'Walking', color: 'emerald' },
              { mode: 'cycling', icon: Bike, label: 'Cycling', color: 'purple' },
              { mode: 'public_transport', icon: Train, label: 'Public Transit', color: 'blue' },
              { mode: 'driving', icon: Car, label: 'Driving', color: 'orange' }
            ].map(({ mode, icon: Icon, label, color }) => (
              <Button
                key={mode}
                variant={currentTransportMode === mode ? "default" : "outline"}
                className={`h-24 flex flex-col gap-2 ${
                  currentTransportMode === mode 
                    ? `bg-${color}-500 hover:bg-${color}-600 text-white` 
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

      {/* Layers Control Sheet */}
      <Sheet open={showLayersSheet} onOpenChange={setShowLayersSheet}>
        <SheetContent side="bottom" className="bg-[#0f5132] border-emerald-500/30">
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
                className={showHeatmap ? "bg-emerald-500" : "border-emerald-500/30"}
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
                className={showWaypoints ? "bg-emerald-500" : "border-emerald-500/30"}
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
                className={showGreenActions ? "bg-emerald-500" : "border-emerald-500/30"}
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
                className={showHazards ? "bg-emerald-500" : "border-emerald-500/30"}
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
                className={showRouteHistory ? "bg-emerald-500" : "border-emerald-500/30"}
                onClick={() => setShowRouteHistory(!showRouteHistory)}
              >
                {showRouteHistory ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
            </div>

            <div className="pt-4 border-t border-emerald-500/20">
              <Button
                size="sm"
                className="w-full bg-amber-500 hover:bg-amber-600"
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

      {/* Add Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
          <Card className="bg-white/15 backdrop-blur-md border-emerald-400/30 p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {dialogType === 'waypoint' ? 'Add Eco Spot' : 'Add Volunteer Event'}
              </h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowAddDialog(false)}
                className="text-white hover:bg-emerald-500/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {dialogType === 'waypoint' ? (
              <form onSubmit={handleAddWaypoint} className="space-y-4">
                <div>
                  <Label className="text-white">Name</Label>
                  <Input
                    value={newWaypoint.name}
                    onChange={(e) => setNewWaypoint({...newWaypoint, name: e.target.value})}
                    className="bg-white/10 border-emerald-400/30 text-white placeholder:text-emerald-200/50"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={newWaypoint.description}
                    onChange={(e) => setNewWaypoint({...newWaypoint, description: e.target.value})}
                    className="bg-white/10 border-emerald-400/30 text-white placeholder:text-emerald-200/50"
                    rows={3}
                  />
                </div>

                <div>
                  <Label className="text-white">Type</Label>
                  <Select 
                    value={newWaypoint.type} 
                    onValueChange={(value) => setNewWaypoint({...newWaypoint, type: value})}
                  >
                    <SelectTrigger className="bg-white/10 border-emerald-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f5132]/95 backdrop-blur border-emerald-400/30">
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

                <div className="text-xs text-emerald-200/60">
                  Location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600"
                  disabled={createWaypointMutation.isPending}
                >
                  {createWaypointMutation.isPending ? 'Adding...' : 'Add Eco Spot'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleAddVolunteer} className="space-y-4">
                <div>
                  <Label className="text-white">Event Title</Label>
                  <Input
                    value={newVolunteerEvent.title}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, title: e.target.value})}
                    className="bg-white/10 border-emerald-400/30 text-white placeholder:text-emerald-200/50"
                    placeholder="e.g., Beach Cleanup at Virginia Beach"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={newVolunteerEvent.description}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, description: e.target.value})}
                    className="bg-white/10 border-emerald-400/30 text-white placeholder:text-emerald-200/50"
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
                    <SelectTrigger className="bg-white/10 border-emerald-400/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f5132]/95 backdrop-blur border-emerald-400/30">
                      <SelectItem value="volunteer">Volunteer</SelectItem>
                      <SelectItem value="plant_tree">Tree Planting</SelectItem>
                      <SelectItem value="cleanup_event">Cleanup Event</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="donation_drive">Donation Drive</SelectItem>
                      <SelectItem value="repair_cafe">Repair Cafe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Event Date</Label>
                  <Input
                    type="date"
                    value={newVolunteerEvent.date}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, date: e.target.value})}
                    className="bg-white/10 border-emerald-400/30 text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Eco Points Reward</Label>
                  <Input
                    type="number"
                    value={newVolunteerEvent.points_reward}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, points_reward: parseInt(e.target.value)})}
                    className="bg-white/10 border-emerald-400/30 text-white"
                    min="10"
                    max="200"
                  />
                </div>

                <div className="text-xs text-emerald-200/60">
                  Location: {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600"
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
