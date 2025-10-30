import { Card } from '@/components/ui/card';
import { Thermometer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TEMP_RANGES = [
  { label: 'Freezing', color: '#60a5fa', range: '≤32°F', icon: '❄️' },
  { label: 'Cold', color: '#93c5fd', range: '33-50°F', icon: '🥶' },
  { label: 'Cool', color: '#bfdbfe', range: '51-60°F', icon: '😌' },
  { label: 'Mild', color: '#86efac', range: '61-70°F', icon: '😊' },
  { label: 'Warm', color: '#fbbf24', range: '71-80°F', icon: '☀️' },
  { label: 'Hot', color: '#f97316', range: '81-95°F', icon: '🥵' },
  { label: 'Very Hot', color: '#dc2626', range: '≥96°F', icon: '🔥' },
];

export default function TemperatureLegend({ visible = true, onClose }) {
  if (!visible) return null;

  return (
    <Card className="absolute bottom-24 right-4 z-[1000] bg-white/95 backdrop-blur-xl border-gray-200 rounded-xl p-4 w-64 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Thermometer className="w-4 h-4 text-orange-600" />
          <h3 className="font-semibold text-sm text-gray-800">Temperature</h3>
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

      <div className="space-y-1.5 max-h-60 overflow-y-auto">
        {TEMP_RANGES.map((range) => (
          <div key={range.label} className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-md border-2 border-white shadow-sm flex items-center justify-center text-xs"
              style={{ backgroundColor: range.color }}
            >
              {range.icon}
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-gray-700">{range.label}</div>
              <div className="text-[10px] text-gray-500">{range.range}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-[10px] text-gray-600 leading-relaxed">
          Real-time temperature data with humidity, wind speed, and UV index information.
        </p>
      </div>
    </Card>
  );
}

