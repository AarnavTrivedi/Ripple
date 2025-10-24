import React from 'react';
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Scan, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function QuickActions({ onAction }) {
  const actions = [
    { icon: MapPin, label: "Find Eco Spots", color: "emerald", action: "map" },
    { icon: Plus, label: "Add Location", color: "blue", action: "add" },
    { icon: Scan, label: "AR Scanner", color: "purple", action: "scan" },
    { icon: Award, label: "Challenges", color: "amber", action: "challenges" }
  ];

  const colorClasses = {
    emerald: "from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700",
    blue: "from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700",
    purple: "from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700",
    amber: "from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Button
            onClick={() => onAction(action.action)}
            className={`w-full h-24 bg-gradient-to-br ${colorClasses[action.color]} shadow-lg hover:shadow-xl transition-all duration-300 border-0 flex flex-col items-center justify-center gap-2`}
          >
            <action.icon className="w-6 h-6" />
            <span className="text-sm font-semibold">{action.label}</span>
          </Button>
        </motion.div>
      ))}
    </div>
  );
}