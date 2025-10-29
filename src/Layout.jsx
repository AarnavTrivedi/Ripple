import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Map, TrendingUp, Camera, User, MessageCircle } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", url: createPageUrl("Dashboard"), icon: Home },
    { name: "Map", url: createPageUrl("Map"), icon: Map },
    { name: "Analytics", url: createPageUrl("Analytics"), icon: TrendingUp },
    { name: "Scanner", url: createPageUrl("Scanner"), icon: Camera },
    { name: "Chat", url: createPageUrl("Chatbot"), icon: MessageCircle },
    { name: "Profile", url: createPageUrl("Profile"), icon: User },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#1a2f26]">
      <main className="relative pb-28">
        {children}
      </main>

      {/* Bottom Navigation - Glassmorphism */}
      <nav className="fixed bottom-6 left-6 right-6 z-50">
        <div className="bg-white/90 backdrop-blur-xl border border-white/20 rounded-[2rem] shadow-2xl px-2 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.url;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className="flex flex-col items-center gap-1 transition-all min-w-[55px]"
                >
                  <div className={`p-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#10D9A0] text-white shadow-lg shadow-emerald-500/50' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[9px] font-medium ${
                    isActive ? 'text-[#10D9A0]' : 'text-gray-400'
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