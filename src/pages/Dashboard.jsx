import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, TrendingUp, Leaf } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);

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

    // Get real user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          setLocationError(error.message);
          // Fallback to Richmond, VA if location access denied
          setUserLocation({
            latitude: 37.5407,
            longitude: -77.4360
          });
        }
      );
    }
  }, []);

  const { data: todayScore, isLoading: scoreLoading } = useQuery({
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

  const { data: upcomingActions, isLoading: actionsLoading } = useQuery({
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

  const handleStartTracking = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    createScoreMutation.mutate({
      date: today,
      score: 50,
      walking_minutes: 0,
      cycling_minutes: 0,
      public_transport_minutes: 0,
      driving_minutes: 0,
      green_actions_completed: 0,
      carbon_saved_kg: 0
    });
  };

  const score = todayScore?.score || 0;

  return (
    <div className="min-h-screen p-6 pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Eco Score
        </h1>
        <div className="flex items-center gap-2 text-emerald-200/60 text-sm">
          <MapPin className="w-4 h-4" />
          <span>
            {userLocation 
              ? `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`
              : 'Getting location...'}
          </span>
        </div>
      </div>

      {/* Score Circle */}
      <Card className="bg-[#0f5132]/60 border-emerald-500/20 backdrop-blur p-8 mb-6">
        <div className="flex flex-col items-center">
          <div className="relative w-40 h-40 flex items-center justify-center">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="rgba(16, 185, 129, 0.1)"
                strokeWidth="8"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 70}`}
                strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="text-center">
              <div className="text-5xl font-bold text-white">{score}</div>
              <div className="text-xs text-emerald-200/60 uppercase tracking-wider mt-1">
                Today
              </div>
            </div>
          </div>

          {!todayScore && (
            <Button
              onClick={handleStartTracking}
              className="mt-6 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Start Tracking Today
            </Button>
          )}
        </div>
      </Card>

      {/* Stats Grid */}
      {todayScore && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-[#0f5132]/60 border-emerald-500/20 backdrop-blur p-4">
            <div className="text-emerald-200/60 text-xs uppercase tracking-wider mb-1">
              Walking
            </div>
            <div className="text-2xl font-bold text-white">
              {todayScore.walking_minutes || 0}
              <span className="text-sm text-emerald-200/60 ml-1">min</span>
            </div>
          </Card>

          <Card className="bg-[#0f5132]/60 border-emerald-500/20 backdrop-blur p-4">
            <div className="text-emerald-200/60 text-xs uppercase tracking-wider mb-1">
              Cycling
            </div>
            <div className="text-2xl font-bold text-white">
              {todayScore.cycling_minutes || 0}
              <span className="text-sm text-emerald-200/60 ml-1">min</span>
            </div>
          </Card>

          <Card className="bg-[#0f5132]/60 border-emerald-500/20 backdrop-blur p-4">
            <div className="text-emerald-200/60 text-xs uppercase tracking-wider mb-1">
              CO₂ Saved
            </div>
            <div className="text-2xl font-bold text-white">
              {todayScore.carbon_saved_kg?.toFixed(1) || 0}
              <span className="text-sm text-emerald-200/60 ml-1">kg</span>
            </div>
          </Card>

          <Card className="bg-[#0f5132]/60 border-emerald-500/20 backdrop-blur p-4">
            <div className="text-emerald-200/60 text-xs uppercase tracking-wider mb-1">
              Actions
            </div>
            <div className="text-2xl font-bold text-white">
              {todayScore.green_actions_completed || 0}
            </div>
          </Card>
        </div>
      )}

      {/* Nearby Events */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">Nearby Events</h2>
          <Button size="sm" variant="ghost" className="text-emerald-300 hover:text-emerald-200">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          {upcomingActions.length > 0 ? (
            upcomingActions.map((action) => (
              <Card key={action.id} className="bg-[#0f5132]/60 border-emerald-500/20 backdrop-blur p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <Leaf className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-white mb-1">{action.title}</h3>
                    <p className="text-sm text-emerald-200/60 mb-2">{action.description}</p>
                    <div className="flex items-center gap-3 text-xs text-emerald-200/50">
                      <span>{format(new Date(action.date), 'MMM d, yyyy')}</span>
                      {action.points_reward && (
                        <span className="text-emerald-400">+{action.points_reward} pts</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-[#0f5132]/40 border-emerald-500/10 backdrop-blur p-6 text-center">
              <p className="text-emerald-200/60 text-sm">
                No upcoming events. Check the map to discover eco-friendly activities nearby.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}