import React from 'react';
import { Card } from "@/components/ui/card";
import { Sparkles, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AISuggestion({ suggestion }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-500/30 overflow-hidden">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg shadow-purple-500/50">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-purple-300">AI Eco Tip</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                {suggestion || "Keep up the great work! Try walking instead of driving for short trips to boost your eco score."}
              </p>
              <div className="flex items-center gap-1 text-xs text-purple-400 font-medium">
                <span>Learn more</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}