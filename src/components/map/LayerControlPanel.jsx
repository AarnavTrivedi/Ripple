import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Layers, Wind, Leaf, Factory, X, Map as MapIcon } from 'lucide-react';

export default function LayerControlPanel({ onLayerToggle, onBaseMapChange, onClose }) {
  const [activeLayers, setActiveLayers] = useState({
    pm25: false,
    aqi: false,
    temperature: false,
    greenSpaces: false,
    traffic: false,
  });

  const [activeBaseMap, setActiveBaseMap] = useState('standard');

  const handleLayerToggle = (layerId) => {
    const newState = !activeLayers[layerId];
    setActiveLayers(prev => ({ ...prev, [layerId]: newState }));
    onLayerToggle?.(layerId, newState);
  };

  const handleBaseMapChange = (style) => {
    setActiveBaseMap(style);
    onBaseMapChange?.(style);
  };

  return (
    <Card className="absolute top-4 right-4 z-[1000] bg-white/10 backdrop-blur-xl border-emerald-400/15 rounded-2xl p-4 w-80 max-h-[80vh] overflow-y-auto shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="text-white font-semibold">Map Layers</h3>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Air Quality Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Wind className="w-4 h-4 text-blue-400" />
          <h4 className="text-white font-medium text-sm">Air Quality</h4>
        </div>
        
        <div className="space-y-3 pl-6">
          <div className="flex items-center justify-between">
            <Label className="text-white text-sm cursor-pointer" htmlFor="pm25">
              PM2.5 Heatmap
            </Label>
            <Switch
              id="pm25"
              checked={activeLayers.pm25}
              onCheckedChange={() => handleLayerToggle('pm25')}
            />
          </div>

          <div className="flex items-center justify-between opacity-50">
            <Label className="text-white text-sm">AQI Index</Label>
            <Switch
              disabled
              checked={activeLayers.aqi}
            />
          </div>

          <div className="flex items-center justify-between opacity-50">
            <Label className="text-white text-sm">Traffic Pollution</Label>
            <Switch
              disabled
              checked={activeLayers.traffic}
            />
          </div>
        </div>
      </div>

      {/* Environment Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-4 h-4 text-green-400" />
          <h4 className="text-white font-medium text-sm">Environment</h4>
        </div>
        
        <div className="space-y-3 pl-6">
          <div className="flex items-center justify-between">
            <Label className="text-white text-sm cursor-pointer" htmlFor="greenSpaces">
              Green Spaces
            </Label>
            <Switch
              id="greenSpaces"
              checked={activeLayers.greenSpaces}
              onCheckedChange={() => handleLayerToggle('greenSpaces')}
            />
          </div>

          <div className="flex items-center justify-between opacity-50">
            <Label className="text-white text-sm">Temperature</Label>
            <Switch
              disabled
              checked={activeLayers.temperature}
            />
          </div>
        </div>
      </div>

      {/* Infrastructure Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Factory className="w-4 h-4 text-purple-400" />
          <h4 className="text-white font-medium text-sm">Infrastructure</h4>
        </div>
        
        <div className="space-y-3 pl-6">
          <div className="flex items-center justify-between">
            <Label className="text-white text-sm cursor-pointer" htmlFor="evCharging">
              EV Charging Stations
            </Label>
            <Switch
              id="evCharging"
              checked={activeLayers.evCharging}
              onCheckedChange={() => handleLayerToggle('evCharging')}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-white text-sm cursor-pointer" htmlFor="publicTransit">
              Public Transit
            </Label>
            <Switch
              id="publicTransit"
              checked={activeLayers.publicTransit}
              onCheckedChange={() => handleLayerToggle('publicTransit')}
            />
          </div>
        </div>
      </div>

      {/* Base Map Selector */}
      <div className="pt-4 border-t border-emerald-400/20">
        <div className="flex items-center gap-2 mb-3">
          <MapIcon className="w-4 h-4 text-orange-400" />
          <h4 className="text-white font-medium text-sm">Base Map Style</h4>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'standard', label: 'Standard' },
            { id: 'satellite', label: 'Satellite' },
            { id: 'dark', label: 'Dark' }
          ].map(style => (
            <button
              key={style.id}
              onClick={() => handleBaseMapChange(style.id)}
              className={`px-3 py-2 border rounded-lg text-xs transition-all ${
                activeBaseMap === style.id
                  ? 'bg-emerald-500 border-emerald-400 text-white'
                  : 'bg-white/5 hover:bg-white/10 border-emerald-400/15 text-white'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-400/20 rounded-lg">
        <p className="text-emerald-300 text-xs font-medium mb-1">✨ Just Added!</p>
        <p className="text-emerald-200/60 text-[10px]">
          🌳 Green Spaces, ⚡ EV Charging, and 🚇 Public Transit layers are now live!
        </p>
      </div>
    </Card>
  );
}

