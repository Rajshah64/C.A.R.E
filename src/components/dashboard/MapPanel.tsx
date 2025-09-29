"use client";

import { MapboxMap } from "./MapboxMap";
import { Emergency, Responder } from "@/types/dashboard";

interface MapPanelProps {
  emergencies: Emergency[];
  responders: Responder[];
  selectedEmergency: Emergency | null;
  onEmergencySelectAction: (emergency: Emergency) => void;
  onResponderSelectAction: (responder: Responder) => void;
}

export function MapPanel({
  emergencies,
  responders,
  selectedEmergency,
  onEmergencySelectAction,
  onResponderSelectAction,
}: MapPanelProps) {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!mapboxToken) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 border rounded-lg">
        <div className="text-center space-y-4 p-8">
          <div className="text-6xl">🗺️</div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Interactive Map View
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Add your Mapbox token to enable real-time mapping
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-medium">
                Setup Instructions:
              </p>
              <p className="text-xs text-blue-700 mt-1">
                1. Get free token at{" "}
                <span className="font-mono">mapbox.com</span>
              </p>
              <p className="text-xs text-blue-700">
                2. Add to <span className="font-mono">.env.local</span>:
              </p>
              <p className="text-xs text-blue-600 font-mono mt-1">
                NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token_here
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MapboxMap
      emergencies={emergencies}
      responders={responders}
      selectedEmergency={selectedEmergency}
      onEmergencySelect={onEmergencySelectAction}
      onResponderSelect={onResponderSelectAction}
    />
  );
}
