"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertTriangle, Users, Activity } from "lucide-react";
import { Emergency, Responder } from "@/types/dashboard";

interface MapPanelProps {
  emergencies: Emergency[];
  responders: Responder[];
  selectedEmergency: Emergency | null;
  onEmergencySelect: (emergency: Emergency) => void;
  onResponderSelect: (responder: Responder) => void;
}

export function MapPanel({
  emergencies,
  responders,
  selectedEmergency,
  onEmergencySelect,
  onResponderSelect,
}: MapPanelProps) {
  const [selectedResponder, setSelectedResponder] = useState<Responder | null>(
    null
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "text-red-600";
      case "medium":
        return "text-amber-500";
      case "low":
        return "text-green-500";
      default:
        return "text-gray-500";
    }
  };

  const handleResponderClick = (responder: Responder) => {
    setSelectedResponder(responder);
    onResponderSelect(responder);
  };

  // Since we don't have actual map coordinates, we'll create a placeholder map view
  return (
    <Card className="h-full relative bg-gray-100">
      {/* Map Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-4">
          <MapPin className="h-16 w-16 text-gray-400 mx-auto" />
          <div>
            <p className="text-lg font-medium text-gray-600">
              Interactive Map View
            </p>
            <p className="text-sm text-gray-500">
              Map integration requires Mapbox API token
            </p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <h3 className="font-semibold text-sm mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-xs">High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span className="text-xs">Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-green-500" />
            <span className="text-xs">Low Severity</span>
          </div>
          <div className="w-full my-2 border-t"></div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="text-xs">Active Responder</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-red-600" />
            <span className="text-xs">Inactive Responder</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-10">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Active Incidents</p>
            <p className="text-2xl font-bold">
              {
                emergencies.filter(
                  (e) => e.status !== "closed" && e.status !== "resolved"
                ).length
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active Responders</p>
            <p className="text-2xl font-bold">
              {responders.filter((r) => r.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Markers (Simulated) */}
      <div className="absolute inset-0 p-8">
        <div className="relative h-full">
          {emergencies.map((emergency, index) => {
            // Simulate random positions for demo
            const top = `${Math.random() * 70 + 10}%`;
            const left = `${Math.random() * 70 + 10}%`;

            return (
              <div
                key={emergency.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                  selectedEmergency?.id === emergency.id
                    ? "scale-125 z-20"
                    : "hover:scale-110 z-10"
                }`}
                style={{ top, left }}
                onClick={() => onEmergencySelect(emergency)}
              >
                <div className="relative">
                  <AlertTriangle
                    className={`h-6 w-6 ${getSeverityColor(
                      emergency.severity
                    )} drop-shadow-md`}
                  />
                  {selectedEmergency?.id === emergency.id && (
                    <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 w-48 z-30">
                      <p className="font-semibold text-sm truncate">
                        {emergency.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {emergency.location}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {emergency.status}
                        </Badge>
                        {emergency.responders &&
                          emergency.responders.length > 0 && (
                            <span className="text-xs text-gray-500 flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {emergency.responders.length}
                            </span>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Responder Markers (Simulated) */}
          {responders.map((responder, index) => {
            // Simulate random positions for demo
            const top = `${Math.random() * 70 + 10}%`;
            const left = `${Math.random() * 70 + 10}%`;

            return (
              <div
                key={responder.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${
                  selectedResponder?.id === responder.id
                    ? "scale-125 z-20"
                    : "hover:scale-110 z-10"
                }`}
                style={{ top, left }}
                onClick={() => handleResponderClick(responder)}
              >
                <div className="relative">
                  <Activity
                    className={`h-5 w-5 ${
                      responder.isActive ? "text-green-600" : "text-red-600"
                    } drop-shadow-md`}
                  />
                  {selectedResponder?.id === responder.id && (
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 w-48 z-30">
                      <p className="font-semibold text-sm">{responder.name}</p>
                      <p className="text-xs text-gray-600">{responder.email}</p>
                      {responder.phone && (
                        <p className="text-xs text-gray-600">
                          {responder.phone}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {responder.skills.slice(0, 3).map((skill, idx) => (
                          <Badge
                            key={idx}
                            variant="secondary"
                            className="text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
