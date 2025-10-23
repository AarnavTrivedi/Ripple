import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Filter, Plus, Navigation, AlertTriangle } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import AddWaypointDialog from "../components/map/AddWaypointDialog";
import WaypointDetails from "../components/map/WaypointDetails";

export default function MapPage() {
  const [center] = useState([37.7749, -122.4194]); // San Francisco default
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [showHazards, setShowHazards] = useState(true);

  const { data: waypoints, isLoading: waypointsLoading } = useQuery({
    queryKey: ['waypoints'],
    queryFn: () => base44.entities.EcoWaypoint.list(),
    initialData: [],
  });

  const { data: hazards } = useQuery({
    queryKey: ['hazards'],
    queryFn: () => base44.entities.HazardZone.list(),
    initialData: [],
  });

  const filteredWaypoints = filterType === "all" 
    ? waypoints 
    : waypoints.filter(w => w.type === filterType);

  const getMarkerIcon = (type) => {
    const colors = {
      recycling_center: '#10b981',
      charging_station: '#3b82f6',
      bike_station: '#8b5cf6',
      park: '#22c55e',
      community_garden: '#84cc16',
      water_refill: '#06b6d4',
      eco_store: '#f59e0b'
    };

    return new L.Icon({
      iconUrl: `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${colors[type] || '#10b981'}" width="32" height="32">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32]
    });
  };

  const getHazardColor = (level) => {
    if (level < 40) return '#fbbf24'; // yellow
    if (level < 60) return '#fb923c'; // orange
    return '#ef4444'; // red
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-slate-900/95 backdrop-blur-xl border-b border-emerald-500/20 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
            Eco Map
          </h1>
          <div className="flex gap-2">
            <Button
              size="icon"
              variant="outline"
              className="border-emerald-500/30 hover:bg-emerald-500/20"
              onClick={() => setShowHazards(!showHazards)}
            >
              <AlertTriangle className={`w-5 h-5 ${showHazards ? 'text-amber-400' : 'text-gray-500'}`} />
            </Button>
            <Button
              size="icon"
              className="bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/50"
              onClick={() => setShowAddDialog(true)}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <Tabs value={filterType} onValueChange={setFilterType}>
          <TabsList className="bg-slate-800 border border-emerald-500/20 w-full">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="park" className="flex-1">Parks</TabsTrigger>
            <TabsTrigger value="bike_station" className="flex-1">Bikes</TabsTrigger>
            <TabsTrigger value="recycling_center" className="flex-1">Recycle</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          className="z-0"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap contributors'
          />

          {/* Waypoints */}
          {filteredWaypoints.map((waypoint) => (
            <Marker
              key={waypoint.id}
              position={[waypoint.latitude, waypoint.longitude]}
              icon={getMarkerIcon(waypoint.type)}
              eventHandlers={{
                click: () => setSelectedWaypoint(waypoint)
              }}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-semibold">{waypoint.name}</h3>
                  <p className="text-sm">{waypoint.description}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Hazard Zones */}
          {showHazards && hazards.map((hazard) => (
            <Circle
              key={hazard.id}
              center={[hazard.latitude, hazard.longitude]}
              radius={hazard.hazard_level * 10}
              pathOptions={{
                color: getHazardColor(hazard.hazard_level),
                fillColor: getHazardColor(hazard.hazard_level),
                fillOpacity: 0.2
              }}
            >
              <Popup>
                <div className="text-slate-900">
                  <h3 className="font-semibold">{hazard.name}</h3>
                  <p className="text-sm">{hazard.description}</p>
                  <p className="text-xs font-medium mt-1">
                    Hazard Level: {hazard.hazard_level}/100
                  </p>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>

        {/* Floating Stats */}
        <Card className="absolute top-4 left-4 right-4 bg-slate-900/95 backdrop-blur-xl border-emerald-500/20 z-[1000]">
          <div className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-400">Eco Spots</p>
                <p className="text-xl font-bold text-emerald-400">{filteredWaypoints.length}</p>
              </div>
              {showHazards && (
                <div>
                  <p className="text-gray-400">Hazard Zones</p>
                  <p className="text-xl font-bold text-amber-400">{hazards.length}</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Selected Waypoint Details */}
      {selectedWaypoint && (
        <WaypointDetails
          waypoint={selectedWaypoint}
          onClose={() => setSelectedWaypoint(null)}
        />
      )}

      {/* Add Waypoint Dialog */}
      <AddWaypointDialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
      />
    </div>
  );
}