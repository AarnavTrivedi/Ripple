
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Fixed import typo here
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Navigation, Plus, X, AlertTriangle, Calendar } from "lucide-react";
import L from "leaflet";
import { format } from "date-fns";
import "leaflet/dist/leaflet.css";

function LocationMarker({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 13);
    }
  }, [position, map]);

  if (!position) return null;

  return (
    <Circle
      center={position}
      radius={100}
      pathOptions={{
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.3
      }}
    />
  );
}

export default function MapPage() {
  const queryClient = useQueryClient();
  const [userLocation, setUserLocation] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dialogType, setDialogType] = useState('waypoint');
  const [showHazards, setShowHazards] = useState(true);
  
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

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
          
          if (showAddDialog) {
            if (dialogType === 'waypoint' && !newWaypoint.latitude) {
              setNewWaypoint(prev => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              }));
            }
            if (dialogType === 'volunteer' && !newVolunteerEvent.latitude) {
              setNewVolunteerEvent(prev => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
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
  }, [showAddDialog, dialogType, newWaypoint.latitude, newVolunteerEvent.latitude]);

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
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-[#0f5132]/95 backdrop-blur border-b border-emerald-500/20 px-6 py-4 z-[1001]">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Eco Map</h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={showHazards ? "default" : "outline"}
              className={showHazards ? "bg-emerald-500 hover:bg-emerald-600" : "border-emerald-500/30"}
              onClick={() => setShowHazards(!showHazards)}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Hazards
            </Button>
            <Button
              size="sm"
              className="bg-emerald-500 hover:bg-emerald-600"
              onClick={() => {
                setDialogType('waypoint');
                setShowAddDialog(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Spot
            </Button>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-600"
              onClick={() => {
                setDialogType('volunteer');
                setShowAddDialog(true);
              }}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Add Event
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
          
          <LocationMarker position={userLocation} />

          {waypoints.map((waypoint) => (
            <Marker
              key={waypoint.id}
              position={[waypoint.latitude, waypoint.longitude]}
              icon={getMarkerIcon(waypoint.type)}
            >
              <Popup>
                <div>
                  <h3 className="font-semibold">{waypoint.name}</h3>
                  <p className="text-sm">{waypoint.description}</p>
                  <p className="text-xs mt-1 capitalize">{waypoint.type.replace(/_/g, ' ')}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {greenActions.filter(a => a.latitude && a.longitude).map((action) => (
            <Marker
              key={action.id}
              position={[action.latitude, action.longitude]}
              icon={getMarkerIcon(null, true)}
            >
              <Popup>
                <div>
                  <h3 className="font-semibold">{action.title}</h3>
                  <p className="text-sm">{action.description}</p>
                  <p className="text-xs mt-1">{format(new Date(action.date), 'MMM d, yyyy')}</p>
                  {action.points_reward && (
                    <p className="text-xs text-emerald-600 mt-1">+{action.points_reward} points</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {showHazards && hazards.map((hazard) => {
            const color = hazard.hazard_level > 60 ? '#ef4444' : hazard.hazard_level > 40 ? '#f59e0b' : '#fbbf24';
            return (
              <Circle
                key={hazard.id}
                center={[hazard.latitude, hazard.longitude]}
                radius={hazard.hazard_level * 10}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2
                }}
              >
                <Popup>
                  <div>
                    <h3 className="font-semibold">{hazard.name}</h3>
                    <p className="text-sm">{hazard.description}</p>
                    <p className="text-xs mt-1">Level: {hazard.hazard_level}/100</p>
                  </div>
                </Popup>
              </Circle>
            );
          })}
        </MapContainer>
      </div>

      {/* Add Dialog */}
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
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={newWaypoint.description}
                    onChange={(e) => setNewWaypoint({...newWaypoint, description: e.target.value})}
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white"
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
                    <SelectContent className="bg-[#1e4d3a] border-emerald-500/30">
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
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                    placeholder="e.g., Beach Cleanup at Virginia Beach"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={newVolunteerEvent.description}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, description: e.target.value})}
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white"
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
                    <SelectContent className="bg-[#1e4d3a] border-emerald-500/30">
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
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                    required
                  />
                </div>

                <div>
                  <Label className="text-white">Eco Points Reward</Label>
                  <Input
                    type="number"
                    value={newVolunteerEvent.points_reward}
                    onChange={(e) => setNewVolunteerEvent({...newVolunteerEvent, points_reward: parseInt(e.target.value)})}
                    className="bg-[#1e4d3a] border-emerald-500/30 text-white"
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
