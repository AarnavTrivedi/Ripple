import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { User, Bell, Award, LogOut, Mail } from "lucide-react";

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
    <div className="min-h-screen p-6 pt-8">
      {/* Header */}
      <div className="mb-8">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl font-bold text-white">
            {currentUser?.full_name?.[0] || 'E'}
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {currentUser?.full_name || 'Eco Warrior'}
        </h1>
        <p className="text-emerald-200/60 text-sm">{currentUser?.email}</p>
        
        {/* Eco Points */}
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
          <Award className="w-4 h-4 text-amber-400" />
          <span className="text-lg font-bold text-amber-400">
            {currentUser?.eco_points || 0}
          </span>
          <span className="text-sm text-white">Eco Points</span>
        </div>
      </div>

      {/* Newsletter */}
      <Card className="bg-white/15 backdrop-blur-md border-emerald-400/30 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-semibold text-white">Newsletter</h2>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <Label className="text-white font-medium">
              Virginia Environmental Updates
            </Label>
            <p className="text-sm text-emerald-200/60 mt-1">
              Weekly updates about local environmental news
            </p>
          </div>
          <Switch
            checked={currentUser?.newsletter_subscribed || false}
            onCheckedChange={handleNewsletterToggle}
          />
        </div>

        {currentUser?.newsletter_subscribed && newsletters.length > 0 && (
          <div className="mt-4 space-y-2">
            {newsletters.slice(0, 3).map((newsletter) => (
              <div key={newsletter.id} className="p-3 bg-white/10 backdrop-blur rounded-lg border border-emerald-400/20">
                <h4 className="text-sm font-medium text-white">{newsletter.title}</h4>
                <p className="text-xs text-emerald-200/70 mt-1">
                  {newsletter.location}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Settings */}
      <Card className="bg-white/15 backdrop-blur-md border-emerald-400/30 p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Bell className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Settings</h2>
        </div>
        
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start border-emerald-400/30 text-white hover:bg-white/10"
          >
            <Bell className="w-4 h-4 mr-3" />
            Notifications
          </Button>
          
          <Button
            variant="outline"
            className="w-full justify-start border-emerald-400/30 text-white hover:bg-white/10"
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
  );
}