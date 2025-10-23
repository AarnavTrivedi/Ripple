import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
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
    latitude: 37.7749,
    longitude: -122.4194,
    type: 'park',
    eco_rating: 80,
    is_user_created: true
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.EcoWaypoint.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waypoints'] });
      onClose();
      setFormData({
        name: '',
        description: '',
        latitude: 37.7749,
        longitude: -122.4194,
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
      <DialogContent className="bg-slate-900 border-emerald-500/30 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Add Eco Spot
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label htmlFor="name">Location Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 text-white">
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
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={formData.latitude}
                onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value)})}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
            <div>
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value)})}
                className="bg-slate-800 border-slate-700 text-white"
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