
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
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
  Plus, X, AlertTriangle, Calendar, 
  MapPin, Activity, Car, Bike, Train, Footprints,
  Layers, Eye, EyeOff, Route, Zap, Search, Flame
} from "lucide-react";
import L from "leaflet";
import { format, differenceInMinutes } from "date-fns";
import "leaflet/dist/leaflet.css";
import EmissionsComparison from "../components/map/EmissionsComparison";

// Initialize leaflet.heat dynamically to avoid SSR issues
if (typeof window !== 'undefined' && L.heatLayer === undefined) {
  import('leaflet.heat').then(() => {
    // leaflet.heat is now loaded and available as L.heatLayer
    // No need to explicitly set L.heatLayer, the import modifies L
    console.log('Leaflet.heat loaded');
  }).catch(error => console.error("Failed to load leaflet.heat:", error));
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, accuracy }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.setView(position, map.getZoom());
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <>
      <Circle
        center={position}
        radius={accuracy || 50}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 0.1,
          weight: 2
        }}
      />
      <Circle
        center={position}
        radius={8}
        pathOptions={{
          color: '#10b981',
          fillColor: '#10b981',
          fillOpacity: 1,
          weight: 3
        }}
      />
    </>
  );
};

const HeatmapLayer = ({ waypoints, greenActions }) => {
  const map = useMap();

  useEffect(() => {
    // Only attempt to create heat layer if L.heatLayer is available (meaning it's loaded)
    if (!map || (!waypoints.length && !greenActions.length) || typeof L.heatLayer === 'undefined') {
      return;
    }

    const points = [];
    
    waypoints.forEach(wp => {
      if (wp.latitude && wp.longitude) {
        const intensity = (wp.eco_rating || 50) / 100;
        points.push([wp.latitude, wp.longitude, intensity]);
      }
    });

    greenActions.forEach(action => {
      if (action.latitude && action.longitude) {
        points.push([action.latitude, action.longitude, 0.8]);
      }
    });

    if (points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: '#3b82f6',
        0.5: '#10b981',
        1.0: '#fbbf24'
      }
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, waypoints, greenActions]);

  return null;
};

export default function MapPage() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  
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
  const [showEmissionsWidget, setShowEmissionsWidget] = useState(false);
  
  const [showHazards, setShowHazards] = useState(true);
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [showGreenActions, setShowGreenActions] = useState(true);
  const [showRouteHistory, setShowRouteHistory] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(false);
  
  const [addressSearch, setAddressSearch] = useState('');
  const [searchingAddress, setSearchingAddress] = useState(false);
  const [locationName, setLocationName] = useState("Your Area");

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
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      // Handle cases where geolocation is not available (e.g., SSR, unsupported browsers)
      console.warn("Geolocation is not supported or available.");
      setUserLocation([37.5407, -77.4360]); // Default to a central Virginia location
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation = [position.coords.latitude, position.coords.longitude];
        const accuracy = position.coords.accuracy;
        
        setUserLocation(newLocation);
        setLocationAccuracy(accuracy);

        // Get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLocation[0]}&lon=${newLocation[1]}`
          );
          const data = await response.json();
          setLocationName(data.address.county || data.address.city || data.address.state || "Your Area");
        } catch (error) {
          console.error("Error getting location name:", error);
        }
        
        if (isTracking && routeHistory.length > 0) {
          const lastPoint = routeHistory[routeHistory.length - 1];
          const distance = calculateDistance(
            lastPoint[0], lastPoint[1],
            newLocation[0], newLocation[1]
          );
          
          if (distance > 0.001) {
            setRouteHistory(prev => [...prev, newLocation]);
            
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
        }
      },
      (error) => {
        console.error("Location error:", error);
        setUserLocation([37.5407, -77.4360]); // Default to a central Virginia location on error
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isTracking, routeHistory, currentTransportMode, journeyStartTime]);

  const { data: todayScore } = useQuery({
    queryKey: ['todayScore', currentUser?.email],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const scores = await base44.entities.EcoScore.filter(
        { created_by: currentUser?.email, date: today },
        '-created_date',
        1
      );
      return scores[0] || null;
    },
    enabled: !!currentUser,
  });

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
    queryKey: ['emissions'],
    queryFn: () => base44.entities.EmissionData.list('-date', 50),
    initialData: [],
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EcoScore.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayScore'] });
    },
  });

  const createScoreMutation = useMutation({
    mutationFn: (data) => base44.entities.EcoScore.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayScore'] });
    },
  });

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

  const deleteVolunteerMutation = useMutation({
    mutationFn: (id) => base44.entities.GreenAction.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['greenActions'] });
    },
  });

  const deleteWaypointMutation = useMutation({
    mutationFn: (id) => base44.entities.EcoWaypoint.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waypoints'] });
    },
  });

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Radius of Earth in miles
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
      walking: 0, // kg CO2e per mile
      cycling: 0,
      public_transport: 0.14, // Avg for US public transit (e.g., bus, rail)
      driving: 0.404, // Avg for gasoline car (EPA, 2023)
    };
    
    const carEmissions = emissionFactors.driving; // Baseline comparison
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
    const durationBonus = Math.min(durationMinutes * 0.5, 20); // Max 20 points for duration
    const carbonBonus = Math.min(carbonSaved * 10, 30); // Max 30 points for carbon saved (approx 3kg)
    
    return Math.min(100, Math.round(baseScore + durationBonus + carbonBonus));
  };

  const handleDeleteVolunteer = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this volunteer event?')) {
      deleteVolunteerMutation.mutate(eventId);
    }
  };

  const handleDeleteWaypoint = async (waypointId) => {
    if (window.confirm('Are you sure you want to delete this eco spot?')) {
      deleteWaypointMutation.mutate(waypointId);
    }
  };

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
    
    // Use user's current location if no specific coords from address search
    const lat = newWaypoint.latitude || (userLocation ? userLocation[0] : null);
    const lon = newWaypoint.longitude || (userLocation ? userLocation[1] : null);

    if (lat === null || lon === null) {
      alert("Could not determine location for the eco spot. Please ensure location services are enabled or search for an address.");
      return;
    }
    
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
    
    // Use user's current location if no specific coords from address search
    const lat = newVolunteerEvent.latitude || (userLocation ? userLocation[0] : null);
    const lon = newVolunteerEvent.longitude || (userLocation ? userLocation[1] : null);

    if (lat === null || lon === null) {
      alert("Could not determine location for the volunteer event. Please ensure location services are enabled or search for an address.");
      return;
    }
    
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

  const saveJourneyToDatabase = async () => {
    if (journeyStats.distance === 0) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const transportMinutes = {
      walking_minutes: currentTransportMode === 'walking' ? journeyStats.duration : 0,
      cycling_minutes: currentTransportMode === 'cycling' ? journeyStats.duration : 0,
      public_transport_minutes: currentTransportMode === 'public_transport' ? journeyStats.duration : 0,
      driving_minutes: currentTransportMode === 'driving' ? journeyStats.duration : 0,
    };

    if (todayScore) {
      const updatedData = {
        ...todayScore,
        walking_minutes: (todayScore.walking_minutes || 0) + transportMinutes.walking_minutes,
        cycling_minutes: (todayScore.cycling_minutes || 0) + transportMinutes.cycling_minutes,
        public_transport_minutes: (todayScore.public_transport_minutes || 0) + transportMinutes.public_transport_minutes,
        driving_minutes: (todayScore.driving_minutes || 0) + transportMinutes.driving_minutes,
        carbon_saved_kg: (todayScore.carbon_saved_kg || 0) + journeyStats.carbonSaved,
        score: Math.min(100, (todayScore.score || 0) + Math.round(journeyStats.ecoScore / 2)),
        date: today
      };
      
      await updateScoreMutation.mutateAsync({
        id: todayScore.id,
        data: updatedData
      });
    } else {
      await createScoreMutation.mutateAsync({
        date: today,
        score: journeyStats.ecoScore,
        ...transportMinutes,
        green_actions_completed: 0,
        carbon_saved_kg: journeyStats.carbonSaved,
      });
    }
  };

  const handleStartJourney = () => {
    if (!userLocation) {
      alert("Cannot start journey: Your location is not yet available.");
      return;
    }
    
    setIsTracking(true);
    setJourneyStartTime(new Date());
    setRouteHistory([userLocation]);
    setJourneyStats({ distance: 0, carbonSaved: 0, duration: 0, ecoScore: 0 });
    setShowTransportSheet(true);
    setShowStatsOverlay(true);
  };

  const handleStopJourney = async () => {
    setIsTracking(false);
    setShowTransportSheet(false);
    
    if (journeyStats.distance > 0) {
      await saveJourneyToDatabase();
      
      alert(`Journey Complete! ✅\n\nDistance: ${journeyStats.distance.toFixed(2)} miles\nCO₂ Saved: ${journeyStats.carbonSaved.toFixed(2)} kg\nDuration: ${journeyStats.duration} min\nEco Score: +${Math.round(journeyStats.ecoScore / 2)} points\n\nYour activity has been saved to today's dashboard!`);
    } else {
      alert("Journey stopped. No significant distance traveled to save.");
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
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
            maxZoom={19}
          />
          
          <LocationMarker position={userLocation} accuracy={locationAccuracy} />

          {showHeatmap && (
            <HeatmapLayer waypoints={waypoints} greenActions={greenActions} />
          )}

          {showRouteHistory && routeHistory.length > 1 && (
            <Polyline
              positions={routeHistory}
              pathOptions={{
                color: currentTransportMode === 'walking' ? '#10b981' :
                       currentTransportMode === 'cycling' ? '#8b5cf6' :
                       currentTransportMode === 'public_transport' ? '#3b82f6' : '#f59e0b',
                weight: 5,
                opacity: 0.8
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
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base flex-1">{waypoint.name}</h3>
                    {waypoint.created_by === currentUser?.email && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteWaypoint(waypoint.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{waypoint.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="capitalize text-emerald-600">
                      {waypoint.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-emerald-700 font-medium">
                      ⭐ {waypoint.eco_rating || 85}/100
                    </span>
                  </div>
                  {waypoint.created_by === currentUser?.email && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Created by you</p>
                    </div>
                  )}
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
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-base flex-1">{action.title}</h3>
                    {action.created_by === currentUser?.email && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteVolunteer(action.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{action.description}</p>
                  <div className="space-y-1 text-xs text-gray-500">
                    <div>📅 {format(new Date(action.date), 'MMM d, yyyy')}</div>
                    {action.points_reward && (
                      <div className="text-emerald-600 font-semibold">
                        🏆 +{action.points_reward} Eco Points
                      </div>
                    )}
                  </div>
                  {action.created_by === currentUser?.email && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Created by you</p>
                    </div>
                  )}
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
                <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
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

        {showEmissionsWidget && emissionData.length > 0 && (
          <div className="absolute top-20 left-4 right-4 z-[1000] max-w-sm">
            <EmissionsComparison 
              emissionData={emissionData}
              currentLocation={locationName}
              compact={true}
            />
          </div>
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
                Stop & Save
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

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-white font-medium">Activity Heatmap</span>
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
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-white font-medium">Emissions Widget</span>
              </div>
              <Button
                size="sm"
                variant={showEmissionsWidget ? "default" : "outline"}
                className={showEmissionsWidget ? "bg-emerald-500 hover:bg-emerald-600" : "border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20"}
                onClick={() => setShowEmissionsWidget(!showEmissionsWidget)}
              >
                {showEmissionsWidget ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
