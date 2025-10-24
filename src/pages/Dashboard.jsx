import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Footprints, Bike, TreePine, Droplet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import CircularScore from "../components/dashboard/CircularScore";
import EventsHeader from "../components/dashboard/EventsHeader";
import EventPreviewCard from "../components/dashboard/EventPreviewCard";
import StatCard from "../components/dashboard/StatCard";

export default function Dashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  const { data: ecoScores, isLoading: scoresLoading } = useQuery({
    queryKey: ['ecoScores', currentUser?.email],
    queryFn: () => base44.entities.EcoScore.filter(
      { created_by: currentUser?.email },
      '-date',
      7
    ),
    enabled: !!currentUser,
    initialData: [],
  });

  const { data: greenActions, isLoading: actionsLoading } = useQuery({
    queryKey: ['greenActions'],
    queryFn: () => base44.entities.GreenAction.filter(
      { completed: false },
      '-date',
      10
    ),
    initialData: [],
  });

  const todayScore = ecoScores[0] || { 
    score: 75, 
    walking_minutes: 0,
    cycling_minutes: 0,
    green_actions_completed: 0,
    carbon_saved_kg: 0
  };

  const upcomingEvents = greenActions.map(action => ({
    id: action.id,
    title: action.title,
    description: action.description,
    date: format(new Date(action.date), 'MMM d, h:mm a'),
    distance: action.latitude ? '2.5 mi' : 'Online',
    points: action.points_reward,
    type: action.action_type
  }));

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Section with Circular Score */}
      <div className="relative px-6 pt-12">
        <CircularScore score={todayScore.score} />
        
        {/* Events Header */}
        <EventsHeader />
      </div>

      {/* Main Content Area */}
      <div className="px-6 pb-8 space-y-5">
        {/* Upcoming Events */}
        <div className="space-y-3">
          {actionsLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full bg-[#1e4d3a]/40" />
            ))
          ) : upcomingEvents.length > 0 ? (
            upcomingEvents.slice(0, 3).map((event, index) => (
              <EventPreviewCard key={event.id} event={event} index={index} />
            ))
          ) : (
            <div className="text-center py-8 text-emerald-200/60">
              <p>No upcoming events. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mt-6">
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
            color="emerald"
            index={1}
          />
          <StatCard
            icon={TreePine}
            label="Green Actions"
            value={todayScore.green_actions_completed}
            color="emerald"
            index={2}
          />
          <StatCard
            icon={Droplet}
            label="CO₂ Saved"
            value={todayScore.carbon_saved_kg.toFixed(1)}
            unit="kg"
            color="emerald"
            index={3}
          />
        </div>
      </div>
    </div>
  );
}