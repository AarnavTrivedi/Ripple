import { Card } from '@/components/ui/card';

const AQI_CATEGORIES = [
  { range: '0-12', label: 'Good', color: '#00e400' },
  { range: '12-35', label: 'Moderate', color: '#ffff00' },
  { range: '35-55', label: 'Unhealthy for Sensitive', color: '#ff7e00' },
  { range: '55-150', label: 'Unhealthy', color: '#ff0000' },
  { range: '150-250', label: 'Very Unhealthy', color: '#8f3f97' },
  { range: '250+', label: 'Hazardous', color: '#7e0023' },
];

export default function AirQualityLegend({ parameter = 'PM2.5', visible = true }) {
  if (!visible) return null;

  return (
    <Card className="absolute bottom-24 left-4 z-[1000] bg-white/10 backdrop-blur-xl border-emerald-400/15 rounded-2xl p-4 w-64 shadow-lg">
      <h4 className="text-white font-semibold text-sm mb-3">{parameter} Levels (μg/m³)</h4>
      <div className="space-y-2">
        {AQI_CATEGORIES.map((category, index) => (
          <div key={index} className="flex items-center gap-3">
            <div 
              className="w-8 h-4 rounded flex-shrink-0"
              style={{ backgroundColor: category.color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-white truncate">{category.label}</span>
                <span className="text-xs text-emerald-200/60 whitespace-nowrap">{category.range}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t border-emerald-400/20">
        <p className="text-[10px] text-emerald-200/60">
          Data from OpenAQ • Updated every 15min
        </p>
      </div>
    </Card>
  );
}

