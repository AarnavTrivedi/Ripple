import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Map, TrendingUp, Camera, User, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
    { name: "Map", url: createPageUrl("Map"), icon: Map },
    { name: "Analytics", url: createPageUrl("Analytics"), icon: TrendingUp },
    { name: "Scanner", url: createPageUrl("Scanner"), icon: Camera },
    { name: "Profile", url: createPageUrl("Profile"), icon: User },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style>{`
        :root {
          --forest-dark: #0a3d29;
          --forest-main: #0f5132;
          --moss-green: #2d5a3d;
          --emerald: #10b981;
          --pine: #1e4d3a;
          --bark: #3d3026;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
          50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
        }

        .plant-bg {
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(45, 90, 61, 0.12) 0%, transparent 50%),
            url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&q=80');
          background-size: cover, cover, cover;
          background-position: center;
          background-blend-mode: overlay;
        }

        .leaf-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-7 0-13 6-13 13 0 8 6 15 13 20 7-5 13-12 13-20 0-7-6-13-13-13z' fill='%2310b981' fill-opacity='0.03'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Nature Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a3d29] via-[#0f5132] to-[#1e4d3a] plant-bg" />
      <div className="fixed inset-0 leaf-pattern opacity-50" />
      <div className="fixed inset-0 bg-gradient-to-t from-[#0a3d29]/80 to-transparent" />

      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-2 h-2 bg-emerald-400/20 rounded-full blur-sm"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Vertical Sidebar - Right Edge */}
      <div className="fixed right-0 top-0 bottom-0 w-16 bg-gradient-to-b from-[#0f5132]/80 to-[#0a3d29]/80 backdrop-blur-md border-l border-emerald-500/20 z-40 flex items-center justify-center">
        <div className="transform -rotate-90 whitespace-nowrap">
          <p className="text-white text-xs uppercase tracking-[0.3em] font-light">
            Events Nearby
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative pb-28 pr-16">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-16 bg-[#0f5132]/95 backdrop-blur-xl border-t border-emerald-500/30 z-50">
        <div className="max-w-md mx-auto px-6 py-4">
          <div className="flex items-center justify-around relative">
            {navItems.slice(0, 2).map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className="relative flex flex-col items-center gap-1 transition-all duration-300"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-emerald-500/20 rounded-full blur-xl"
                    />
                  )}
                  <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50' 
                      : 'bg-[#1e4d3a]/50 hover:bg-[#1e4d3a]'
                  }`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-emerald-300' : 'text-gray-400'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* Large Central Action Button */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute left-1/2 -translate-x-1/2 -top-8"
            >
              <Link to={createPageUrl("Scanner")}>
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full blur-xl opacity-60"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.4, 0.7, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 via-emerald-600 to-[#0f5132] rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50 border-4 border-[#0f5132]">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                </div>
              </Link>
            </motion.div>

            {navItems.slice(2, 4).map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className="relative flex flex-col items-center gap-1 transition-all duration-300"
                >
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator2"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-emerald-500/20 rounded-full blur-xl"
                    />
                  )}
                  <div className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50' 
                      : 'bg-[#1e4d3a]/50 hover:bg-[#1e4d3a]'
                  }`}>
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-emerald-300' : 'text-gray-400'
                  }`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}