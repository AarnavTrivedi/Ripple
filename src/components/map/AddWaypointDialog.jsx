import React, { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

export default function AddWaypointDialog({ open, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: 37.5407,
    longitude: -77.4360,
    type: 'park',
    eco_rating: 80,
    is_user_created: true
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      try {
        const waypoints = JSON.parse(localStorage.getItem('ripple_waypoints') || '[]');
        const newWaypoint = {
          ...data,
          id: Date.now().toString(),
          created_date: new Date().toISOString()
        };
        waypoints.push(newWaypoint);
        localStorage.setItem('ripple_waypoints', JSON.stringify(waypoints));
        return newWaypoint;
      } catch (error) {
        console.error("Error creating waypoint:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waypoints'] });
      onClose();
      setFormData({
        name: '',
        description: '',
        latitude: 37.5407,
        longitude: -77.4360,
        type: 'park',
        eco_rating: 80,
        is_user_created: true
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0f5132] border-emerald-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Add Eco Spot
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name" className="text-white">Location Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-[#1e4d3a] border-emerald-500/30 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-[#1e4d3a] border-emerald-500/30 text-white"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="type" className="text-white">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger className="bg-[#1e4d3a] border-emerald-500/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1e4d3a] border-emerald-500/30 text-white">
                <SelectItem value="park">Park</SelectItem>
                <SelectItem value="recycling_center">Recycling Center</SelectItem>
                <SelectItem value="charging_station">Charging Station</SelectItem>
                <SelectItem value="bike_station">Bike Station</SelectItem>
                <SelectItem value="community_garden">Community Garden</SelectItem>
                <SelectItem value="water_refill">Water Refill</SelectItem>
                <SelectItem value="eco_store">Eco Store</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="latitude" className="text-white">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="longitude" className="text-white">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                className="bg-[#1e4d3a] border-emerald-500/30 text-white"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-br from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Adding...' : 'Add Eco Spot'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}