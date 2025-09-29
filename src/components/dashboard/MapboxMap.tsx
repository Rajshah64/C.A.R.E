"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Emergency, Responder } from "@/types/dashboard";

interface MapboxMapProps {
  emergencies: Emergency[];
  responders: Responder[];
  selectedEmergency: Emergency | null;
  onEmergencySelect: (emergency: Emergency) => void;
  onResponderSelect: (responder: Responder) => void;
}

export function MapboxMap({
  emergencies,
  responders,
  selectedEmergency,
  onEmergencySelect,
  onResponderSelect,
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return; // Initialize map only once

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      console.error("Mapbox token not found");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [72.8485, 19.1248], // Mumbai, India coordinates
      zoom: 10,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });
  }, []);

  // Add emergency markers
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    const markers = document.querySelectorAll(
      ".emergency-marker, .responder-marker"
    );
    markers.forEach((marker) => marker.remove());

    // Add emergency markers
    emergencies.forEach((emergency) => {
      // Parse location for coordinates using lat/long if available
      const coords = parseLocation(
        emergency.location,
        emergency.latitude,
        emergency.longitude
      );

      const markerEl = document.createElement("div");
      markerEl.className = "emergency-marker";
      markerEl.style.width = "30px";
      markerEl.style.height = "30px";
      markerEl.style.borderRadius = "50%";
      markerEl.style.backgroundColor = getSeverityColor(emergency.severity);
      markerEl.style.border = "3px solid white";
      markerEl.style.cursor = "pointer";
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.fontSize = "16px";
      markerEl.innerHTML = "🚨";

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(coords)
        .addTo(map.current!);

      markerEl.addEventListener("click", () => {
        onEmergencySelect(emergency);
      });
    });

    // Add responder markers
    responders.forEach((responder) => {
      if (!responder.location && !responder.latitude && !responder.longitude)
        return;

      const coords = parseLocation(
        responder.location || "",
        responder.latitude,
        responder.longitude
      );

      const markerEl = document.createElement("div");
      markerEl.className = "responder-marker";
      markerEl.style.width = "25px";
      markerEl.style.height = "25px";
      markerEl.style.borderRadius = "50%";
      markerEl.style.backgroundColor = responder.isActive
        ? "#10B981"
        : "#EF4444";
      markerEl.style.border = "2px solid white";
      markerEl.style.cursor = "pointer";
      markerEl.style.display = "flex";
      markerEl.style.alignItems = "center";
      markerEl.style.justifyContent = "center";
      markerEl.style.fontSize = "12px";
      markerEl.innerHTML = "👤";

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat(coords)
        .addTo(map.current!);

      markerEl.addEventListener("click", () => {
        onResponderSelect(responder);
      });
    });
  }, [
    emergencies,
    responders,
    mapLoaded,
    onEmergencySelect,
    onResponderSelect,
  ]);

  const parseLocation = (
    location: string,
    latitude?: number,
    longitude?: number
  ): [number, number] => {
    // Use provided lat/long if available
    if (latitude && longitude) {
      return [longitude, latitude]; // [lng, lat] for Mapbox
    }

    // Try to parse "lat,lon" format from location string
    const coords = location.split(",").map((coord) => parseFloat(coord.trim()));
    if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      return [coords[1], coords[0]]; // [lng, lat] for Mapbox
    }

    // Fallback to random coordinates around Mumbai for demo
    return [
      72.8485 + (Math.random() - 0.5) * 0.1,
      19.1248 + (Math.random() - 0.5) * 0.1,
    ];
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  return (
    <div className="h-full w-full">
      <div ref={mapContainer} className="h-full w-full" />

      {/* Legend - Positioned to avoid header overlap */}
      <div className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-3 z-10 max-w-48">
        <h3 className="font-semibold text-sm mb-2">Legend</h3>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-xs">High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-xs">Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-xs">Low Severity</span>
          </div>
          <div className="w-full my-1.5 border-t"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-xs">Active Responder</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-xs">Inactive Responder</span>
          </div>
        </div>
      </div>

      {/* Stats Overlay - Positioned to avoid bottom panel overlap */}
      <div className="absolute bottom-24 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500">Active Incidents</p>
            <p className="text-xl font-bold">
              {
                emergencies.filter(
                  (e) => e.status !== "closed" && e.status !== "resolved"
                ).length
              }
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Active Responders</p>
            <p className="text-xl font-bold">
              {responders.filter((r) => r.isActive).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
