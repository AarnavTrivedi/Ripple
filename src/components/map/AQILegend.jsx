import { Card } from '@/components/ui/card';
import { Wind, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// EPA AQI Categories - Official Standards
const AQI_CATEGORIES = [
  { label: 'Good', color: '#00e400', range: '0-50', icon: '😊', health: 'Air quality is excellent' },
  { label: 'Moderate', color: '#ffff00', range: '51-100', icon: '😐', health: 'Acceptable for most' },
  { label: 'Unhealthy for Sensitive', color: '#ff7e00', range: '101-150', icon: '😷', health: 'Sensitive groups may be affected' },
  { label: 'Unhealthy', color: '#ff0000', range: '151-200', icon: '😨', health: 'Everyone may experience effects' },
  { label: 'Very Unhealthy', color: '#8f3f97', range: '201-300', icon: '🚨', health: 'Health alert: everyone affected' },
  { label: 'Hazardous', color: '#7e0023', range: '301-500', icon: '☠️', health: 'Health warning' },
];

export default function AQILegend({ visible = true, onClose }) {
  if (!visible) return null;

  return (
    <Card className="absolute bottom-24 left-4 z-[1000] bg-white/95 backdrop-blur-xl border-gray-200 rounded-xl p-4 w-72 shadow-lg max-h-[70vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-blue-600" />
          <h3 className="font-semibold text-sm text-gray-800">Air Quality Index (AQI)</h3>
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
        {AQI_CATEGORIES.map((category) => (
          <div key={category.label} className="flex items-start gap-2">
            <div
              className="w-7 h-7 rounded-md border-2 border-white shadow-sm flex items-center justify-center text-sm flex-shrink-0"
              style={{ 
                backgroundColor: category.color,
                color: ['Good', 'Moderate', 'Unhealthy for Sensitive'].includes(category.label) ? '#000' : '#fff'
              }}
            >
              {category.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-1">
                <div className="text-xs font-semibold text-gray-700">{category.label}</div>
                <div className="text-[10px] text-gray-500 font-mono">{category.range}</div>
              </div>
              <div className="text-[10px] text-gray-600 leading-tight mt-0.5">{category.health}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-[10px] text-gray-600 leading-relaxed">
          <strong>Source:</strong> EPA Air Quality Index
          <br />
          <strong>Primary Pollutant:</strong> PM2.5 (Particulate Matter)
          <br />
          Data from real-time monitoring stations.
        </p>
      </div>
    </Card>
  );
}

