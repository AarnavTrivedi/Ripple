import { Card } from '@/components/ui/card';
import { Car, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRAFFIC_LEVELS = [
  { label: 'Low', color: '#10b981', range: '0-20%', icon: '🟢' },
  { label: 'Moderate', color: '#fbbf24', range: '21-40%', icon: '🟡' },
  { label: 'High', color: '#f97316', range: '41-70%', icon: '🟠' },
  { label: 'Very High', color: '#ef4444', range: '71-100%', icon: '🔴' },
];

export default function TrafficPollutionLegend({ visible = true, onClose }) {
  if (!visible) return null;

  return (
    <Card className="absolute bottom-24 left-4 z-[1000] bg-white/95 backdrop-blur-xl border-gray-200 rounded-xl p-4 w-64 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-orange-600" />
          <h3 className="font-semibold text-sm text-gray-800">Traffic Pollution</h3>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 p-0 hover:bg-gray-100"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {TRAFFIC_LEVELS.map((level) => (
          <div key={level.label} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md border-2 border-white shadow-sm flex items-center justify-center text-xs"
              style={{ backgroundColor: level.color }}
            >
              {level.icon}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-700">{level.label}</div>
              <div className="text-[10px] text-gray-500">{level.range}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-[10px] text-gray-600 leading-relaxed">
          <strong>Pollutants:</strong> CO₂, NO₂, PM2.5
          <br />
          Based on traffic density and real-time emissions data.
        </p>
      </div>
    </Card>
  );
}

