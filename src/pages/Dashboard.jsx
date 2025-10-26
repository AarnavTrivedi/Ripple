import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Circle, Plus, Leaf } from "lucide-react";
import { format } from "date-fns";
import ActivityLogger from "../components/dashboard/ActivityLogger";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [locationName, setLocationName] = useState("Virginia");

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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`
            );
            const data = await response.json();
            setLocationName(data.address.county || data.address.city || data.address.state || "Virginia");
          } catch (error) {
            console.error("Error getting location name:", error);
          }
        },
        (error) => {
          console.error("Location error:", error);
        }
      );
    }
  }, []);

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

  const { data: upcomingActions } = useQuery({
    queryKey: ['upcomingActions'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      return await base44.entities.GreenAction.filter(
        { completed: false, date: { $gte: today } },
        'date',
        5
      );
    },
    initialData: [],
  });

  const createScoreMutation = useMutation({
    mutationFn: (data) => base44.entities.EcoScore.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayScore'] });
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.EcoScore.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayScore'] });
    },
  });

  const handleStartTracking = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    createScoreMutation.mutate({
      date: today,
      score: 0,
      walking_minutes: 0,
      cycling_minutes: 0,
      public_transport_minutes: 0,
      driving_minutes: 0,
      green_actions_completed: 0,
      carbon_saved_kg: 0
    });
  };

  const handleLogActivity = (activityData) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (todayScore) {
      const updatedData = {
        ...todayScore,
        walking_minutes: (todayScore.walking_minutes || 0) + (activityData.walking_minutes || 0),
        cycling_minutes: (todayScore.cycling_minutes || 0) + (activityData.cycling_minutes || 0),
        public_transport_minutes: (todayScore.public_transport_minutes || 0) + (activityData.public_transport_minutes || 0),
        driving_minutes: (todayScore.driving_minutes || 0) + (activityData.driving_minutes || 0),
        green_actions_completed: (todayScore.green_actions_completed || 0) + (activityData.green_actions_completed || 0),
        carbon_saved_kg: (todayScore.carbon_saved_kg || 0) + (activityData.carbon_saved_kg || 0),
        score: activityData.score,
        date: today
      };
      
      updateScoreMutation.mutate({
        id: todayScore.id,
        data: updatedData
      });
    } else {
      createScoreMutation.mutate({
        ...activityData,
        date: today
      });
    }
  };

  const score = todayScore?.score || 0;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Leaf Background Pattern */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(2px)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a2f23] via-[#0d3d2d] to-[#0a2f23]" />
      </div>

      <div className="relative z-10 px-6 pt-8 pb-32">
        {/* Eco Score Card - Glassmorphism */}
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 shadow-2xl rounded-3xl p-8 mb-6 relative overflow-hidden">
          {/* Ripple Effect Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-emerald-400/30 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-2 border-emerald-400/40 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border-2 border-emerald-400/50 animate-ping" style={{ animationDuration: '1.5s', animationDelay: '1s' }} />
          </div>

          <div className="relative flex flex-col items-center">
            <div className="text-9xl font-bold text-white mb-2">{score}</div>
            <div className="text-sm text-gray-300 uppercase tracking-[0.3em] mb-6">Eco Score</div>
            
            {!todayScore && (
              <Button
                onClick={handleStartTracking}
                className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold px-12 py-6 rounded-full text-lg shadow-lg shadow-emerald-500/50 transition-all duration-300 hover:scale-105"
              >
                Start Tracking Today
              </Button>
            )}
          </div>
        </Card>

        {/* Activity Logger */}
        {todayScore && (
          <div className="mb-6">
            <ActivityLogger 
              onLogActivity={handleLogActivity} 
              currentScore={score} 
              currentActivities={todayScore} 
            />
          </div>
        )}

        {/* Events Near You */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Circle className="w-3 h-3 text-emerald-400 fill-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white">Events Near You</h2>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-300 mb-4 ml-5">
            <MapPin className="w-4 h-4" />
            <span>{locationName}</span>
          </div>
        </div>

        {/* Volunteer Opportunities */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Volunteer Opportunities</h3>
            <Button
              size="sm"
              className="bg-emerald-400/80 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-full shadow-lg"
              onClick={() => window.location.href = '/Map'}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>

          {upcomingActions.length > 0 ? (
            <div className="space-y-3">
              {upcomingActions.map((action) => (
                <Card 
                  key={action.id} 
                  className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300"
                >
                  <h4 className="text-white font-semibold mb-2">{action.title}</h4>
                  <p className="text-gray-300 text-sm mb-3">{action.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{format(new Date(action.date), 'MMM d, h:mm a')}</span>
                    {action.points_reward && (
                      <span className="text-emerald-400">+{action.points_reward} pts</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-gray-300 text-sm mb-6">No upcoming events nearby</p>
              <Button
                className="bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg"
                onClick={() => window.location.href = '/Map'}
              >
                Add First Event
              </Button>
            </Card>
          )}
        </div>

        {/* Today's Activity Stats */}
        {todayScore && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Today's Impact</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Walking</div>
                <div className="text-2xl font-bold text-white">
                  {todayScore.walking_minutes || 0}
                  <span className="text-sm text-gray-400 ml-1">min</span>
                </div>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Cycling</div>
                <div className="text-2xl font-bold text-white">
                  {todayScore.cycling_minutes || 0}
                  <span className="text-sm text-gray-400 ml-1">min</span>
                </div>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">CO₂ Saved</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {todayScore.carbon_saved_kg?.toFixed(1) || 0}
                  <span className="text-sm text-gray-400 ml-1">kg</span>
                </div>
              </Card>

              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-4">
                <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Actions</div>
                <div className="text-2xl font-bold text-white">
                  {todayScore.green_actions_completed || 0}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}