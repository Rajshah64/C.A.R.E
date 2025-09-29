"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, MapPin, Loader2 } from "lucide-react";
import { geocodeAddress } from "@/utils/geocoding";

interface EmergencyDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onSubmitAction: (data: EmergencyFormData) => void;
  emergency?: {
    id: string;
    title: string;
    description?: string;
    location: string;
    severity: string;
    status: string;
  };
}

export interface EmergencyFormData {
  title: string;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  type: string;
  severity: string;
  status: string;
}

export function EmergencyDialog({
  open,
  onOpenChangeAction,
  onSubmitAction,
  emergency,
}: EmergencyDialogProps) {
  const [formData, setFormData] = useState<EmergencyFormData>({
    title: emergency?.title || "",
    description: emergency?.description || "",
    location: emergency?.location || "",
    latitude: undefined,
    longitude: undefined,
    type: "general",
    severity: emergency?.severity || "medium",
    status: emergency?.status || "open",
  });
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  const handleGeocode = async () => {
    if (!formData.location.trim()) return;

    setGeocoding(true);
    try {
      const result = await geocodeAddress(formData.location);
      if (result) {
        setFormData((prev) => ({
          ...prev,
          latitude: result.latitude,
          longitude: result.longitude,
          location: result.formattedAddress, // Use the formatted address
        }));
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // If no coordinates, try to geocode first
      if (!formData.latitude || !formData.longitude) {
        const result = await geocodeAddress(formData.location);
        if (result) {
          formData.latitude = result.latitude;
          formData.longitude = result.longitude;
          formData.location = result.formattedAddress;
        }
      }

      await onSubmitAction(formData);
      onOpenChangeAction(false);
      // Reset form if creating new
      if (!emergency) {
        setFormData({
          title: "",
          description: "",
          location: "",
          latitude: undefined,
          longitude: undefined,
          severity: "medium",
          status: "open",
        });
      }
    } catch (error) {
      console.error("Error submitting emergency:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-[525px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {emergency ? "Edit Emergency" : "Create New Emergency"}
            </DialogTitle>
            <DialogDescription>
              {emergency
                ? "Update the emergency details below."
                : "Fill in the details for the new emergency incident."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Fire at Downtown Building"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Provide additional details about the emergency..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location *</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Gateway of India, Mumbai"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleGeocode}
                  disabled={geocoding || !formData.location.trim()}
                  title="Get coordinates from address"
                >
                  {geocoding ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formData.latitude && formData.longitude && (
                <p className="text-xs text-green-600">
                  ✓ Coordinates: {formData.latitude.toFixed(4)},{" "}
                  {formData.longitude.toFixed(4)}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Emergency Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select emergency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fire">Fire Emergency</SelectItem>
                  <SelectItem value="medical">Medical Emergency</SelectItem>
                  <SelectItem value="police">Police Emergency</SelectItem>
                  <SelectItem value="general">General Emergency</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Select the type of emergency. This helps auto-assign the most
                appropriate responder.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="severity">Severity *</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, severity: value })
                  }
                >
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChangeAction(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Saving..." : emergency ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
