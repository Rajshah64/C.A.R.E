"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  Users,
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Emergency, Responder } from "@/types/dashboard";

interface BottomPanelProps {
  emergencies: Emergency[];
  responders: Responder[];
}

export function BottomPanel({ emergencies, responders }: BottomPanelProps) {
  // Safety check - ensure emergencies is an array
  const safeEmergencies = Array.isArray(emergencies) ? emergencies : [];
  const safeResponders = Array.isArray(responders) ? responders : [];

  // Calculate metrics
  const totalIncidents = safeEmergencies.length;
  const openIncidents = safeEmergencies.filter(
    (e) => e.status === "open"
  ).length;
  const assignedIncidents = safeEmergencies.filter(
    (e) => e.status === "assigned"
  ).length;
  const inProgressIncidents = safeEmergencies.filter(
    (e) => e.status === "in_progress"
  ).length;
  const resolvedIncidents = safeEmergencies.filter(
    (e) => e.status === "resolved"
  ).length;

  // Active incidents (assigned + in_progress)
  const activeIncidents = assignedIncidents + inProgressIncidents;

  const severityCounts = {
    high: safeEmergencies.filter((e) => e.severity === "high").length,
    medium: safeEmergencies.filter((e) => e.severity === "medium").length,
    low: safeEmergencies.filter((e) => e.severity === "low").length,
  };

  const activeResponders = safeResponders.filter((r) => r.isActive).length;
  const totalResponders = safeResponders.length;

  // Get most recently updated incident
  const recentIncident = safeEmergencies.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  return (
    <div className="bg-white border-t p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Incidents */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <Badge variant="secondary" className="text-xs">
              Total
            </Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalIncidents}</p>
          <p className="text-sm text-gray-600 mt-1">Total Incidents</p>
        </Card>

        {/* Open Incidents */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <Clock className="h-5 w-5 text-red-600" />
            <Badge variant="destructive" className="text-xs">
              Open
            </Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">{openIncidents}</p>
          <p className="text-sm text-gray-600 mt-1">Awaiting Response</p>
        </Card>

        {/* Resolved */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <Badge className="bg-green-600 text-white text-xs">Resolved</Badge>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {resolvedIncidents}
          </p>
          <p className="text-sm text-gray-600 mt-1">Completed Today</p>
        </Card>

        {/* Active Incidents */}
        <Card className="p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <Badge className="bg-amber-500 text-white text-xs">Active</Badge>
          </div>
          <p className="text-xl font-bold">{activeIncidents}</p>
          <p className="text-xs text-gray-500 mt-1">Active Incidents</p>
        </Card>

        {/* Active Responders */}
        <Card className="p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-4 w-4 text-green-600" />
            <Activity className="h-3 w-3 text-green-600" />
          </div>
          <p className="text-xl font-bold">
            {activeResponders}
            <span className="text-sm font-normal text-gray-500">
              /{totalResponders}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Active Responders</p>
        </Card>

        {/* Severity Breakdown */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">
              By Severity
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">High</span>
              <Badge className="bg-red-500 text-white text-xs">
                {severityCounts.high}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Medium</span>
              <Badge className="bg-amber-500 text-white text-xs">
                {severityCounts.medium}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Low</span>
              <Badge className="bg-green-500 text-white text-xs">
                {severityCounts.low}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentIncident && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Most Recent Update:
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(recentIncident.updatedAt).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-base font-medium text-gray-900 truncate">
            {recentIncident.title}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {recentIncident.location}
          </p>
        </div>
      )}
    </div>
  );
}
