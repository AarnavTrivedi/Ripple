
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Leaf, AlertTriangle, Navigation } from "lucide-react";

export default function Scanner() {
  const [userLocation, setUserLocation] = useState(null);
  const [scanMode, setScanMode] = useState('green');
  const [nearbyItems, setNearbyItems] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error("Location error:", error);
          // Fallback to a default location if geolocation fails
          setUserLocation({ latitude: 37.5407, longitude: -77.4360 }); // Richmond, VA
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

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

  useEffect(() => {
    if (!userLocation) return;

    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of Earth in kilometers
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    if (scanMode === 'green') {
      const nearby = greenActions
        .filter(a => a.latitude && a.longitude) // Ensure coordinates exist
        .map(a => ({
          ...a,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.latitude,
            a.longitude
          )
        }))
        .filter(a => a.distance < 5) // Filter items within 5km
        .sort((a, b) => a.distance - b.distance) // Sort by distance
        .slice(0, 5); // Take top 5
      setNearbyItems(nearby);
    } else { // scanMode === 'hazard'
      const nearby = hazards
        .filter(h => h.latitude && h.longitude) // Ensure coordinates exist
        .map(h => ({
          ...h,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            h.latitude,
            h.longitude
          )
        }))
        .filter(h => h.distance < 5) // Filter items within 5km
        .sort((a, b) => a.distance - b.distance) // Sort by distance
        .slice(0, 5); // Take top 5
      setNearbyItems(nearby);
    }
  }, [userLocation, scanMode, greenActions, hazards]);

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
    <div className="min-h-screen p-6 pt-8 pb-32">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-4">AR Scanner</h1>
        
        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            onClick={() => setScanMode('green')}
            className={scanMode === 'green' 
              ? 'bg-emerald-500 hover:bg-emerald-600' 
              : 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'
            }
          >
            <Leaf className="w-4 h-4 mr-2" />
            Green Actions
          </Button>
          <Button
            onClick={() => setScanMode('hazard')}
            className={scanMode === 'hazard' 
              ? 'bg-amber-500 hover:bg-amber-600' 
              : 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'
            }
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Hazards
          </Button>
        </div>
      </div>

      {/* Camera View Simulation */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6 mb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
        <div className="relative h-64 flex items-center justify-center">
          <div className="w-24 h-24 border-2 border-emerald-400 rounded-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-emerald-400" />
          </div>
        </div>
        <p className="text-center text-emerald-200/60 text-sm mt-4">
          Point your camera to discover {scanMode === 'green' ? 'eco-friendly activities' : 'environmental hazards'} nearby
        </p>
      </Card>

      {/* Nearby Items */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-white mb-3">
          Nearby {scanMode === 'green' ? 'Green Actions' : 'Hazard Zones'}
        </h2>
        
        {nearbyItems.length > 0 ? (
          nearbyItems.map((item, index) => (
            <Card key={index} className={`${
              scanMode === 'green' 
                ? 'bg-white/10 border-white/20' 
                : 'bg-white/10 border-white/20'
            } backdrop-blur-xl p-4`}>
              <div className="flex items-start gap-3">
                {scanMode === 'green' ? (
                  <Leaf className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">
                    {item.title || item.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-emerald-200/60">
                      {item.distance.toFixed(1)} km away
                    </span>
                    {scanMode === 'green' && item.points_reward && (
                      <span className="text-emerald-400">+{item.points_reward} pts</span>
                    )}
                    {scanMode === 'hazard' && item.hazard_level && (
                      <span className="text-amber-400">Level: {item.hazard_level}/100</span>
                    )}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  <Navigation className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6 text-center">
            <p className="text-emerald-200/60 text-sm">
              No {scanMode === 'green' ? 'green actions' : 'hazards'} detected within 5km
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
