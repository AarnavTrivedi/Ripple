import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Check } from "lucide-react";

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

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="bg-[#10D9A0] hover:bg-[#0ec090] text-white font-semibold px-10 py-6 rounded-full text-base shadow-lg transition-all duration-300 hover:scale-105"
      >
        <Plus className="w-5 h-5 mr-2" />
        Log Todays Activities
      </Button>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <h3 className="text-lg font-semibold text-white text-center mb-4">Track Your Day</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-white text-xs mb-1 block">Walking (min)</Label>
          <Input
            type="number"
            min="0"
            value={activities.walking_minutes || ''}
            onChange={(e) => setActivities({...activities, walking_minutes: parseInt(e.target.value) || 0})}
            className="bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-sm h-10"
          />
        </div>

        <div>
          <Label className="text-white text-xs mb-1 block">Cycling (min)</Label>
          <Input
            type="number"
            min="0"
            value={activities.cycling_minutes || ''}
            onChange={(e) => setActivities({...activities, cycling_minutes: parseInt(e.target.value) || 0})}
            className="bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-sm h-10"
          />
        </div>

        <div>
          <Label className="text-white text-xs mb-1 block">Transit (min)</Label>
          <Input
            type="number"
            min="0"
            value={activities.public_transport_minutes || ''}
            onChange={(e) => setActivities({...activities, public_transport_minutes: parseInt(e.target.value) || 0})}
            className="bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-sm h-10"
          />
        </div>

        <div>
          <Label className="text-white text-xs mb-1 block">Driving (min)</Label>
          <Input
            type="number"
            min="0"
            value={activities.driving_minutes || ''}
            onChange={(e) => setActivities({...activities, driving_minutes: parseInt(e.target.value) || 0})}
            className="bg-white/10 border-white/20 text-white rounded-xl backdrop-blur-sm h-10"
          />
        </div>
      </div>

      <div>
        <Label className="text-white text-xs mb-1 block">Green Actions</Label>
        <Input
          type="number"
          min="0"
          placeholder="e.g., 3"
          value={activities.green_actions || ''}
          onChange={(e) => setActivities({...activities, green_actions: parseInt(e.target.value) || 0})}
          className="bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl backdrop-blur-sm h-10"
        />
      </div>

      <div className="bg-emerald-500/20 border border-emerald-400/30 rounded-xl p-3">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>New Score:</span>
          <span className="text-2xl font-bold text-[#10D9A0]">{calculateScore()}</span>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          onClick={() => setShowForm(false)}
          variant="outline"
          className="flex-1 border-white/20 text-white hover:bg-white/10 rounded-full h-12"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-[#10D9A0] hover:bg-[#0ec090] text-white rounded-full h-12"
        >
          <Check className="w-5 h-5 mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
}