
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, Bell, Settings, Award, LogOut, Mail, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Profile() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await base44.auth.me();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, []);

  const { data: newsletters } = useQuery({
    queryKey: ['newsletters'],
    queryFn: () => base44.entities.Newsletter.list('-publish_date', 5),
    initialData: [],
  });

  const updateUserMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: (updatedUser) => {
      setCurrentUser(updatedUser);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const handleNewsletterToggle = (value) => {
    updateUserMutation.mutate({ newsletter_subscribed: value });
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="relative px-6 py-12 border-b border-emerald-500/20">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10" />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative flex flex-col items-center"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/50 mb-4 border-4 border-[#0f5132]">
            <span className="text-4xl font-bold text-white">
              {currentUser?.full_name?.[0] || 'E'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            {currentUser?.full_name || 'Eco Warrior'}
          </h1>
          <p className="text-sm text-emerald-200/60">{currentUser?.email}</p>
          
          {/* Eco Points */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <span className="text-lg font-bold text-amber-400">
                {currentUser?.eco_points || 0}
              </span>
              <span className="text-sm text-white">Eco Points</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6 space-y-4">
        {/* Newsletter Section */}
        <Card className="bg-[#0f5132]/80 border-emerald-500/30 backdrop-blur-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Newsletter Subscription</h2>
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label htmlFor="newsletter" className="text-white font-medium">
                Local Environmental Updates
              </Label>
              <p className="text-sm text-gray-400 mt-1">
                Receive weekly updates about local environmental news
              </p>
            </div>
            <Switch
              id="newsletter"
              checked={currentUser?.newsletter_subscribed || false}
              onCheckedChange={handleNewsletterToggle}
            />
          </div>

          {currentUser?.newsletter_subscribed && newsletters.length > 0 && (
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Recent Updates</h3>
              {newsletters.map((newsletter, index) => (
                <motion.div
                  key={newsletter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-slate-800 rounded-lg border border-slate-700"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-sm font-medium text-white">{newsletter.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {newsletter.location} • {newsletter.category.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* Settings */}
        <Card className="bg-slate-900/95 border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Settings</h2>
          </div>
          
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start border-slate-700 text-gray-300 hover:bg-slate-800"
            >
              <Bell className="w-4 h-4 mr-3" />
              Notification Preferences
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start border-slate-700 text-gray-300 hover:bg-slate-800"
            >
              <User className="w-4 h-4 mr-3" />
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
