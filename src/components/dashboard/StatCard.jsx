import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatCard({ icon: Icon, label, value, unit, color = "emerald", index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gradient-to-br from-[#1e4d3a]/60 to-[#0f5132]/60 border-emerald-500/30 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <motion.div
              animate={{
                rotate: [0, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.3,
              }}
            >
              <Icon className="w-5 h-5 text-emerald-400" />
            </motion.div>
            <p className="text-xs text-emerald-200/60 font-medium uppercase tracking-wider">{label}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-white">{value}</p>
            {unit && <span className="text-sm text-emerald-200/60">{unit}</span>}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}