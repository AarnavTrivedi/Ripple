import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check } from "lucide-react";

export default function ActivityLogger({ onLogActivity, currentScore }) {
  const [showForm, setShowForm] = useState(false);
  const [activities, setActivities] = useState({
    walking_minutes: 0,
    cycling_minutes: 0,
    public_transport_minutes: 0,
    driving_minutes: 0,
    green_actions: 0
  });

  const calculateScore = () => {
    const walking = activities.walking_minutes * 1.5;
    const cycling = activities.cycling_minutes * 2;
    const transit = activities.public_transport_minutes * 1;
    const driving = Math.max(0, 100 - (activities.driving_minutes * 0.5));
    const actions = activities.green_actions * 10;
    
    return Math.min(100, Math.round((walking + cycling + transit + actions) / 5));
  };

  const calculateCarbonSaved = () => {
    const walkingSaved = activities.walking_minutes * 0.1;
    const cyclingSaved = activities.cycling_minutes * 0.12;
    const transitSaved = activities.public_transport_minutes * 0.05;
    return (walkingSaved + cyclingSaved + transitSaved).toFixed(2);
  };

  const handleSubmit = () => {
    const newScore = calculateScore();
    const carbonSaved = parseFloat(calculateCarbonSaved());
    
    onLogActivity({
      walking_minutes: activities.walking_minutes,
      cycling_minutes: activities.cycling_minutes,
      public_transport_minutes: activities.public_transport_minutes,
      driving_minutes: activities.driving_minutes,
      green_actions_completed: activities.green_actions,
      carbon_saved_kg: carbonSaved,
      score: newScore
    });
    
    setShowForm(false);
    setActivities({
      walking_minutes: 0,
      cycling_minutes: 0,
      public_transport_minutes: 0,
      driving_minutes: 0,
      green_actions: 0
    });
  };

  return (
    <div className="px-6 pb-6">
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Today's Activities
        </Button>
      ) : (
        <Card className="bg-[#0f5132]/60 border-emerald-500/20 backdrop-blur-sm p-5">
          <h3 className="text-lg font-semibold text-white mb-4">Track Your Day</h3>
          
          <div className="space-y-4">
            <div>
              <Label className="text-emerald-200 text-sm">Walking (minutes)</Label>
              <Input
                type="number"
                min="0"
                value={activities.walking_minutes}
                onChange={(e) => setActivities({...activities, walking_minutes: parseInt(e.target.value) || 0})}
                className="bg-[#1e4d3a] border-emerald-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-emerald-200 text-sm">Cycling (minutes)</Label>
              <Input
                type="number"
                min="0"
                value={activities.cycling_minutes}
                onChange={(e) => setActivities({...activities, cycling_minutes: parseInt(e.target.value) || 0})}
                className="bg-[#1e4d3a] border-emerald-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-emerald-200 text-sm">Public Transport (minutes)</Label>
              <Input
                type="number"
                min="0"
                value={activities.public_transport_minutes}
                onChange={(e) => setActivities({...activities, public_transport_minutes: parseInt(e.target.value) || 0})}
                className="bg-[#1e4d3a] border-emerald-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-emerald-200 text-sm">Driving (minutes)</Label>
              <Input
                type="number"
                min="0"
                value={activities.driving_minutes}
                onChange={(e) => setActivities({...activities, driving_minutes: parseInt(e.target.value) || 0})}
                className="bg-[#1e4d3a] border-emerald-500/30 text-white"
              />
            </div>

            <div>
              <Label className="text-emerald-200 text-sm">Green Actions Completed</Label>
              <Input
                type="number"
                min="0"
                value={activities.green_actions}
                onChange={(e) => setActivities({...activities, green_actions: parseInt(e.target.value) || 0})}
                className="bg-[#1e4d3a] border-emerald-500/30 text-white"
              />
              <p className="text-xs text-emerald-200/50 mt-1">
                Examples: Recycled, used reusable bag, composted, etc.
              </p>
            </div>

            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-3">
              <p className="text-sm text-emerald-200/70 mb-1">Projected Eco Score:</p>
              <p className="text-3xl font-bold text-emerald-400">{calculateScore()}</p>
              <p className="text-xs text-emerald-200/50 mt-1">
                CO₂ Saved: {calculateCarbonSaved()} kg
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setShowForm(false)}
                variant="outline"
                className="flex-1 border-emerald-500/30 text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600"
              >
                <Check className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}