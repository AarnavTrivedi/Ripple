import React from 'react';
import { motion } from "framer-motion";
import { Leaf, Sparkles } from "lucide-react";

export default function CircularScore({ score }) {
  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center mb-8">
      {/* Outer glow */}
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 blur-2xl"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main circle container */}
      <div className="relative w-44 h-44 bg-gradient-to-br from-[#0f5132] to-[#1e4d3a] rounded-full shadow-2xl border-4 border-emerald-500/30 flex items-center justify-center">
        {/* SVG Progress Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="88"
            cy="88"
            r="70"
            fill="none"
            stroke="rgba(16, 185, 129, 0.1)"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <motion.circle
            cx="88"
            cy="88"
            r="70"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 2, ease: "easeOut" }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
          </defs>
        </svg>

        {/* Score content */}
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                rotate: [0, 5, 0, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Leaf className="w-6 h-6 text-emerald-400 mb-1" />
            </motion.div>
            <motion.p
              className="text-6xl font-bold bg-gradient-to-br from-white via-emerald-100 to-emerald-300 bg-clip-text text-transparent"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {score}
            </motion.p>
            <p className="text-xs text-emerald-300 uppercase tracking-wider mt-1">Eco Score</p>
          </motion.div>

          {/* Sparkle decorations */}
          <motion.div
            className="absolute -top-2 -right-2"
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        </div>

        {/* Decorative dots */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 bg-emerald-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: '-3px',
              marginTop: '-3px',
            }}
            animate={{
              x: Math.cos((i / 8) * 2 * Math.PI) * 75,
              y: Math.sin((i / 8) * 2 * Math.PI) * 75,
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </div>
    </div>
  );
}