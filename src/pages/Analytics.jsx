import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp } from "lucide-react";
import { format, subDays } from "date-fns";

export default function Analytics() {
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
    queryKey: ['ecoScores', currentUser?.email],
    queryFn: async () => {
      return await base44.entities.EcoScore.filter(
        { created_by: currentUser?.email },
        '-date',
        30
      );
    },
    enabled: !!currentUser,
    initialData: [],
  });

  const { data: emissions } = useQuery({
    queryKey: ['emissions'],
    queryFn: () => base44.entities.EmissionData.list('-date', 30),
    initialData: [],
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
    <div className="min-h-screen p-6 pt-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-emerald-200/60 text-sm">Track your environmental impact</p>
      </div>

      {/* Total Carbon Saved */}
      <Card className="bg-gradient-to-br from-emerald-400/20 to-white/15 backdrop-blur-md border-emerald-400/40 p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp className="w-6 h-6 text-emerald-300" />
          <span className="text-emerald-200 text-sm font-medium">Total Carbon Saved</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white drop-shadow-lg">{totalCarbon.toFixed(1)}</span>
          <span className="text-emerald-200/80">kg CO₂</span>
        </div>
        <p className="text-sm text-emerald-200/70 mt-2">
          ≈ {Math.floor(totalCarbon / 20)} trees planted
        </p>
      </Card>

      {/* Score Progress */}
      {chartData.length > 0 && (
        <Card className="bg-white/15 backdrop-blur-md border-emerald-400/30 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 drop-shadow-lg">Eco Score Progress</h2>
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
        </Card>
      )}

      {/* Transport Breakdown */}
      {transportData.length > 0 && (
        <Card className="bg-white/15 backdrop-blur-md border-emerald-400/30 p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4 drop-shadow-lg">Transport (Last 7 Days)</h2>
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
        </Card>
      )}

      {/* Virginia Emissions */}
      {emissions.length > 0 && (
        <Card className="bg-white/15 backdrop-blur-md border-emerald-400/30 p-6">
          <h2 className="text-lg font-semibold text-white mb-4 drop-shadow-lg">Virginia Emissions</h2>
          <div className="space-y-4">
            {emissions.slice(0, 5).map((e, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span className="text-emerald-100/80">{e.location}</span>
                  <span className={`font-semibold ${
                    e.change_percentage > 0 ? 'text-red-300' : 'text-emerald-300'
                  }`}>
                    {e.change_percentage > 0 ? '+' : ''}{e.change_percentage}%
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      e.change_percentage > 0 ? 'bg-red-400' : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.min(Math.abs(e.change_percentage) * 10, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}