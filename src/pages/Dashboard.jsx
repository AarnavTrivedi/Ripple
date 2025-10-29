
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Circle, Plus, RefreshCw, Newspaper } from "lucide-react";
import { format } from "date-fns";
import { createPageUrl } from "@/utils";
import ActivityLogger from "../components/dashboard/ActivityLogger";

// Mock user data
const mockUser = {
  email: "demo@ecotrackr.app",
  name: "Demo User"
};

// Mock data storage key
const STORAGE_KEY = "ecotrackr_data";

// Get stored data from localStorage
const getStoredData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { scores: [], actions: [], newsletters: [] };
  } catch (error) {
    return { scores: [], actions: [], newsletters: [] };
  }
};

// Save data to localStorage
const saveStoredData = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving data:", error);
  }
};

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(mockUser);
  const [locationName, setLocationName] = useState("Your County, Virginia");

  useEffect(() => {
    // Set mock user immediately
    setCurrentUser(mockUser);

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
      const storedData = getStoredData();
      const todayScoreData = storedData.scores.find(score => score.date === today);
      return todayScoreData || null;
    },
    enabled: !!currentUser,
  });

  const { data: upcomingActions } = useQuery({
    queryKey: ['upcomingActions'],
    queryFn: async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const storedData = getStoredData();
      const upcomingActionsData = storedData.actions.filter(
        action => !action.completed && action.date >= today
      ).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5);
      return upcomingActionsData;
    },
    initialData: [],
  });

  // Mock newsletters - always available
  const mockNewsletters = [
    {
      id: 1,
      title: "Local Park Cleanup Initiative",
      content: "Join our community in cleaning up Green Valley Park this weekend. All volunteers welcome!",
      category: "local_events",
      location: "Green Valley Park",
      publish_date: new Date().toISOString(),
      image_url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80"
    },
    {
      id: 2,
      title: "Sustainable Transportation Week",
      content: "Learn about eco-friendly commuting options and win prizes for logging green miles.",
      category: "sustainability",
      location: "City Wide",
      publish_date: new Date().toISOString(),
      image_url: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&q=80"
    }
  ];

  const { data: newsletters } = useQuery({
    queryKey: ['newsletters'],
    queryFn: async () => {
      const storedData = getStoredData();
      // Return mock newsletters if none exist
      if (storedData.newsletters.length === 0) {
        return mockNewsletters;
      }
      return storedData.newsletters.sort((a, b) => 
        new Date(b.publish_date) - new Date(a.publish_date)
      ).slice(0, 5);
    },
    initialData: mockNewsletters, // Always start with mock data
  });

  const createScoreMutation = useMutation({
    mutationFn: async (data) => {
      const storedData = getStoredData();
      const newScore = {
        ...data,
        id: Date.now().toString(),
        created_date: new Date().toISOString()
      };
      storedData.scores.push(newScore);
      saveStoredData(storedData);
      return newScore;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayScore'] });
    },
  });

  const updateScoreMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const storedData = getStoredData();
      const scoreIndex = storedData.scores.findIndex(score => score.id === id);
      if (scoreIndex !== -1) {
        storedData.scores[scoreIndex] = { ...storedData.scores[scoreIndex], ...data };
        saveStoredData(storedData);
        return storedData.scores[scoreIndex];
      }
      return null;
    },
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
        {/* Eco Score Card - With More Opacity to See Background */}
        <Card className="bg-white/5 backdrop-blur-md border-emerald-400/15 shadow-2xl rounded-[2rem] p-6 mb-6 relative overflow-hidden">
          <div className="flex flex-col items-center">
            {/* Circular Progress Ring Around Score */}
            <div className="relative w-56 h-56 mb-4">
              {/* SVG Circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                {/* Background circle */}
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="rgba(16, 185, 129, 0.15)"
                  strokeWidth="8"
                />
                {/* Progress circle */}
                <circle
                  cx="112"
                  cy="112"
                  r="100"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 100}`}
                  strokeDashoffset={`${2 * Math.PI * 100 * (1 - Math.min(score, 100) / 100)}`}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              
              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {/* Score Number */}
                <div className="text-[80px] font-bold text-white leading-none mb-2">
                  {score}
                </div>
                
                {/* Eco Score Label */}
                <div className="text-xs text-gray-300 uppercase tracking-[0.25em]">
                  ECO SCORE
                </div>
              </div>
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

        {/* Today's Activity Stats */}
        {todayScore && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Today's Activity</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Walking Stat */}
              <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-emerald-400/15 p-5 text-center shadow-lg">
                <div className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider mb-2">
                  Walking
                </div>
                <div className="text-[42px] font-bold text-white leading-none drop-shadow-lg">
                  {todayScore.walking_minutes || 0}
                </div>
                <div className="text-sm text-emerald-200/70 font-medium mt-1">min</div>
              </div>

              {/* Cycling Stat */}
              <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-emerald-400/15 p-5 text-center shadow-lg">
                <div className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider mb-2">
                  Cycling
                </div>
                <div className="text-[42px] font-bold text-white leading-none drop-shadow-lg">
                  {todayScore.cycling_minutes || 0}
                </div>
                <div className="text-sm text-emerald-200/70 font-medium mt-1">min</div>
              </div>

              {/* CO₂ Saved Stat */}
              <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-emerald-400/15 p-5 text-center shadow-lg">
                <div className="text-xs font-medium text-emerald-200 uppercase tracking-wider mb-2">
                  CO₂ Saved
                </div>
                <div className="text-[42px] font-bold text-emerald-300 leading-none drop-shadow-lg">
                  {todayScore.carbon_saved_kg?.toFixed(1) || 0}
                </div>
                <div className="text-sm text-emerald-200 font-medium mt-1">kg</div>
              </div>

              {/* Actions Stat */}
              <div className="bg-white/8 backdrop-blur-md rounded-2xl border border-emerald-400/15 p-5 text-center shadow-lg">
                <div className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider mb-2">
                  Actions
                </div>
                <div className="text-[42px] font-bold text-white leading-none drop-shadow-lg">
                  {todayScore.green_actions_completed || 0}
                </div>
                <div className="text-sm text-emerald-200/70 font-medium mt-1">completed</div>
              </div>
            </div>
          </div>
        )}

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
              className="bg-white/8 hover:bg-white/15 backdrop-blur-sm border border-emerald-400/20 text-white rounded-full px-4 py-2"
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
                  className="bg-white/8 backdrop-blur-md border-emerald-400/15 rounded-2xl p-5 hover:bg-white/12 transition-all duration-300"
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
            <Card className="bg-white/5 backdrop-blur-md border-emerald-400/15 rounded-[2rem] p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
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

        {/* Newsletter Section - ALWAYS VISIBLE */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-[#10D9A0]" />
            <h2 className="text-xl font-bold text-white">Environmental News</h2>
          </div>

          <div className="space-y-3">
            {newsletters.slice(0, 3).map((newsletter) => (
              <Card 
                key={newsletter.id} 
                className="bg-white/8 backdrop-blur-md border-emerald-400/15 rounded-2xl p-4 hover:bg-white/12 transition-all duration-300 cursor-pointer"
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
      </div>
    </div>
  );
}
