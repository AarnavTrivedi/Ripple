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
    <div className="min-h-screen relative overflow-hidden">
      <style>{`
        .plant-bg {
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.06) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(45, 90, 61, 0.08) 0%, transparent 50%),
            url('https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=1200&q=80');
          background-size: cover;
          background-position: center;
          background-blend-mode: overlay;
        }

        .leaf-pattern {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-7 0-13 6-13 13 0 8 6 15 13 20 7-5 13-12 13-20 0-7-6-13-13-13z' fill='%2310b981' fill-opacity='0.02'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Nature Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a3d29] via-[#0f5132] to-[#0a3d29] plant-bg" />
      <div className="fixed inset-0 leaf-pattern opacity-40" />
      <div className="fixed inset-0 bg-gradient-to-t from-[#0a3d29]/60 to-transparent" />

      {/* Vertical Sidebar - Right Edge */}
      <div className="fixed right-0 top-0 bottom-0 w-12 bg-gradient-to-b from-[#0f5132]/60 to-[#0a3d29]/60 backdrop-blur-sm border-l border-emerald-500/10 z-40 flex items-center justify-center">
        <div className="transform -rotate-90 whitespace-nowrap">
          <p className="text-white/60 text-[10px] uppercase tracking-[0.4em] font-light">
            Events
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative pb-24 pr-12">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-12 bg-[#0f5132]/90 backdrop-blur-xl border-t border-emerald-500/20 z-50">
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
                  <div className={`p-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-emerald-500/90 shadow-lg shadow-emerald-500/30' 
                      : 'text-emerald-200/50 hover:text-emerald-200/80'
                  }`}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                  </div>
                  <span className={`text-[9px] font-medium ${
                    isActive ? 'text-emerald-300' : 'text-emerald-200/40'
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