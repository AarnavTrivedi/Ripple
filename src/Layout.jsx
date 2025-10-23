import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Map, TrendingUp, Camera, User, Leaf } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950 text-white">
      <style>{`
        :root {
          --emerald-400: #34d399;
          --emerald-500: #10b981;
          --emerald-600: #059669;
          --emerald-700: #047857;
          --slate-900: #0f172a;
          --slate-800: #1e293b;
        }
      `}</style>

      {/* Main Content */}
      <main className="pb-24">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/20 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className="relative flex flex-col items-center gap-1 transition-all duration-300"
                >
                  {/* Glow effect for active item */}
                  {isActive && (
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-12 h-12 bg-emerald-500/20 rounded-full blur-xl" />
                  )}
                  
                  <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/50' 
                      : 'bg-slate-800/50 hover:bg-slate-800'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  
                  <span className={`text-xs font-medium transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-gray-400'
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