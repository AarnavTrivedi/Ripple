import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Map, TrendingUp, Camera, User } from "lucide-react";

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
    <div className="min-h-screen bg-[#0a3d29]">
      <style>{`
        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a3d29] via-[#0f5132] to-[#0a3d29] opacity-90" />

      {/* Main Content */}
      <main className="relative pb-20">
        {children}
      </main>

      {/* Clean Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f5132]/95 backdrop-blur-lg border-t border-emerald-500/10 z-50">
        <div className="max-w-lg mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {navItems.map((item) => {
              const isActive = location.pathname === item.url;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className="flex flex-col items-center gap-1 transition-all"
                >
                  <div className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-500 text-white' 
                      : 'text-emerald-200/60 hover:text-emerald-200'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-medium ${
                    isActive ? 'text-emerald-300' : 'text-emerald-200/50'
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