import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MapPin, Star, Navigation } from "lucide-react";
import { motion } from "framer-motion";

export default function WaypointDetails({ waypoint, onClose }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="absolute bottom-0 left-0 right-0 z-[1000] p-4"
    >
      <Card className="bg-slate-900/98 backdrop-blur-xl border-emerald-500/30">
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg shadow-emerald-500/50">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{waypoint.name}</h3>
                <p className="text-sm text-gray-400 capitalize">
                  {waypoint.type.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
              className="hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {waypoint.description && (
            <p className="text-sm text-gray-300 mb-4">{waypoint.description}</p>
          )}

          {waypoint.eco_rating && (
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-gray-300">
                Eco Rating: {waypoint.eco_rating}/100
              </span>
            </div>
          )}

          <Button
            className="w-full bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 gap-2"
          >
            <Navigation className="w-4 h-4" />
            Get Directions
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}