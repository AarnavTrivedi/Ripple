import React from 'react';
import { Card } from "@/components/ui/card";
import { Leaf, TrendingUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function EcoScoreCard({ score, trend }) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'from-emerald-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-amber-600';
    return 'from-orange-500 to-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/20">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <p className="text-sm text-gray-400 font-medium">Your Eco Score</p>
              </div>
              <div className="flex items-baseline gap-2">
                <motion.h1 
                  className={`text-6xl font-bold bg-gradient-to-br ${getScoreColor(score)} bg-clip-text text-transparent`}
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {score}
                </motion.h1>
                <span className="text-2xl text-gray-500 font-light">/100</span>
              </div>
            </div>
            
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${getScoreColor(score)} shadow-lg`}>
              <Leaf className="w-8 h-8 text-white" />
            </div>
          </div>

          {trend && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-semibold">{trend}%</span>
              <span className="text-gray-400">from yesterday</span>
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full bg-gradient-to-r ${getScoreColor(score)}`}
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}