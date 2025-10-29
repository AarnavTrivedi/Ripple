import { useState, useEffect, Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Box, Leaf, AlertTriangle, Layers, Info, Trophy, Target, Map as MapIcon, Globe } from "lucide-react";
import ARScannerCanvas from "@/components/scanner/ARScannerCanvas";
import Environment3D from "@/components/scanner/Environment3D";
import AREnvironment from "@/components/scanner/AREnvironment";
import CarbonTreeVisualization from "@/components/scanner/CarbonTreeVisualization";
import EcoChallenge3D, { ecoChallenges } from "@/components/scanner/EcoChallenge3D";
import ImpactVisualization from "@/components/scanner/ImpactVisualization";

// Lazy load GeospatialScanner for code splitting
const GeospatialScanner = lazy(() => import('./GeospatialScanner'));

// Storage keys
const GREEN_ACTIONS_KEY = "ecotrackr_data";
const HAZARDS_KEY = "ecotrackr_hazards";

// Mock green actions data
const mockGreenActions = [
  {
    id: 1,
    title: "Park Cleanup",
    description: "Help clean up local park",
    latitude: 37.5407,
    longitude: -77.4360,
    points_reward: 50
  },
  {
    id: 2,
    title: "Tree Planting",
    description: "Join community tree planting event",
    latitude: 37.5507,
    longitude: -77.4460,
    points_reward: 75
  }
];

// Mock hazard zones
const mockHazards = [
  {
    id: 1,
    name: "Air Quality Warning",
    description: "Elevated particulate matter levels",
    latitude: 37.5307,
    longitude: -77.4260,
    hazard_level: 65
  }
];

// Loading component for 3D scene
const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-900 to-green-900">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-white text-sm">Loading 3D Scanner...</p>
    </div>
  </div>
);

export default function Scanner() {
  const [userLocation, setUserLocation] = useState(null);
  const [scanMode, setScanMode] = useState('green');
  const [viewMode, setViewMode] = useState('3d'); // '3d', 'list', 'challenges', 'impact', or 'geospatial'
  const [nearbyItems, setNearbyItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

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
    queryFn: async () => {
      try {
        const data = localStorage.getItem(GREEN_ACTIONS_KEY);
        const storedData = data ? JSON.parse(data) : { actions: [] };
        return storedData.actions?.length > 0 ? storedData.actions : mockGreenActions;
      } catch (error) {
        return mockGreenActions;
      }
    },
    initialData: mockGreenActions,
  });

  const { data: hazards } = useQuery({
    queryKey: ['hazards'],
    queryFn: async () => {
      try {
        const stored = localStorage.getItem(HAZARDS_KEY);
        return stored ? JSON.parse(stored) : mockHazards;
      } catch (error) {
        return mockHazards;
      }
    },
    initialData: mockHazards,
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
        .filter(a => a.latitude && a.longitude)
        .map(a => ({
          ...a,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            a.latitude,
            a.longitude
          )
        }))
        .filter(a => a.distance < 5)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
      setNearbyItems(nearby);
    } else {
      const nearby = hazards
        .filter(h => h.latitude && h.longitude)
        .map(h => ({
          ...h,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            h.latitude,
            h.longitude
          )
        }))
        .filter(h => h.distance < 5)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
      setNearbyItems(nearby);
    }
  }, [userLocation, scanMode, greenActions, hazards]);

  const handleMarkerClick = (item) => {
    setSelectedItem(item);
  };
  
  const handleChallengeComplete = (challenge) => {
    setCompletedChallenges(prev => [...prev, challenge]);
    setShowCelebration(true);
    
    // Save to localStorage
    const today = format(new Date(), 'yyyy-MM-dd');
    const storedData = JSON.parse(localStorage.getItem('ecotrackr_data') || '{"scores":[],"actions":[],"challenges":[]}');
    storedData.challenges = storedData.challenges || [];
    storedData.challenges.push({
      ...challenge,
      completedDate: today,
      timestamp: new Date().toISOString()
    });
    
    // Update score
    const todayScore = storedData.scores.find(s => s.date === today);
    if (todayScore) {
      todayScore.carbon_saved_kg = (todayScore.carbon_saved_kg || 0) + (challenge.carbonSaved || 0);
      todayScore.score = (todayScore.score || 0) + challenge.points;
      todayScore.green_actions_completed = (todayScore.green_actions_completed || 0) + 1;
    }
    
    localStorage.setItem('ecotrackr_data', JSON.stringify(storedData));
    
    setTimeout(() => setShowCelebration(false), 3000);
  };
  
  // Get user stats from today's data
  const { data: todayScore } = useQuery({
    queryKey: ['todayScore'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const data = localStorage.getItem('ecotrackr_data');
      const storedData = data ? JSON.parse(data) : { scores: [] };
      return storedData.scores.find(score => score.date === today) || {
        carbon_saved_kg: 0,
        green_actions_completed: 0,
        walking_minutes: 0,
        cycling_minutes: 0
      };
    },
    initialData: {
      carbon_saved_kg: 0,
      green_actions_completed: 0,
      walking_minutes: 0,
      cycling_minutes: 0
    }
  });
  
  const userStats = {
    carbonSaved: todayScore?.carbon_saved_kg || 0,
    actionsCompleted: todayScore?.green_actions_completed || 0,
    greenMiles: ((todayScore?.walking_minutes || 0) + (todayScore?.cycling_minutes || 0)) * 0.05
  };
  
  const communityStats = {
    carbonSaved: userStats.carbonSaved * 50, // Mock community data
    users: 50
  };

  if (!userLocation) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-900 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Getting your location...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-900 to-emerald-950">
      {/* Header */}
      <div className="bg-[#0f5132]/50 backdrop-blur-xl border-b border-emerald-500/10 px-4 py-3 z-[1001]">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-bold text-white">3D/AR Scanner</h1>
          
          <div className="flex gap-2 flex-shrink-0">
            {/* NEW: Geospatial Mode (10X Feature) */}
            <Button
              size="sm"
              variant={viewMode === 'geospatial' ? 'default' : 'outline'}
              className={viewMode === 'geospatial' 
                ? 'bg-blue-600 hover:bg-blue-700 h-8 px-3 animate-pulse' 
                : 'border-blue-500/40 bg-blue-500/10 backdrop-blur-xl h-8 px-3 text-white'
              }
              onClick={() => setViewMode('geospatial')}
              title="10X Geospatial Mode - Real 3D Map!"
            >
              <Globe className="w-3.5 h-3.5 mr-1" />
              <span className="text-xs font-bold">NEW</span>
            </Button>
            
            {/* Original View Modes */}
            <Button
              size="sm"
              variant={viewMode === '3d' ? 'default' : 'outline'}
              className={viewMode === '3d' 
                ? 'bg-emerald-500 hover:bg-emerald-600 h-8 px-2' 
                : 'border-emerald-500/20 bg-white/10 backdrop-blur-xl h-8 px-2 text-white/80'
              }
              onClick={() => setViewMode('3d')}
            >
              <Box className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              size="sm"
              variant={viewMode === 'challenges' ? 'default' : 'outline'}
              className={viewMode === 'challenges' 
                ? 'bg-amber-500 hover:bg-amber-600 h-8 px-2' 
                : 'border-emerald-500/20 bg-white/10 backdrop-blur-xl h-8 px-2 text-white/80'
              }
              onClick={() => setViewMode('challenges')}
            >
              <Target className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              size="sm"
              variant={viewMode === 'impact' ? 'default' : 'outline'}
              className={viewMode === 'impact' 
                ? 'bg-purple-500 hover:bg-purple-600 h-8 px-2' 
                : 'border-emerald-500/20 bg-white/10 backdrop-blur-xl h-8 px-2 text-white/80'
              }
              onClick={() => setViewMode('impact')}
            >
              <Trophy className="w-3.5 h-3.5" />
            </Button>
            
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              className={viewMode === 'list' 
                ? 'bg-emerald-500 hover:bg-emerald-600 h-8 px-2' 
                : 'border-emerald-500/20 bg-white/10 backdrop-blur-xl h-8 px-2 text-white/80'
              }
              onClick={() => setViewMode('list')}
            >
              <Layers className="w-3.5 h-3.5" />
            </Button>
          </div>
      </div>
        
        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 mt-3">
          <Button
            size="sm"
            onClick={() => setScanMode('green')}
            className={scanMode === 'green' 
              ? 'bg-emerald-500 hover:bg-emerald-600' 
              : 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'
            }
          >
            <Leaf className="w-3.5 h-3.5 mr-1.5" />
            Green Actions
          </Button>
          <Button
            size="sm"
            onClick={() => setScanMode('hazard')}
            className={scanMode === 'hazard' 
              ? 'bg-amber-500 hover:bg-amber-600' 
              : 'bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20'
            }
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            Hazards
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative">
        {viewMode === 'geospatial' ? (
          // NEW: Geospatial 3D Map Mode (10X Feature)
          <Suspense fallback={<LoadingFallback />}>
            <GeospatialScanner />
          </Suspense>
        ) : viewMode === '3d' ? (
          // 3D/AR View with nearby items
          <Suspense fallback={<LoadingFallback />}>
            <ARScannerCanvas mode="3d">
              <Environment3D
                nearbyItems={nearbyItems}
                type={scanMode}
                userLocation={userLocation}
                onMarkerClick={handleMarkerClick}
              />
              <AREnvironment
                nearbyItems={nearbyItems}
                type={scanMode}
                onMarkerClick={handleMarkerClick}
              />
              {/* Show carbon visualization if user has saved carbon */}
              {userStats.carbonSaved > 0 && (
                <CarbonTreeVisualization 
                  carbonSavedKg={userStats.carbonSaved}
                  position={[-3, 0, -3]}
                />
              )}
            </ARScannerCanvas>
          </Suspense>
        ) : viewMode === 'challenges' ? (
          // Interactive Eco Challenges View
          <Suspense fallback={<LoadingFallback />}>
            <ARScannerCanvas mode="3d">
              {ecoChallenges.map((challenge, index) => (
                <EcoChallenge3D
                  key={challenge.id}
                  challenge={challenge}
                  position={[
                    Math.cos((index / ecoChallenges.length) * Math.PI * 2) * 3,
                    1,
                    Math.sin((index / ecoChallenges.length) * Math.PI * 2) * 3
                  ]}
                  onComplete={handleChallengeComplete}
                />
              ))}
              <AREnvironment
                nearbyItems={ecoChallenges}
                type="challenge"
                onMarkerClick={handleChallengeComplete}
              />
            </ARScannerCanvas>
          </Suspense>
        ) : viewMode === 'impact' ? (
          // Personal Impact Visualization
          <Suspense fallback={<LoadingFallback />}>
            <ARScannerCanvas mode="3d">
              <ImpactVisualization
                userStats={userStats}
                communityStats={communityStats}
                position={[0, 1, -2]}
              />
              <CarbonTreeVisualization 
                carbonSavedKg={userStats.carbonSaved}
                position={[0, 0, 2]}
              />
            </ARScannerCanvas>
          </Suspense>
        ) : (
          // List View
          <div className="h-full overflow-y-auto p-4 pb-24">
            {nearbyItems.length > 0 ? (
      <div className="space-y-3">
                {nearbyItems.map((item, index) => (
            <Card key={index} className="bg-white/8 backdrop-blur-md border-emerald-400/15 rounded-2xl p-5 hover:bg-white/12 transition-all duration-300">
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
                    </div>
                  </Card>
                ))}
              </div>
        ) : (
          <Card className="bg-white/5 backdrop-blur-md border-emerald-400/15 rounded-[2rem] p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  {scanMode === 'green' ? (
                    <Leaf className="w-10 h-10 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                  )}
            </div>
            <p className="text-gray-300 text-base mb-2">
              No {scanMode === 'green' ? 'green actions' : 'hazards'} detected within 5km
            </p>
            <p className="text-emerald-200/60 text-sm">
              Try changing modes or moving to a different area
            </p>
          </Card>
        )}
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-black/40 backdrop-blur-md rounded-lg p-3 text-white">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold mb-1">
              {viewMode === 'geospatial' && '🌍 Geospatial Mode - Real 3D Map'}
              {viewMode === '3d' && '3D Scanner Mode'}
              {viewMode === 'challenges' && 'Eco Challenges Mode'}
              {viewMode === 'impact' && 'Impact Dashboard'}
              {viewMode === 'list' && 'List View'}
            </p>
            <p className="text-gray-300">
              {viewMode === 'geospatial' && 'Real terrain • Air quality heatmap • Track routes on actual streets'}
              {viewMode === '3d' && 'Drag to rotate • Scroll to zoom • Click markers for details'}
              {viewMode === 'challenges' && 'Click challenges to complete them • Earn points & save carbon'}
              {viewMode === 'impact' && 'Your environmental impact visualized in 3D'}
              {viewMode === 'list' && `${nearbyItems.length} ${scanMode === 'green' ? 'green actions' : 'hazards'} within 5km`}
            </p>
          </div>
      </div>
      </div>
      
      {/* Celebration Overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="bg-emerald-500 border-emerald-400 p-8 max-w-md text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white mb-2">Challenge Complete!</h2>
            <p className="text-white/90 text-lg">
              You're making a real difference!
            </p>
            <div className="mt-4 text-white font-semibold">
              + {completedChallenges[completedChallenges.length - 1]?.carbonSaved || 0} kg CO₂ saved
            </div>
          </Card>
        </div>
      )}

      {/* Selected Item Detail Modal */}
      {selectedItem && (
        <div className="absolute inset-0 z-[2000] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
          <Card className="bg-[#0f5132] border-emerald-500/30 p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-white">
                {selectedItem.title || selectedItem.name}
              </h2>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedItem(null)}
                className="text-white hover:bg-emerald-500/20"
              >
                <Info className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-gray-300 mb-4">{selectedItem.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-emerald-200/70">Distance:</span>
                <span className="text-white font-semibold">
                  {selectedItem.distance?.toFixed(1)} km
                </span>
              </div>
              {scanMode === 'green' && selectedItem.points_reward && (
                <div className="flex justify-between">
                  <span className="text-emerald-200/70">Points Reward:</span>
                  <span className="text-emerald-400 font-semibold">
                    +{selectedItem.points_reward} pts
                  </span>
                </div>
              )}
              {scanMode === 'hazard' && selectedItem.hazard_level && (
                <div className="flex justify-between">
                  <span className="text-emerald-200/70">Hazard Level:</span>
                  <span className="text-amber-400 font-semibold">
                    {selectedItem.hazard_level}/100
                  </span>
                </div>
              )}
            </div>
            <Button
              className="w-full mt-6 bg-emerald-500 hover:bg-emerald-600"
              onClick={() => setSelectedItem(null)}
            >
              Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
