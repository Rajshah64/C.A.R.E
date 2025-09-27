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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Phone, Mail, MapPin } from "lucide-react";
import { Responder } from "@/types/dashboard";

interface AssignResponderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emergencyId: string;
  emergencyTitle: string;
  assignedResponderIds: string[];
  responders: Responder[];
  onAssign: (responderId: string) => void;
  onUnassign: (responderId: string) => void;
}

export function AssignResponderDialog({
  open,
  onOpenChange,
  emergencyId,
  emergencyTitle,
  assignedResponderIds,
  responders,
  onAssign,
  onUnassign,
}: AssignResponderDialogProps) {
  const [selectedResponders, setSelectedResponders] =
    useState<string[]>(assignedResponderIds);
  const [loading, setLoading] = useState(false);

  const activeResponders = responders.filter((r) => r.isActive);
  const inactiveResponders = responders.filter((r) => !r.isActive);

  const handleResponderToggle = (responderId: string, checked: boolean) => {
    if (checked) {
      setSelectedResponders([...selectedResponders, responderId]);
    } else {
      setSelectedResponders(
        selectedResponders.filter((id) => id !== responderId)
      );
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Find newly assigned responders
      const toAssign = selectedResponders.filter(
        (id) => !assignedResponderIds.includes(id)
      );

      // Find unassigned responders
      const toUnassign = assignedResponderIds.filter(
        (id) => !selectedResponders.includes(id)
      );

      // Process assignments
      for (const responderId of toAssign) {
        await onAssign(responderId);
      }

      // Process unassignments
      for (const responderId of toUnassign) {
        await onUnassign(responderId);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error updating assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  const ResponderCard = ({ responder }: { responder: Responder }) => {
    const isAssigned = selectedResponders.includes(responder.id);

    return (
      <div
        className={`p-3 rounded-lg border ${
          isAssigned ? "border-blue-500 bg-blue-50" : "border-gray-200"
        } ${!responder.isActive ? "opacity-60" : ""}`}
      >
        <div className="flex items-start gap-3">
          <Checkbox
            id={responder.id}
            checked={isAssigned}
            onCheckedChange={(checked) =>
              handleResponderToggle(responder.id, checked as boolean)
            }
            disabled={!responder.isActive}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={responder.id}
                className="font-medium text-sm cursor-pointer"
              >
                {responder.name}
              </label>
              <Badge
                variant={responder.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {responder.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail className="h-3 w-3" />
                {responder.email}
              </div>

              {responder.phone && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <Phone className="h-3 w-3" />
                  {responder.phone}
                </div>
              )}

              {responder.location && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <MapPin className="h-3 w-3" />
                  {responder.location}
                </div>
              )}
            </div>

            {responder.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {responder.skills.map((skill, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Responders</DialogTitle>
          <DialogDescription>
            Select responders to assign to: <strong>{emergencyTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activeResponders.length > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Active Responders ({activeResponders.length})
                </h3>
                <div className="space-y-2">
                  {activeResponders.map((responder) => (
                    <ResponderCard key={responder.id} responder={responder} />
                  ))}
                </div>
              </div>
            )}

            {inactiveResponders.length > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-2 text-gray-500">
                  Inactive Responders ({inactiveResponders.length})
                </h3>
                <div className="space-y-2">
                  {inactiveResponders.map((responder) => (
                    <ResponderCard key={responder.id} responder={responder} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-gray-500">
              {selectedResponders.length} responder(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "Saving..." : "Save Assignments"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
