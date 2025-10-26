import React from "react";
import { Card } from "@/components/ui/card";
import { TrendingDown, TrendingUp, Globe, MapPin } from "lucide-react";

/**
 * EmissionsComparison Component
 * 
 * Displays county, national, and global emissions data with visual comparisons.
 * Designed to be integrated into Map page or Analytics page.
 * 
 * @param {Object} props
 * @param {Array} props.emissionData - Array of emission records from database
 * @param {string} props.currentLocation - User's current county/region name
 * @param {boolean} props.compact - If true, shows minimal view suitable for map overlay
 */
const EmissionsComparison = ({ 
  emissionData = [], 
  currentLocation = "Your County",
  compact = false 
}) => {
  // Parse and organize emission data
  const getLatestData = () => {
    if (!emissionData || emissionData.length === 0) {
      return {
        county: { value: 0, trend: 0, year: new Date().getFullYear() },
        national: { value: 0, trend: 0, year: new Date().getFullYear() },
        global: { value: 0, trend: 0, year: new Date().getFullYear() }
      };
    }

    // Group by region type
    const countyData = emissionData.filter(d => d.region_type === 'county');
    const nationalData = emissionData.filter(d => d.region_type === 'national');
    const globalData = emissionData.filter(d => d.region_type === 'global');

    // Get latest and previous year for trend calculation
    const getLatestAndTrend = (data) => {
      if (data.length === 0) return { value: 0, trend: 0, year: new Date().getFullYear() };
      
      const sorted = data.sort((a, b) => b.year - a.year);
      const latest = sorted[0];
      const previous = sorted[1];
      
      const trend = previous 
        ? ((latest.total_emissions - previous.total_emissions) / previous.total_emissions) * 100
        : 0;
      
      return {
        value: latest.total_emissions,
        trend: trend,
        year: latest.year
      };
    };

    return {
      county: getLatestAndTrend(countyData),
      national: getLatestAndTrend(nationalData),
      global: getLatestAndTrend(globalData)
    };
  };

  const data = getLatestData();

  // Calculate percentage difference from county to others
  const calculateDifference = (countyValue, compareValue) => {
    if (countyValue === 0 || compareValue === 0) return 0;
    return ((countyValue - compareValue) / compareValue) * 100;
  };

  const nationalDiff = calculateDifference(data.county.value, data.national.value);
  const globalDiff = calculateDifference(data.county.value, data.global.value);

  // Format large numbers
  const formatEmissions = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  // Compact view for map overlay
  if (compact) {
    return (
      <Card className="bg-[#0f5132]/95 backdrop-blur border-emerald-500/30 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold text-sm">Emissions</h3>
          <span className="text-emerald-200/60 text-xs">{data.county.year}</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-emerald-200/60 text-[10px] uppercase">Local</div>
            <div className="text-white font-bold text-sm">
              {formatEmissions(data.county.value)}
            </div>
            <div className={`text-[10px] flex items-center justify-center gap-0.5 ${
              data.county.trend > 0 ? 'text-red-400' : 'text-emerald-400'
            }`}>
              {data.county.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(data.county.trend).toFixed(1)}%
            </div>
          </div>

          <div>
            <div className="text-emerald-200/60 text-[10px] uppercase">USA</div>
            <div className="text-white font-bold text-sm">
              {formatEmissions(data.national.value)}
            </div>
            <div className={`text-[10px] ${
              nationalDiff < 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {nationalDiff < 0 ? '↓' : '↑'} {Math.abs(nationalDiff).toFixed(0)}%
            </div>
          </div>

          <div>
            <div className="text-emerald-200/60 text-[10px] uppercase">Global</div>
            <div className="text-white font-bold text-sm">
              {formatEmissions(data.global.value)}
            </div>
            <div className={`text-[10px] ${
              globalDiff < 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {globalDiff < 0 ? '↓' : '↑'} {Math.abs(globalDiff).toFixed(0)}%
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Full view for detailed analytics
  return (
    <Card className="bg-[#0f5132]/50 border-emerald-500/20 backdrop-blur-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Emissions Comparison</h2>
        <span className="text-emerald-200/60 text-sm">{data.county.year} Data</span>
      </div>

      {/* County Emissions */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white font-semibold">{currentLocation}</h3>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold text-white">
            {formatEmissions(data.county.value)}
          </span>
          <span className="text-emerald-200/60">tons CO₂</span>
        </div>
        <div className={`flex items-center gap-1 mt-1 ${
          data.county.trend > 0 ? 'text-red-400' : 'text-emerald-400'
        }`}>
          {data.county.trend > 0 ? (
            <>
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+{data.county.trend.toFixed(1)}% from last year</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4" />
              <span className="text-sm">{data.county.trend.toFixed(1)}% from last year</span>
            </>
          )}
        </div>
      </div>

      {/* National Comparison */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-medium">National Average (USA)</h3>
          <span className="text-2xl font-bold text-white">
            {formatEmissions(data.national.value)}
          </span>
        </div>
        
        <div className="h-2 bg-emerald-900/30 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all ${
              nationalDiff < 0 ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(Math.abs(nationalDiff), 100)}%` 
            }}
          />
        </div>
        
        <p className={`text-sm ${
          nationalDiff < 0 ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {nationalDiff < 0 
            ? `🎉 ${Math.abs(nationalDiff).toFixed(1)}% lower than national average`
            : `⚠️ ${nationalDiff.toFixed(1)}% higher than national average`
          }
        </p>
      </div>

      {/* Global Comparison */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" />
            <h3 className="text-white font-medium">Global Average</h3>
          </div>
          <span className="text-2xl font-bold text-white">
            {formatEmissions(data.global.value)}
          </span>
        </div>
        
        <div className="h-2 bg-emerald-900/30 rounded-full overflow-hidden mb-2">
          <div 
            className={`h-full transition-all ${
              globalDiff < 0 ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(Math.abs(globalDiff), 100)}%` 
            }}
          />
        </div>
        
        <p className={`text-sm ${
          globalDiff < 0 ? 'text-emerald-400' : 'text-red-400'
        }`}>
          {globalDiff < 0 
            ? `🌍 ${Math.abs(globalDiff).toFixed(1)}% lower than global average`
            : `🌍 ${globalDiff.toFixed(1)}% higher than global average`
          }
        </p>
      </div>

      {/* Action Items */}
      <div className="mt-6 pt-6 border-t border-emerald-500/20">
        <h3 className="text-white font-medium mb-3">How You Can Help</h3>
        <ul className="space-y-2 text-sm text-emerald-200/80">
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Use public transportation or cycle when possible</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Participate in local environmental initiatives</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Reduce energy consumption at home</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-400 mt-0.5">•</span>
            <span>Support renewable energy sources</span>
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default EmissionsComparison;

