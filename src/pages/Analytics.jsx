
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

// Mock user data
const mockUser = {
  email: "demo@ecotrackr.app",
  name: "Demo User"
};

// Storage keys
const STORAGE_KEY = "ecotrackr_data";
const EMISSIONS_KEY = "ecotrackr_emissions";

// Get stored data from localStorage
const getStoredData = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { scores: [], actions: [], newsletters: [] };
  } catch (error) {
    return { scores: [], actions: [], newsletters: [] };
  }
};

// Generate sample data for last 7 days when no real data exists
const generateSampleScores = () => {
  const sampleScores = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    sampleScores.push({
      id: `sample-${i}`,
      date: format(date, 'yyyy-MM-dd'),
      score: Math.floor(Math.random() * 30) + 40, // Random scores 40-70
      walking_minutes: Math.floor(Math.random() * 30) + 10,
      cycling_minutes: Math.floor(Math.random() * 20) + 5,
      public_transport_minutes: Math.floor(Math.random() * 25) + 10,
      driving_minutes: Math.floor(Math.random() * 15) + 5,
      carbon_saved_kg: (Math.random() * 2 + 0.5).toFixed(2),
      green_actions_completed: Math.floor(Math.random() * 3),
      created_date: date.toISOString()
    });
  }
  return sampleScores;
};

// Mock emissions data - ALWAYS available
const mockEmissions = [
  { location: "Richmond", change_percentage: -2.5, date: new Date().toISOString() },
  { location: "Virginia Beach", change_percentage: 1.2, date: new Date().toISOString() },
  { location: "Arlington", change_percentage: -1.8, date: new Date().toISOString() },
  { location: "Norfolk", change_percentage: 0.5, date: new Date().toISOString() },
  { location: "Fairfax", change_percentage: -3.1, date: new Date().toISOString() }
];

export default function Analytics() {
  const [currentUser, setCurrentUser] = useState(mockUser);

  useEffect(() => {
    // Set mock user immediately
    setCurrentUser(mockUser);
  }, []);

  const { data: ecoScores } = useQuery({
    queryKey: ['ecoScores', currentUser?.email],
    queryFn: async () => {
      const storedData = getStoredData();
      // If no real data exists, use sample data
      if (storedData.scores.length === 0) {
        return generateSampleScores();
      }
      return storedData.scores.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 30);
    },
    enabled: !!currentUser,
    initialData: generateSampleScores(), // Always start with sample data
  });

  const { data: emissions } = useQuery({
    queryKey: ['emissions'],
    queryFn: async () => {
      try {
        const stored = localStorage.getItem(EMISSIONS_KEY);
        return stored ? JSON.parse(stored) : mockEmissions;
      } catch (error) {
        return mockEmissions;
      }
    },
    initialData: mockEmissions,
  });

  const chartData = ecoScores.reverse().map(score => ({
    date: format(new Date(score.date), 'MM/dd'),
    score: score.score,
    carbon: score.carbon_saved_kg || 0
  }));

  const transportData = ecoScores.slice(-7).map(score => ({
    date: format(new Date(score.date), 'MM/dd'),
    walking: score.walking_minutes || 0,
    cycling: score.cycling_minutes || 0,
    transit: score.public_transport_minutes || 0,
    driving: score.driving_minutes || 0
  }));

  const totalCarbon = ecoScores.reduce((sum, s) => sum + (s.carbon_saved_kg || 0), 0);

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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-emerald-200/60 text-sm">Track your environmental impact</p>
        </div>

      {/* Total Carbon Saved */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-emerald-400" />
          <span className="text-emerald-200/80 text-sm">Total Carbon Saved</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">{totalCarbon.toFixed(1)}</span>
          <span className="text-emerald-200/60">kg CO₂</span>
        </div>
        <p className="text-sm text-emerald-200/60 mt-2">
          ≈ {Math.floor(totalCarbon / 20)} trees planted
        </p>
      </Card>

      {/* Score Progress - ALWAYS VISIBLE */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Eco Score Progress</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f5132',
                  border: '1px solid #10b981',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <p className="text-emerald-200/60 text-sm">Start tracking to see your progress</p>
          </div>
        )}
      </Card>

      {/* Transport Breakdown - ALWAYS VISIBLE */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Transport (Last 7 Days)</h2>
        {transportData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={transportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f5132',
                  border: '1px solid #10b981',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="walking" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cycling" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="transit" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="driving" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[250px] flex items-center justify-center">
            <p className="text-emerald-200/60 text-sm">Start tracking your transport to see breakdown</p>
          </div>
        )}
      </Card>

      {/* Virginia Emissions - ALWAYS VISIBLE */}
      <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Virginia Emissions</h2>
        <div className="space-y-4">
          {emissions.slice(0, 5).map((e, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-emerald-200/60">{e.location}</span>
                <span className={`font-semibold ${
                  e.change_percentage > 0 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {e.change_percentage > 0 ? '+' : ''}{e.change_percentage}%
                </span>
              </div>
              <div className="h-2 bg-[#1e4d3a] rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${
                    e.change_percentage > 0 ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(Math.abs(e.change_percentage) * 10, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
      </div>
    </div>
  );
}
