import React from 'react';
import { motion } from "framer-motion";
import { Circle, MapPin } from "lucide-react";

export default function EventsHeader() {
  return (
    <div className="mb-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-2"
      >
        {/* Active indicator */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="relative"
        >
          <Circle className="w-3 h-3 text-emerald-400 fill-emerald-400" />
          <motion.div
            className="absolute inset-0 rounded-full bg-emerald-400"
            animate={{
              scale: [1, 2, 2],
              opacity: [0.8, 0, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>

        <h1 className="text-3xl font-bold">
          <span className="text-emerald-300">New</span>
          <span className="text-white"> Events in the Area</span>
        </h1>
      </motion.div>

      <div className="flex items-center gap-2 text-sm text-emerald-200/60">
        <MapPin className="w-4 h-4" />
        <span>Within 5 miles of your location</span>
      </div>
    </div>
  );
}