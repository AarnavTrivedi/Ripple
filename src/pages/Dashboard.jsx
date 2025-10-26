import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Circle, Plus, RefreshCw, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import ActivityLogger from "../components/dashboard/ActivityLogger";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [locationName, setLocationName] = useState("Your County, Virginia");

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
            const county = data.address.county || data.address.city || "Your County";
            const state = data.address.state || "Virginia";
            setLocationName(`${county}, ${state}`);
          } catch (error) {
            console.error("Error getting location name:", error);
          }
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

  const { data: newsletters } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => base44.entities.Newsletter.list('-publish_date', 5),
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
    <div className="min-h-screen relative overflow-hidden bg-[#1a2f26]">
      {/* Leaf Background */}
      <div className="fixed inset-0 z-0 opacity-20">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      </div>

      <div className="relative z-10 px-6 pt-8 pb-32">
        {/* Eco Score Card - Smaller & No Animation */}
        <Card className="bg-white/10 backdrop-blur-2xl border-white/20 shadow-2xl rounded-[2rem] p-6 mb-6 relative overflow-hidden">
          <div className="flex flex-col items-center">
            {/* Smaller Score Number */}
            <div className="text-[80px] font-bold text-white leading-none mb-2">
              {score}
            </div>
            
            {/* ECO SCORE Label */}
            <div className="text-xs text-gray-300 uppercase tracking-[0.25em] mb-6">
              ECO SCORE
            </div>
            
            {/* Start Tracking Button or Activity Logger */}
            {!todayScore ? (
              <Button
                onClick={handleStartTracking}
                className="bg-[#10D9A0] hover:bg-[#0ec090] text-white font-semibold px-8 py-4 rounded-full text-sm shadow-lg transition-all duration-300"
              >
                Start Tracking Today
              </Button>
            ) : (
              <ActivityLogger 
                onLogActivity={handleLogActivity} 
                currentScore={score} 
                currentActivities={todayScore} 
              />
            )}
          </div>
        </Card>

        {/* Events Near You Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Circle className="w-2 h-2 text-[#10D9A0] fill-[#10D9A0]" />
            <h2 className="text-xl font-bold text-white">Events Near You</h2>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
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
              className="bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white rounded-full px-4 py-2"
              onClick={() => window.location.href = createPageUrl('Map')}
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
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{action.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{format(new Date(action.date), 'MMM d, h:mm a')}</span>
                    {action.points_reward && (
                      <span className="text-[#10D9A0]">+{action.points_reward} pts</span>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-[2rem] p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-gray-400" />
              </div>
              
              <p className="text-gray-300 text-base mb-6">
                No upcoming events nearby
              </p>
              
              <Button
                className="bg-[#10D9A0] hover:bg-[#0ec090] text-white font-semibold px-8 py-6 rounded-full text-base shadow-lg transition-all duration-300"
                onClick={() => window.location.href = createPageUrl('Map')}
              >
                Add First Event
              </Button>
            </Card>
          )}
        </div>

        {/* Newsletter Section */}
        {newsletters.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-[#10D9A0]" />
              <h2 className="text-xl font-bold text-white">Environmental News</h2>
            </div>

            <div className="space-y-3">
              {newsletters.slice(0, 3).map((newsletter) => (
                <Card 
                  key={newsletter.id} 
                  className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl p-4 hover:bg-white/15 transition-all duration-300 cursor-pointer overflow-hidden"
                >
                  <div className="flex items-start gap-3">
                    {newsletter.image_url && (
                      <img 
                        src={newsletter.image_url} 
                        alt={newsletter.title}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold mb-1 text-sm line-clamp-2">{newsletter.title}</h4>
                      <p className="text-gray-300 text-xs mb-2 line-clamp-2">{newsletter.content}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                        <span className="capitalize">{newsletter.category.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span className="truncate">{newsletter.location}</span>
                        <span>•</span>
                        <span className="whitespace-nowrap">{format(new Date(newsletter.publish_date), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}