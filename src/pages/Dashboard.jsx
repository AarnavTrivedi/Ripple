import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Leaf, Circle, ChevronRight, Plus, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

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

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(coords);
          
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}`
            );
            const data = await response.json();
            setLocationName(data.address.city || data.address.county || data.address.state || "Virginia");
          } catch (error) {
            console.error("Error getting location name:", error);
          }
        },
        (error) => {
          console.error("Location error:", error);
          setUserLocation({ latitude: 37.5407, longitude: -77.4360 });
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

  const generateNewsMutation = useMutation({
    mutationFn: async () => {
      setNewsError(null);
      
      console.log("Starting news fetch for:", locationName);
      
      const newsData = await base44.integrations.Core.InvokeLLM({
        prompt: `Search the internet for 3 recent environmental news articles about ${locationName}, Virginia. Find real news from the last week about:
- Climate action
- Environmental initiatives
- Pollution or air quality
- Wildlife conservation
- Green energy

Return real headlines and summaries.`,
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

      console.log("News data received:", newsData);

      if (!newsData || !newsData.articles || newsData.articles.length === 0) {
        throw new Error("No articles returned");
      }

      const oldNews = await base44.entities.Newsletter.list();
      for (const news of oldNews) {
        await base44.entities.Newsletter.delete(news.id);
      }

      const today = format(new Date(), 'yyyy-MM-dd');
      for (const article of newsData.articles) {
        await base44.entities.Newsletter.create({
          title: article.title,
          content: article.content,
          location: article.location || locationName,
          category: "climate_news",
          publish_date: today,
          image_url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800"
        });
      }

      console.log("News saved successfully");
      return newsData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      setNewsError(null);
    },
    onError: (error) => {
      console.error("News fetch error:", error);
      setNewsError(error.message || "Failed to fetch news");
    }
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
    setNewsError(null);
    console.log("Manual news fetch triggered");
    generateNewsMutation.mutate();
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3959;
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
    <div className="min-h-screen pb-24">
      {/* Hero Section - Eco Score */}
      <div className="px-6 pt-12 pb-8">
        <div className="flex flex-col items-center">
          {/* Hero Score Card - Eco-Themed with Emerald Background */}
          <div className="relative w-full max-w-sm mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-emerald-400/20 p-12 text-center">
              {/* Circular Progress */}
              <div className="relative w-48 h-48 mx-auto mb-6">
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-emerald-400/10 rounded-full blur-2xl" />
                
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  {/* Background track */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="rgba(16, 185, 129, 0.1)"
                    strokeWidth="12"
                  />
                  {/* Progress arc */}
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 88}`}
                    strokeDashoffset={`${2 * Math.PI * 88 * (1 - score / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[72px] font-bold text-white leading-none tracking-tight mb-2 drop-shadow-lg">
                    {score}
                  </div>
                  <div className="text-sm font-medium text-emerald-200 uppercase tracking-wider">
                    Eco Score
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              {!todayScore && (
                <button
                  onClick={handleStartTracking}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-base font-semibold px-8 py-4 rounded-3xl shadow-[0_8px_24px_rgba(16,185,129,0.25)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.3)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  Start Tracking Today
                </button>
              )}
            </div>
          </div>

          {/* Location Header */}
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <h1 className="text-2xl font-bold text-white">
                Events Near You
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-200/70 ml-4">
              <MapPin className="w-4 h-4" />
              <span>{locationName}, Virginia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Volunteer Opportunities Section */}
      <div className="px-6 pb-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Volunteer Opportunities</h2>
          <button
            onClick={() => window.location.href = '/Map'}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-xl border border-emerald-400/30 transition-all duration-200 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-4">
          {upcomingActions.length > 0 ? (
            upcomingActions.map((action) => (
              <div 
                key={action.id} 
                className="bg-white/15 backdrop-blur-md rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] border border-emerald-400/20 hover:border-emerald-400/40 p-5 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-1.5 truncate">
                      {action.title}
                    </h3>
                    <p className="text-sm text-emerald-100/90 leading-relaxed line-clamp-2">
                      {action.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-emerald-200/60 flex-shrink-0 ml-3 mt-1" />
                </div>
                
                <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-200/70">
                  <span className="font-medium">{format(new Date(action.date), 'MMM d, h:mm a')}</span>
                  {action.latitude && userLocation && (
                    <>
                      <span className="text-emerald-200/40">•</span>
                      <span>
                        {calculateDistance(userLocation.latitude, userLocation.longitude, action.latitude, action.longitude)} mi away
                      </span>
                    </>
                  )}
                  {action.points_reward && (
                    <>
                      <span className="text-emerald-200/40">•</span>
                      <span className="text-emerald-300 font-semibold">+{action.points_reward} pts</span>
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-emerald-400/20 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                <Leaf className="w-8 h-8 text-emerald-300" />
              </div>
              <p className="text-white text-sm mb-4 font-medium">
                No upcoming events nearby
              </p>
              <button
                onClick={() => window.location.href = '/Map'}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-lg transition-all duration-200"
              >
                Add First Event
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Environmental News Section */}
      <div className="px-6 pb-8 max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-white">Local Environmental News</h2>
            <p className="text-xs text-emerald-200/70 mt-1">AI-powered news from your area</p>
          </div>
          <button
            onClick={handleGenerateNews}
            disabled={generateNewsMutation.isPending}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm disabled:bg-white/5 text-white disabled:text-emerald-200/40 text-sm font-semibold px-4 py-2 rounded-xl border border-emerald-400/30 disabled:border-emerald-400/10 transition-all duration-200 flex items-center gap-1.5"
          >
            {generateNewsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Fetch
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {newsError && (
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-400/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-red-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm font-medium">Error: {newsError}</p>
              </div>
            </div>
          )}

          {generateNewsMutation.isPending ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-emerald-400/20 p-8 text-center">
              <Loader2 className="w-12 h-12 text-emerald-300 mx-auto mb-3 animate-spin" />
              <p className="text-white text-sm font-medium mb-1">
                Fetching environmental news from {locationName}...
              </p>
              <p className="text-xs text-emerald-200/70">
                This takes 10-20 seconds
              </p>
            </div>
          ) : newsletters.length > 0 ? (
            newsletters.map((news) => (
              <div 
                key={news.id}
                className="bg-white/15 backdrop-blur-md rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.3)] border border-emerald-400/20 hover:border-emerald-400/40 p-5 cursor-pointer transition-all duration-200"
              >
                <h3 className="text-base font-semibold text-white mb-2 leading-snug">{news.title}</h3>
                <p className="text-sm text-emerald-100/90 leading-relaxed mb-3">{news.content}</p>
                <div className="flex items-center gap-2 text-xs text-emerald-200/70">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-medium">{news.location}</span>
                  <span className="text-emerald-200/40">•</span>
                  <span>{format(new Date(news.publish_date), 'MMM d, yyyy')}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-emerald-400/20 p-8 text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-emerald-300" />
              </div>
              <p className="text-white text-sm font-medium mb-1">
                No news yet
              </p>
              <p className="text-xs text-emerald-200/70">
                Click "Fetch" to load real environmental news
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Activity Stats */}
      {todayScore && (
        <div className="px-6 pb-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-5">Today's Activity</h2>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Walking Stat */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-emerald-400/20 p-5 text-center shadow-lg">
              <div className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider mb-2">
                Walking
              </div>
              <div className="text-[42px] font-bold text-white leading-none drop-shadow-lg">
                {todayScore.walking_minutes || 0}
              </div>
              <div className="text-sm text-emerald-200/70 font-medium mt-1">min</div>
            </div>

            {/* Cycling Stat */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-emerald-400/20 p-5 text-center shadow-lg">
              <div className="text-xs font-medium text-emerald-200/70 uppercase tracking-wider mb-2">
                Cycling
              </div>
              <div className="text-[42px] font-bold text-white leading-none drop-shadow-lg">
                {todayScore.cycling_minutes || 0}
              </div>
              <div className="text-sm text-emerald-200/70 font-medium mt-1">min</div>
            </div>

            {/* CO₂ Saved Stat */}
            <div className="bg-gradient-to-br from-emerald-400/20 to-white/15 backdrop-blur-md rounded-2xl border border-emerald-400/40 p-5 text-center shadow-lg">
              <div className="text-xs font-medium text-emerald-200 uppercase tracking-wider mb-2">
                CO₂ Saved
              </div>
              <div className="text-[42px] font-bold text-emerald-300 leading-none drop-shadow-lg">
                {todayScore.carbon_saved_kg?.toFixed(1) || 0}
              </div>
              <div className="text-sm text-emerald-200 font-medium mt-1">kg</div>
            </div>

            {/* Actions Stat */}
            <div className="bg-white/15 backdrop-blur-md rounded-2xl border border-emerald-400/20 p-5 text-center shadow-lg">
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
    </div>
  );
}