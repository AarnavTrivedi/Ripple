import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Footprints, Bike, Bus, Car, TreePine, Droplet } from "lucide-react";

import EcoScoreCard from "../components/dashboard/EcoScoreCard";
import StatCard from "../components/dashboard/StatCard";
import QuickActions from "../components/dashboard/QuickActions";
import AISuggestion from "../components/dashboard/AISuggestion";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

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
  }, []);

  const { data: ecoScores, isLoading: scoresLoading } = useQuery({
    queryKey: ['ecoScores'],
    queryFn: () => base44.entities.EcoScore.filter(
      { created_by: currentUser?.email },
      '-date',
      7
    ),
    enabled: !!currentUser,
    initialData: [],
  });

  const todayScore = ecoScores[0] || { 
    score: 0, 
    walking_minutes: 0,
    cycling_minutes: 0,
    public_transport_minutes: 0,
    driving_minutes: 0,
    green_actions_completed: 0,
    carbon_saved_kg: 0
  };

  const yesterdayScore = ecoScores[1]?.score || 0;
  const trend = yesterdayScore ? ((todayScore.score - yesterdayScore) / yesterdayScore * 100).toFixed(1) : 0;

  const handleQuickAction = (action) => {
    switch(action) {
      case 'map':
        navigate(createPageUrl("Map"));
        break;
      case 'scan':
        navigate(createPageUrl("Scanner"));
        break;
      case 'add':
        navigate(createPageUrl("Map") + "?action=add");
        break;
      case 'challenges':
        // Future feature
        break;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
        <div className="relative px-6 pt-8 pb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <span className="text-xl font-bold text-white">
                {currentUser?.full_name?.[0] || 'E'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Welcome back</p>
              <p className="text-sm font-semibold text-white">
                {currentUser?.full_name || 'Eco Warrior'}
              </p>
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-white to-emerald-300 bg-clip-text text-transparent">
            EcoTracker
          </h1>
          <p className="text-sm text-gray-400">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 pb-8 space-y-6">
        {/* Eco Score */}
        <EcoScoreCard score={todayScore.score} trend={trend} />

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={Footprints}
            label="Walking"
            value={todayScore.walking_minutes}
            unit="min"
            color="emerald"
            index={0}
          />
          <StatCard
            icon={Bike}
            label="Cycling"
            value={todayScore.cycling_minutes}
            unit="min"
            color="blue"
            index={1}
          />
          <StatCard
            icon={Bus}
            label="Transit"
            value={todayScore.public_transport_minutes}
            unit="min"
            color="purple"
            index={2}
          />
          <StatCard
            icon={Car}
            label="Driving"
            value={todayScore.driving_minutes}
            unit="min"
            color="amber"
            index={3}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={TreePine}
            label="Green Actions"
            value={todayScore.green_actions_completed}
            color="emerald"
            index={4}
          />
          <StatCard
            icon={Droplet}
            label="CO₂ Saved"
            value={todayScore.carbon_saved_kg}
            unit="kg"
            color="blue"
            index={5}
          />
        </div>

        {/* AI Suggestion */}
        <AISuggestion suggestion={todayScore.ai_suggestion} />

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-white">Quick Actions</h2>
          <QuickActions onAction={handleQuickAction} />
        </div>
      </div>
    </div>
  );
}