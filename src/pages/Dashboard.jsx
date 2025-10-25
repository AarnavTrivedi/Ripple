
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Leaf, Circle, ChevronRight, Plus, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { format, differenceInHours } from "date-fns";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationName, setLocationName] = useState("Virginia");
  const [newsError, setNewsError] = useState(null);

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

    // Real-time location tracking
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(coords);
          
          // Get actual location name from coordinates
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
            );
            const data = await response.json();
            setLocationName(data.address.city || data.address.county || data.address.state || "Virginia");
          } catch (error) {
            console.error("Error getting location name:", error);
            // Fallback to default location name if error occurs is handled by initial state
          }
        },
        (error) => {
          console.error("Location error:", error);
          setUserLocation({ latitude: 37.5407, longitude: -77.4360 }); // Default to Richmond, VA
          // locationName will remain "Virginia" from initial state
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

  const { data: newsletters, isLoading: newsLoading } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => base44.entities.Newsletter.list('-publish_date', 5),
    initialData: [],
  });

  const generateNewsMutation = useMutation({
    mutationFn: async () => {
      setNewsError(null); // Clear any previous error before starting a new mutation
      
      try {
        console.log("Fetching environmental news for:", locationName);
        
        // Fetch REAL environmental news from the internet
        const newsData = await base44.integrations.Core.InvokeLLM({
          prompt: `Search Google News and the internet for the 3 most recent environmental news articles about ${locationName}, Virginia. Find REAL news from the last 7 days about environmental topics like:
- Climate action and sustainability
- Local environmental initiatives
- Pollution or air quality
- Wildlife conservation
- Green energy projects

Return actual news headlines and summaries from real sources.`,
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              articles: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    location: { type: "string" }
                  }
                }
              }
            }
          }
        });

        console.log("News fetched:", newsData);

        if (!newsData || !newsData.articles || newsData.articles.length === 0) {
          throw new Error("No news articles returned from the search. Please try again.");
        }

        // Delete old news first
        const oldNews = await base44.entities.Newsletter.list();
        for (const news of oldNews) {
          await base44.entities.Newsletter.delete(news.id);
        }

        // Create new real news entries
        const today = format(new Date(), 'yyyy-MM-dd');
        for (const article of newsData.articles) {
          await base44.entities.Newsletter.create({
            title: article.title,
            content: article.content,
            location: article.location || locationName, // Use article's location, or fallback to general location
            category: "climate_news",
            publish_date: today, // Use today's date for consistency
            image_url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800"
          });
        }

        console.log("News saved to database");
        return newsData;
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsError(error.message || "Failed to fetch news. Please try again.");
        throw error; // Re-throw to be caught by onError callback
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
    },
    onError: (error) => {
      console.error("Mutation error:", error);
      setNewsError(error.message || "An unexpected error occurred during news generation.");
    }
  });

  // Auto-fetch news if older than 24 hours or if no news exists
  useEffect(() => {
    // Only proceed if locationName is determined (not the initial default "Virginia" if it's going to change)
    // and if news is not currently loading or being generated.
    if (newsLoading || generateNewsMutation.isPending) return; // Prevent re-triggering while loading/pending

    const checkNewsAge = async () => {
      if (newsletters.length === 0) {
        console.log("No news found, attempting to fetch...");
        generateNewsMutation.mutate();
      } else {
        // Check if news is older than 24 hours
        const latestNews = newsletters[0];
        const newsDate = new Date(latestNews.publish_date);
        const hoursSinceUpdate = differenceInHours(new Date(), newsDate);
        
        console.log(`Latest news is ${hoursSinceUpdate} hours old.`);
        
        if (hoursSinceUpdate >= 24) {
          console.log("News is stale (older than 24 hours), fetching fresh news...");
          generateNewsMutation.mutate();
        }
      }
    };

    // Only auto-fetch if we have a more specific location than the default "Virginia"
    // to avoid unnecessary LLM calls until location is resolved.
    if (locationName && locationName !== "Virginia") {
      checkNewsAge();
    }
  }, [newsletters.length, locationName, newsLoading, generateNewsMutation.mutate, generateNewsMutation.isPending]);


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

  const handleGenerateNews = () => {
    setNewsError(null); // Clear error on manual refresh
    generateNewsMutation.mutate();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959; // Earth radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1);
  };

  const score = todayScore?.score || 0;

  return (
    <div className="min-h-screen">
      {/* Top Section with Score Circle */}
      <div className="px-6 pt-12 pb-6">
        {/* Circular Score Display */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-48 h-48 mb-6">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-emerald-400/10 rounded-full blur-2xl animate-pulse" />
            
            {/* SVG Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="rgba(16, 185, 129, 0.1)"
                strokeWidth="8"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - score / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            
            {/* Score Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-7xl font-bold text-white mb-1">{score}</div>
              <div className="text-xs text-emerald-200/60 uppercase tracking-widest">
                Eco Score
              </div>
            </div>
          </div>

          {!todayScore && (
            <Button
              onClick={handleStartTracking}
              className="bg-emerald-500/90 hover:bg-emerald-600 text-white px-8 shadow-lg shadow-emerald-500/30"
            >
              Start Tracking Today
            </Button>
          )}
        </div>

        {/* Header with Location */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Circle className="w-2 h-2 text-emerald-400 fill-emerald-400 animate-pulse" />
            <h1 className="text-2xl font-bold text-white">
              New Events in the Area
            </h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-200/50 ml-4">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {locationName}, Virginia
            </span>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="px-6 pb-8 space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Volunteer Opportunities</h2>
          <Button
            size="sm"
            className="bg-emerald-500/80 hover:bg-emerald-600"
            onClick={() => window.location.href = '/Map'}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Event
          </Button>
        </div>

        {upcomingActions.length > 0 ? (
          upcomingActions.map((action) => (
            <Card 
              key={action.id} 
              className="bg-[#0f5132]/50 border-emerald-500/20 backdrop-blur-sm hover:bg-[#0f5132]/60 hover:border-emerald-500/30 transition-all"
            >
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {action.title}
                    </h3>
                    <p className="text-sm text-emerald-200/60 leading-relaxed">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-400/50 flex-shrink-0 ml-3" />
                </div>
                
                <div className="flex items-center gap-4 text-xs text-emerald-200/50">
                  <span>{format(new Date(action.date), 'MMM d, h:mm a')}</span>
                  {action.latitude && userLocation && (
                    <span>
                      {calculateDistance(userLocation.latitude, userLocation.longitude, action.latitude, action.longitude)} mi away
                    </span>
                  )}
                  {action.points_reward && (
                    <span className="text-emerald-400">+{action.points_reward} pts</span>
                  )}
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card className="bg-[#0f5132]/30 border-emerald-500/10 backdrop-blur-sm p-8 text-center">
            <Leaf className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
            <p className="text-emerald-200/50 text-sm mb-4">
              No upcoming events nearby
            </p>
            <Button
              size="sm"
              className="bg-emerald-500/80 hover:bg-emerald-600"
              onClick={() => window.location.href = '/Map'}
            >
              Add First Event
            </Button>
          </Card>
        )}
      </div>

      {/* Real Environmental News - Auto Updates Daily */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Local Environmental News</h2>
            <p className="text-xs text-emerald-200/40 mt-0.5">Updates automatically every 24 hours</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
            onClick={handleGenerateNews}
            disabled={generateNewsMutation.isPending}
          >
            {generateNewsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-1" />
                Fetch Latest
              </>
            )}
          </Button>
        </div>

        <div className="space-y-3">
          {newsError && (
            <Card className="bg-red-900/20 border-red-500/30 backdrop-blur-sm p-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <p className="text-sm">Error: {newsError}</p>
              </div>
            </Card>
          )}

          {generateNewsMutation.isPending ? (
            <Card className="bg-[#0f5132]/30 border-emerald-500/10 backdrop-blur-sm p-6 text-center">
              <Loader2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-spin" />
              <p className="text-emerald-200/50 text-sm">
                Fetching real-time environmental news from {locationName}...
              </p>
              <p className="text-xs text-emerald-200/30 mt-2">
                This may take 10-15 seconds
              </p>
            </Card>
          ) : newsletters.length > 0 ? (
            newsletters.map((news) => (
              <Card 
                key={news.id}
                className="bg-[#0f5132]/50 border-emerald-500/20 backdrop-blur-sm p-4"
              >
                <h3 className="text-white font-semibold mb-1">{news.title}</h3>
                <p className="text-sm text-emerald-200/60 mb-2">{news.content}</p>
                <div className="flex items-center gap-2 text-xs text-emerald-200/40">
                  <MapPin className="w-3 h-3" />
                  <span>{news.location}</span>
                  <span>•</span>
                  <span>{format(new Date(news.publish_date), 'MMM d, yyyy')}</span>
                </div>
              </Card>
            ))
          ) : (
            <Card className="bg-[#0f5132]/30 border-emerald-500/10 backdrop-blur-sm p-6 text-center">
              <Sparkles className="w-8 h-8 text-emerald-400/30 mx-auto mb-2" />
              <p className="text-emerald-200/50 text-sm mb-4">
                Click "Fetch Latest" to load environmental news
              </p>
              <p className="text-xs text-emerald-200/30">
                News is fetched from the internet in real-time
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {todayScore && (
        <div className="px-6 pb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Today's Activity</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-[#0f5132]/50 border-emerald-500/20 backdrop-blur-sm p-4">
              <div className="text-emerald-200/50 text-xs uppercase tracking-wider mb-1">
                Walking
              </div>
              <div className="text-2xl font-bold text-white">
                {todayScore.walking_minutes || 0}
                <span className="text-sm text-emerald-200/50 ml-1">min</span>
              </div>
            </Card>

            <Card className="bg-[#0f5132]/50 border-emerald-500/20 backdrop-blur-sm p-4">
              <div className="text-emerald-200/50 text-xs uppercase tracking-wider mb-1">
                Cycling
              </div>
              <div className="text-2xl font-bold text-white">
                {todayScore.cycling_minutes || 0}
                <span className="text-sm text-emerald-200/50 ml-1">min</span>
              </div>
            </Card>

            <Card className="bg-[#0f5132]/50 border-emerald-500/20 backdrop-blur-sm p-4">
              <div className="text-emerald-200/50 text-xs uppercase tracking-wider mb-1">
                CO₂ Saved
              </div>
              <div className="text-2xl font-bold text-white">
                {todayScore.carbon_saved_kg?.toFixed(1) || 0}
                <span className="text-sm text-emerald-200/50 ml-1">kg</span>
              </div>
            </Card>

            <Card className="bg-[#0f5132]/50 border-emerald-500/20 backdrop-blur-sm p-4">
              <div className="text-emerald-200/50 text-xs uppercase tracking-wider mb-1">
                Actions
              </div>
              <div className="text-2xl font-bold text-white">
                {todayScore.green_actions_completed || 0}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
