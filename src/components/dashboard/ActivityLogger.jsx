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
    const walking = activities.walking_minutes * 1.5;
    const cycling = activities.cycling_minutes * 2;
    const transit = activities.public_transport_minutes * 1;
    const drivingPenalty = activities.driving_minutes * 0.3;
    const actions = activities.green_actions * 10;
    const stepBonus = Math.min((activities.steps / 10000) * 20, 20);
    
    const newPoints = (walking + cycling + transit + actions + stepBonus - drivingPenalty) / 5;
    return Math.min(100, Math.max(0, Math.round(currentScore + newPoints)));
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
      green_actions: 0,
      steps: 0
    });
  };

  return (
    <div>
      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold py-6 rounded-full shadow-lg shadow-emerald-500/50"
        >
          <Plus className="w-5 h-5 mr-2" />
          Log Today's Activities
        </Button>
      ) : (
        <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Track Your Day</h3>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowForm(false)}
              className="text-white hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-white text-sm flex items-center gap-2 mb-2">
                <Footprints className="w-4 h-4" />
                Steps Taken Today
              </Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g., 8000"
                value={activities.steps || ''}
                onChange={(e) => setActivities({...activities, steps: parseInt(e.target.value) || 0})}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm"
              />
              <p className="text-xs text-gray-400 mt-1">Goal: 10,000 steps/day</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white text-sm mb-2 block">Walking (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={activities.walking_minutes || ''}
                  onChange={(e) => setActivities({...activities, walking_minutes: parseInt(e.target.value) || 0})}
                  className="bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-sm"
                />
              </div>

              <div>
                <Label className="text-white text-sm mb-2 block">Cycling (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={activities.cycling_minutes || ''}
                  onChange={(e) => setActivities({...activities, cycling_minutes: parseInt(e.target.value) || 0})}
                  className="bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-white text-sm mb-2 block">Transit (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={activities.public_transport_minutes || ''}
                  onChange={(e) => setActivities({...activities, public_transport_minutes: parseInt(e.target.value) || 0})}
                  className="bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-sm"
                />
              </div>

              <div>
                <Label className="text-white text-sm mb-2 block">Driving (min)</Label>
                <Input
                  type="number"
                  min="0"
                  value={activities.driving_minutes || ''}
                  onChange={(e) => setActivities({...activities, driving_minutes: parseInt(e.target.value) || 0})}
                  className="bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-white text-sm mb-2 block">Green Actions</Label>
              <Input
                type="number"
                min="0"
                placeholder="e.g., 3"
                value={activities.green_actions || ''}
                onChange={(e) => setActivities({...activities, green_actions: parseInt(e.target.value) || 0})}
                className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Recycled, used reusable bag, composted, etc.
              </p>
            </div>

            <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-300">New Eco Score:</p>
                <p className="text-3xl font-bold text-emerald-400">{calculateScore()}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>CO₂ Saved:</span>
                <span className="font-semibold text-emerald-400">{calculateCarbonSaved()} kg</span>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white font-semibold py-4 rounded-full shadow-lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Save Activities
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}