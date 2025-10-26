
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
    <div className="min-h-screen relative overflow-hidden font-['DM_Sans',system-ui,-apple-system,BlinkMacSystemFont,'Segoe_UI',Arial,sans-serif]">
      <style>{`
        /* DM Sans - Distinctive geometric with eco-friendly character */
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        
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

      {/* Nature-Themed Emerald Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a3d29] via-[#0f5132] to-[#0a3d29] plant-bg" />
      <div className="fixed inset-0 leaf-pattern opacity-40" />
      <div className="fixed inset-0 bg-gradient-to-t from-[#0a3d29]/60 to-transparent" />

      {/* Main Content - Full Width (Sidebar Removed!) */}
      <main className="relative pb-28">
        {children}
      </main>

      {/* Modern Bottom Navigation - 2025 Best Practices */}
      <nav className="fixed bottom-0 left-0 right-0 z-50">
        {/* Floating Pill Container with Blur */}
        <div className="mx-4 mb-safe-4 pb-4">
          <div className="max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-slate-200/50 px-2 py-3">
            <div className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.url}
                    className="relative flex flex-col items-center gap-1 px-4 py-2 min-w-[64px] transition-all duration-200 group"
                  >
                    {/* Modern Pill-Shaped Active State */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl transition-all duration-200" />
                    )}
                    
                    {/* Icon with proper sizing (24×24px - iOS/Android standard) */}
                    <div className="relative z-10">
                      <Icon 
                        className={`w-6 h-6 transition-all duration-200 ${
                          isActive 
                            ? 'text-emerald-600 scale-105' 
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`} 
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                    </div>
                    
                    {/* Label - Only show on active (modern pattern) */}
                    {isActive && (
                      <span className="relative z-10 text-[11px] font-semibold text-emerald-700 tracking-tight animate-in fade-in slide-in-from-bottom-1 duration-200">
                        {item.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
