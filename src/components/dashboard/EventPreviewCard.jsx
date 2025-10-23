import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users, ChevronRight } from "lucide-react";

export default function EventPreviewCard({ event, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-[#1e4d3a]/80 to-[#0f5132]/80 border-emerald-500/30 backdrop-blur-md hover:border-emerald-400/50 transition-all duration-300 group cursor-pointer">
        {/* Animated wave background */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 200 60" className="w-full h-full">
            <motion.path
              d="M0 30 Q 25 10, 50 30 T 100 30 T 150 30 T 200 30"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              className="text-emerald-400"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
        </div>

        <div className="relative p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                {event.title}
              </h3>
              <p className="text-sm text-emerald-200/70 line-clamp-2">
                {event.description}
              </p>
            </div>
            <motion.div
              className="text-emerald-400"
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ChevronRight className="w-5 h-5" />
            </motion.div>
          </div>

          <div className="flex items-center gap-4 text-xs text-emerald-200/60">
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{event.distance}</span>
            </div>
            {event.points && (
              <div className="flex items-center gap-1 text-yellow-400">
                <Users className="w-3.5 h-3.5" />
                <span>+{event.points} pts</span>
              </div>
            )}
          </div>

          {/* Glow effect on hover */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        </div>
      </Card>
    </motion.div>
  );
}