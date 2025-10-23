
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Camera, Leaf, AlertTriangle, Info, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Scanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMode, setScanMode] = useState('green'); // 'green' or 'hazard'
  const [detectedItems, setDetectedItems] = useState([]);

  const startScan = () => {
    setIsScanning(true);
    // Simulate AR detection
    setTimeout(() => {
      if (scanMode === 'green') {
        setDetectedItems([
          { id: 1, type: 'green', name: 'Community Garden', distance: '120m', points: 50 },
          { id: 2, type: 'green', name: 'Tree Planting Event', distance: '350m', points: 100 },
        ]);
      } else {
        setDetectedItems([
          { id: 1, type: 'hazard', name: 'High Traffic Area', distance: '80m', level: 65 },
          { id: 2, type: 'hazard', name: 'Industrial Zone', distance: '220m', level: 45 },
        ]);
      }
    }, 1500);
  };

  const stopScan = () => {
    setIsScanning(false);
    setDetectedItems([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="relative bg-[#0f5132]/95 backdrop-blur-xl border-b border-emerald-500/30 px-6 py-6 z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent" />
        <div className="relative flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/50">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">AR Scanner</h1>
            <p className="text-sm text-emerald-200/60">Discover eco actions & hazards</p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setScanMode('green')}
            className={`${
              scanMode === 'green'
                ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                : 'bg-[#1e4d3a]/60 text-gray-300'
            }`}
          >
            <Leaf className="w-4 h-4 mr-2" />
            Green Actions
          </Button>
          <Button
            onClick={() => setScanMode('hazard')}
            className={`${
              scanMode === 'hazard'
                ? 'bg-gradient-to-br from-amber-500 to-orange-600'
                : 'bg-[#1e4d3a]/60 text-gray-300'
            }`}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Hazards
          </Button>
        </div>
      </div>

      {/* AR View */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
        {/* Camera simulation */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full h-full">
            {/* Scanning grid overlay */}
            {isScanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(${scanMode === 'green' ? '#10b981' : '#f59e0b'} 1px, transparent 1px),
                                   linear-gradient(90deg, ${scanMode === 'green' ? '#10b981' : '#f59e0b'} 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
              />
            )}

            {/* Detected Items */}
            <AnimatePresence>
              {detectedItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="absolute"
                  style={{
                    left: `${30 + index * 40}%`,
                    top: `${40 + index * 15}%`,
                  }}
                >
                  <Card className={`${
                    item.type === 'green'
                      ? 'bg-emerald-900/90 border-emerald-500/50'
                      : 'bg-amber-900/90 border-amber-500/50'
                  } backdrop-blur-xl p-4 min-w-[200px]`}>
                    <div className="flex items-start gap-3">
                      {item.type === 'green' ? (
                        <Leaf className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-amber-400" />
                      )}
                      <div>
                        <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-300 mt-1">{item.distance} away</p>
                        {item.points && (
                          <p className="text-xs text-emerald-400 mt-1">+{item.points} points</p>
                        )}
                        {item.level && (
                          <p className="text-xs text-amber-400 mt-1">Hazard: {item.level}/100</p>
                        )}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Center crosshair */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-16 h-16 border-2 rounded-full ${
                scanMode === 'green' ? 'border-emerald-400' : 'border-amber-400'
              } opacity-50`}>
                <div className="absolute inset-2 border-2 border-white rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Scan Button */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center">
          <Button
            size="lg"
            onClick={isScanning ? stopScan : startScan}
            className={`w-20 h-20 rounded-full ${
              isScanning
                ? 'bg-red-600 hover:bg-red-700'
                : scanMode === 'green'
                ? 'bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                : 'bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
            } shadow-2xl ${isScanning ? 'shadow-red-500/50' : scanMode === 'green' ? 'shadow-emerald-500/50' : 'shadow-amber-500/50'}`}
          >
            {isScanning ? (
              <div className="w-6 h-6 bg-white rounded" />
            ) : (
              <Sparkles className="w-8 h-8" />
            )}
          </Button>
        </div>

        {/* Info Card */}
        <Card className="absolute top-4 left-4 right-4 bg-slate-900/95 backdrop-blur-xl border-emerald-500/20 p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-white font-medium mb-1">
                {scanMode === 'green' ? 'Green Action Mode' : 'Hazard Detection Mode'}
              </p>
              <p className="text-xs text-gray-400">
                {scanMode === 'green'
                  ? 'Point your camera to discover eco-friendly activities nearby'
                  : 'Scan your surroundings to identify environmental hazard zones'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
