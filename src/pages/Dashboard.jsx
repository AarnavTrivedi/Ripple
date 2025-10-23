import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

import CircularScore from "../components/dashboard/CircularScore";
import EventsHeader from "../components/dashboard/EventsHeader";
import EventPreviewCard from "../components/dashboard/EventPreviewCard";
import StatCard from "../components/dashboard/StatCard";
import { Footprints, Bike, TreePine, Droplet } from "lucide-react";

export default function Dashboard() {
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

  const { data: ecoScores } = useQuery({
    queryKey: ['ecoScores'],
    queryFn: () => base44.entities.EcoScore.filter(
      { created_by: currentUser?.email },
      '-date',
      7
    ),
    enabled: !!currentUser,
    initialData: [],
  });

  const { data: greenActions } = useQuery({
    queryKey: ['greenActions'],
    queryFn: () => base44.entities.GreenAction.filter(
      { completed: false },
      '-date',
      10
    ),
    initialData: [],
  });

  const todayScore = ecoScores[0] || { 
    score: 0, 
    walking_minutes: 0,
    cycling_minutes: 0,
    green_actions_completed: 0,
    carbon_saved_kg: 0
  };

  const upcomingEvents = greenActions.map(action => ({
    title: action.title,
    description: action.description,
    date: format(new Date(action.date), 'MMM d, h:mm a'),
    distance: action.latitude ? '0.5 mi' : 'Online',
    points: action.points_reward,
    type: action.action_type
  }));

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
          {upcomingEvents.slice(0, 3).map((event, index) => (
            <EventPreviewCard key={index} event={event} index={index} />
          ))}
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
            value={todayScore.carbon_saved_kg}
            unit="kg"
            color="emerald"
            index={3}
          />
        </div>
      </div>
    </div>
  );
}