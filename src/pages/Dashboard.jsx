import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Leaf, Circle, ChevronRight, Plus, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [generatingNews, setGeneratingNews] = useState(false);

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
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
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
    queryFn: () => base44.entities.Newsletter.list('-publish_date', 3),
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
      const newsData = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate 3 recent environmental news articles relevant to Virginia, USA. Focus on local environmental initiatives, climate action, sustainability programs, or environmental challenges in Virginia. Make them realistic and specific to Virginia.`,
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
                  location: { type: "string" },
                  category: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Create newsletter entries
      const today = format(new Date(), 'yyyy-MM-dd');
      for (const article of newsData.articles) {
        await base44.entities.Newsletter.create({
          title: article.title,
          content: article.content,
          location: article.location,
          category: "climate_news",
          publish_date: today,
          image_url: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800"
        });
      }

      return newsData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletters'] });
      setGeneratingNews(false);
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
    setGeneratingNews(true);
    generateNewsMutation.mutate();
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
              {userLocation 
                ? `${userLocation.latitude.toFixed(2)}, ${userLocation.longitude.toFixed(2)}`
                : 'Getting location...'}
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
                  {action.latitude && <span>
                    {userLocation ? 
                      `${(Math.sqrt(Math.pow(action.latitude - userLocation.latitude, 2) + Math.pow(action.longitude - userLocation.longitude, 2)) * 69).toFixed(1)} mi` 
                      : 'Nearby'}
                  </span>}
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
            <p className="text-emerald-200/50 text-sm">
              No upcoming events nearby
            </p>
          </Card>
        )}
      </div>

      {/* Environmental News */}
      <div className="px-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Local Environmental News</h2>
          <Button
            size="sm"
            variant="outline"
            className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
            onClick={handleGenerateNews}
            disabled={generatingNews}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            {generatingNews ? 'Loading...' : 'Fetch Latest'}
          </Button>
        </div>

        <div className="space-y-3">
          {newsletters.length > 0 ? (
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
              <p className="text-emerald-200/50 text-sm">
                Click "Fetch Latest" to load environmental news
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