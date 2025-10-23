import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Globe, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("week");
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

  const { data: ecoScores, isLoading } = useQuery({
    queryKey: ['ecoScores', timeRange, currentUser?.email],
    queryFn: () => base44.entities.EcoScore.filter(
      { created_by: currentUser?.email },
      '-date',
      timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 90
    ),
    enabled: !!currentUser,
    initialData: [],
  });

  const { data: emissions } = useQuery({
    queryKey: ['emissions'],
    queryFn: () => base44.entities.EmissionData.list('-date', 30),
    initialData: [],
  });

  const personalData = ecoScores.length > 0 ? ecoScores.reverse().map(score => ({
    date: format(new Date(score.date), 'MMM dd'),
    score: score.score,
    carbonSaved: score.carbon_saved_kg
  })) : [];

  const transportData = ecoScores.slice(-7).map(score => ({
    date: format(new Date(score.date), 'MM/dd'),
    walking: score.walking_minutes || 0,
    cycling: score.cycling_minutes || 0,
    transit: score.public_transport_minutes || 0,
    driving: score.driving_minutes || 0
  }));

  const localEmissions = emissions.filter(e => e.scope === 'local' || e.scope === 'county');
  const globalEmissions = emissions.filter(e => e.scope === 'global');

  const totalCarbonSaved = ecoScores.reduce((sum, score) => sum + (score.carbon_saved_kg || 0), 0);

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="relative px-6 py-8 border-b border-emerald-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent" />
        <div className="relative flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg shadow-emerald-500/50">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">
              Analytics
            </h1>
            <p className="text-sm text-emerald-200/60">Track your environmental impact</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6 space-y-6">
        {/* Time Range Selector */}
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList className="bg-[#1e4d3a]/80 border border-emerald-500/30 w-full">
            <TabsTrigger value="week" className="flex-1 data-[state=active]:bg-emerald-600">Week</TabsTrigger>
            <TabsTrigger value="month" className="flex-1 data-[state=active]:bg-emerald-600">Month</TabsTrigger>
            <TabsTrigger value="quarter" className="flex-1 data-[state=active]:bg-emerald-600">Quarter</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Personal Progress */}
        <Card className="bg-[#0f5132]/80 border-emerald-500/30 backdrop-blur-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Your Eco Score Progress</h2>
          </div>
          {isLoading ? (
            <Skeleton className="h-[200px] bg-[#1e4d3a]/40" />
          ) : personalData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={personalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis 
                  dataKey="date" 
                  stroke="#94a3b8"
                  style={{ fontSize: '12px' }}
                />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    color: '#fff'
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
            <div className="text-center py-8 text-emerald-200/60">
              <p>No data yet. Start tracking your eco activities!</p>
            </div>
          )}
        </Card>

        {/* Transport Breakdown */}
        {transportData.length > 0 && (
          <Card className="bg-[#0f5132]/80 border-emerald-500/30 backdrop-blur-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Transport Breakdown</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={transportData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <YAxis stroke="#94a3b8" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #10b981',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
                <Bar dataKey="walking" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="cycling" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="transit" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                <Bar dataKey="driving" fill="#f59e0b" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Carbon Savings */}
        <Card className="bg-gradient-to-br from-emerald-900/40 to-green-900/40 border-emerald-500/30 backdrop-blur-md p-6">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Total Carbon Saved</h2>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-5xl font-bold text-emerald-400">
              {totalCarbonSaved.toFixed(1)}
            </p>
            <span className="text-xl text-emerald-200/60">kg CO₂</span>
          </div>
          <p className="text-sm text-emerald-200/60 mt-2">
            Equivalent to planting{' '}
            <span className="font-semibold text-emerald-400">
              {Math.floor(totalCarbonSaved / 20)}
            </span>{' '}
            trees
          </p>
        </Card>

        {/* Global Comparison */}
        <Card className="bg-[#0f5132]/80 border-purple-500/20 backdrop-blur-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-white">Global Context</h2>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-emerald-200/60">Virginia Emissions</span>
                <span className="text-sm font-semibold text-amber-400">
                  {localEmissions[0]?.change_percentage > 0 ? '+' : ''}
                  {localEmissions[0]?.change_percentage?.toFixed(1) || '0.0'}%
                </span>
              </div>
              <div className="h-2 bg-[#1e4d3a] rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '60%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-emerald-200/60">Global Average</span>
                <span className="text-sm font-semibold text-red-400">
                  {globalEmissions[0]?.change_percentage > 0 ? '+' : ''}
                  {globalEmissions[0]?.change_percentage?.toFixed(1) || '1.2'}%
                </span>
              </div>
              <div className="h-2 bg-[#1e4d3a] rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full" style={{ width: '75%' }} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}