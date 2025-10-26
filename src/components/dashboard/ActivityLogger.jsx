/* eslint-disable react/prop-types */
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check, X, Footprints } from "lucide-react";

export default function ActivityLogger({ onLogActivity, currentScore, currentActivities }) {
  const [showForm, setShowForm] = useState(false);
  const [activities, setActivities] = useState({
    walking_minutes: 0,
    cycling_minutes: 0,
    public_transport_minutes: 0,
    driving_minutes: 0,
    green_actions: 0,
    steps: 0
  });

  const calculateScore = () => {
    // Calculate based on activities
    const walking = activities.walking_minutes * 1.5;
    const cycling = activities.cycling_minutes * 2;
    const transit = activities.public_transport_minutes * 1;
    const drivingPenalty = activities.driving_minutes * 0.3;
    const actions = activities.green_actions * 10;
    const stepBonus = Math.min((activities.steps / 10000) * 20, 20); // Max 20 points for 10k steps
    
    const newPoints = (walking + cycling + transit + actions + stepBonus - drivingPenalty) / 5;
    return Math.min(100, Math.max(0, Math.round(currentScore + newPoints)));
  };

  const calculateCarbonSaved = () => {
    // CO2 saved per minute of eco-friendly transport
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
      green_actions: 0,
      steps: 0
    });
  };

  return (
    <div className="px-6 pb-6">
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Log Today&apos;s Activities
        </Button>
      ) : (
        <Card className="bg-[#0f5132]/60 border-emerald-500/20 backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Track Your Day</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="text-emerald-200 hover:bg-emerald-500/20"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-emerald-200 text-sm flex items-center gap-2">
                <Footprints className="w-4 h-4" />
                Steps Taken Today
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g., 8000"
                value={activities.steps || ''}
                onChange={(e) => setActivities({...activities, steps: parseInt(e.target.value) || 0})}
                className="bg-[#1e4d3a] border-emerald-500/30 text-white placeholder-emerald-300/50"
              />
              <p className="text-xs text-emerald-200/40 mt-1">Goal: 10,000 steps/day</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-emerald-200 text-sm">Walking (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={activities.walking_minutes || ''}
                  onChange={(e) => setActivities({...activities, walking_minutes: parseInt(e.target.value) || 0})}
                  className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-emerald-200 text-sm">Cycling (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={activities.cycling_minutes || ''}
                  onChange={(e) => setActivities({...activities, cycling_minutes: parseInt(e.target.value) || 0})}
                  className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-emerald-200 text-sm">Transit (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={activities.public_transport_minutes || ''}
                  onChange={(e) => setActivities({...activities, public_transport_minutes: parseInt(e.target.value) || 0})}
                  className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                />
              </div>

              <div>
                <Label className="text-emerald-200 text-sm">Driving (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={activities.driving_minutes || ''}
                  onChange={(e) => setActivities({...activities, driving_minutes: parseInt(e.target.value) || 0})}
                  className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-emerald-200 text-sm">Green Actions</Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g., 3"
                value={activities.green_actions || ''}
                onChange={(e) => setActivities({...activities, green_actions: parseInt(e.target.value) || 0})}
                className="bg-[#1e4d3a] border-emerald-500/30 text-white placeholder-emerald-300/50"
              />
              <p className="text-xs text-emerald-200/40 mt-1">
                Recycled, used reusable bag, composted, etc.
              </p>
            </div>

            <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-emerald-200/70">New Eco Score:</p>
                <p className="text-3xl font-bold text-emerald-400">{calculateScore()}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-200/50">
                <span>CO₂ Saved:</span>
                <span className="font-semibold">{calculateCarbonSaved()} kg</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-emerald-500 hover:bg-emerald-600 shadow-lg"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Activities
            </Button>
          </div>
        </Card>
      )}

      {currentActivities && (
        <Card className="bg-[#0f5132]/40 border-emerald-500/10 backdrop-blur-sm p-4 mt-4">
          <h4 className="text-white font-semibold text-sm mb-3">Today&apos;s Progress</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-emerald-200/60">Walking:</span>
              <span className="text-white font-semibold">{currentActivities.walking_minutes || 0} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-200/60">Cycling:</span>
              <span className="text-white font-semibold">{currentActivities.cycling_minutes || 0} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-200/60">Transit:</span>
              <span className="text-white font-semibold">{currentActivities.public_transport_minutes || 0} min</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-200/60">CO₂ Saved:</span>
              <span className="text-emerald-400 font-semibold">{(currentActivities.carbon_saved_kg || 0).toFixed(1)} kg</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}