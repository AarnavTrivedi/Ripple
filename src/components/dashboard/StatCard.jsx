import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, unit, color = "emerald", index = 0 }) {
  const colorClasses = {
    emerald: "from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/20",
    blue: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20",
    purple: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/20",
    amber: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`bg-gradient-to-br ${colorClasses[color]} border backdrop-blur-sm`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Icon className="w-5 h-5" />
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold">{value}</p>
            {unit && <span className="text-sm text-gray-400">{unit}</span>}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}