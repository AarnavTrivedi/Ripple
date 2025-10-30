
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, Bell, Award, LogOut, Mail, RefreshCw, Leaf } from "lucide-react";
import { loadUserProfile, resetAllQuizData } from "@/utils/quizStorage";

// Mock user data
const mockUser = {
  email: "demo@ripple.app",
  full_name: "Eco Warrior",
  eco_points: 1250,
  newsletter_subscribed: true
};

// Storage keys
const USER_STORAGE_KEY = "ripple_user";
const NEWSLETTER_STORAGE_KEY = "ripple_newsletters";

// Get stored user data
const getStoredUser = () => {
  try {
    const data = localStorage.getItem(USER_STORAGE_KEY);
    return data ? JSON.parse(data) : mockUser;
  } catch (error) {
    return mockUser;
  }
};

// Save user data
const saveStoredUser = (userData) => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

// Mock newsletters
const mockNewsletters = [
  {
    id: 1,
    title: "Local Park Cleanup Initiative",
    location: "Green Valley Park"
  },
  {
    id: 2,
    title: "Sustainable Transportation Week",
    location: "City Wide"
  },
  {
    id: 3,
    title: "Virginia Environmental Summit",
    location: "Richmond Convention Center"
  }
];

export default function Profile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Load user from localStorage
    setCurrentUser(getStoredUser());
    // Load eco profile from quiz
    const profile = loadUserProfile();
    setUserProfile(profile);
  }, []);

  const { data: newsletters } = useQuery({
    queryKey: ['newsletters'],
    queryFn: async () => {
      try {
        const stored = localStorage.getItem(NEWSLETTER_STORAGE_KEY);
        return stored ? JSON.parse(stored) : mockNewsletters;
      } catch (error) {
        return mockNewsletters;
      }
    },
    initialData: mockNewsletters,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data) => {
      const updatedUser = { ...currentUser, ...data };
      saveStoredUser(updatedUser);
      return updatedUser;
    },
    onSuccess: (updatedUser) => {
      setCurrentUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleNewsletterToggle = (value) => {
    updateUserMutation.mutate({ newsletter_subscribed: value });
  };

  const handleLogout = () => {
    // Clear user data and redirect (optional)
    localStorage.removeItem(USER_STORAGE_KEY);
    window.location.reload();
  };

  const handleRetakeQuiz = () => {
    // Reset quiz data and navigate to onboarding
    if (window.confirm('Are you sure you want to retake the onboarding quiz? Your current preferences will be reset.')) {
      resetAllQuizData();
      navigate('/onboarding');
    }
  };

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

      <div className="relative z-10 p-6 pt-8 pb-32">
        {/* Header */}
        <div className="mb-8">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-white">
            {currentUser?.full_name?.[0] || userProfile?.name?.[0] || 'E'}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {currentUser?.full_name || userProfile?.name || 'Eco Warrior'}
        </h1>
        <p className="text-emerald-200/60 text-sm">{currentUser?.email}</p>
        
        {/* Eco Profile Info */}
        {userProfile && (
          <div className="mt-3 space-y-2">
            {userProfile.location && (
              <p className="text-emerald-200/70 text-sm">📍 {userProfile.location}</p>
            )}
            {userProfile.ecoLevel && (
              <p className="text-emerald-200/70 text-sm capitalize">
                🌱 {userProfile.ecoLevel.replace('_', ' ')} Level
              </p>
            )}
          </div>
        )}
        
        {/* Eco Points */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-lg font-bold text-amber-400">
            {currentUser?.eco_points || 0}
          </span>
          <span className="text-sm text-white">Eco Points</span>
        </div>
      </div>

      {/* Newsletter */}
      <Card className="bg-emerald-950/40 backdrop-blur-xl border-2 border-emerald-500/20 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Newsletter</h2>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-white font-medium">
              Virginia Environmental Updates
            </Label>
            <p className="text-sm text-emerald-200/60 mt-1">
              Weekly updates about local environmental news
            </p>
          </div>
          <Switch
            checked={currentUser?.newsletter_subscribed || false}
            onCheckedChange={handleNewsletterToggle}
            className="data-[state=checked]:bg-emerald-500"
          />
        </div>

        {currentUser?.newsletter_subscribed && (
          <div className="mt-4 space-y-2">
            {newsletters.slice(0, 3).map((newsletter) => (
              <div key={newsletter.id} className="p-3 bg-emerald-900/30 border border-emerald-500/20 rounded-lg hover:bg-emerald-900/40 transition-colors">
                <h4 className="text-sm font-medium text-white">{newsletter.title}</h4>
                <p className="text-xs text-emerald-200/60 mt-1">
                  {newsletter.location}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Settings */}
      <Card className="bg-emerald-950/40 backdrop-blur-xl border-2 border-emerald-500/20 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Settings</h2>
        </div>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start bg-emerald-900/30 border-emerald-500/30 text-white hover:bg-emerald-800/40 hover:border-emerald-400/50 transition-all"
          >
            <Bell className="w-4 h-4 mr-3 text-emerald-400" />
            Notifications
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start bg-emerald-900/30 border-emerald-500/30 text-white hover:bg-emerald-800/40 hover:border-emerald-400/50 transition-all"
          >
            <User className="w-4 h-4 mr-3 text-emerald-400" />
            Edit Profile
          </Button>

          <Button
            onClick={handleRetakeQuiz}
            variant="outline"
            className="w-full justify-start bg-emerald-900/30 border-emerald-500/30 text-white hover:bg-emerald-800/40 hover:border-emerald-400/50 transition-all"
          >
            <RefreshCw className="w-4 h-4 mr-3 text-emerald-400" />
            Retake Onboarding Quiz
          </Button>
        </div>
      </Card>

      {/* Logout */}
      <Button
        onClick={handleLogout}
        className="w-full bg-red-500/80 hover:bg-red-600 border-2 border-red-500/40 text-white backdrop-blur-xl shadow-lg hover:shadow-red-500/20 transition-all"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Logout
      </Button>
      </div>
    </div>
  );
}
