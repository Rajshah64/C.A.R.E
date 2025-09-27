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
  // Calculate metrics
  const totalIncidents = emergencies.length;
  const openIncidents = emergencies.filter((e) => e.status === "open").length;
  const assignedIncidents = emergencies.filter(
    (e) => e.status === "assigned"
  ).length;
  const inProgressIncidents = emergencies.filter(
    (e) => e.status === "in_progress"
  ).length;
  const resolvedIncidents = emergencies.filter(
    (e) => e.status === "resolved"
  ).length;

  const severityCounts = {
    critical: emergencies.filter((e) => e.severity === "critical").length,
    high: emergencies.filter((e) => e.severity === "high").length,
    medium: emergencies.filter((e) => e.severity === "medium").length,
    low: emergencies.filter((e) => e.severity === "low").length,
  };

  const activeResponders = responders.filter((r) => r.isActive).length;
  const totalResponders = responders.length;

  // Get most recently updated incident
  const recentIncident = emergencies.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];

  return (
    <div className="h-full bg-white border-t p-4">
      <div className="grid grid-cols-6 gap-4 h-full">
        {/* Total Incidents */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-blue-600" />
            <Badge variant="secondary" className="text-xs">
              Total
            </Badge>
          </div>
          <p className="text-2xl font-bold">{totalIncidents}</p>
          <p className="text-xs text-gray-500 mt-1">Total Incidents</p>
        </Card>

        {/* Open Incidents */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Clock className="h-5 w-5 text-red-600" />
            <Badge variant="destructive" className="text-xs">
              Open
            </Badge>
          </div>
          <p className="text-2xl font-bold">{openIncidents}</p>
          <p className="text-xs text-gray-500 mt-1">Awaiting Response</p>
        </Card>

        {/* In Progress */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            <Badge className="bg-amber-500 text-white text-xs">Active</Badge>
          </div>
          <p className="text-2xl font-bold">
            {assignedIncidents + inProgressIncidents}
          </p>
          <p className="text-xs text-gray-500 mt-1">Being Handled</p>
        </Card>

        {/* Resolved */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <Badge className="bg-green-600 text-white text-xs">Resolved</Badge>
          </div>
          <p className="text-2xl font-bold">{resolvedIncidents}</p>
          <p className="text-xs text-gray-500 mt-1">Completed Today</p>
        </Card>

        {/* Severity Breakdown */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-gray-600" />
            <span className="text-xs font-medium">By Severity</span>
          </div>
          <div className="space-y-1">
            {severityCounts.critical > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs">Critical</span>
                <Badge className="bg-red-600 text-white text-xs">
                  {severityCounts.critical}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs">High</span>
              <Badge className="bg-red-500 text-white text-xs">
                {severityCounts.high}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Medium</span>
              <Badge className="bg-amber-500 text-white text-xs">
                {severityCounts.medium}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs">Low</span>
              <Badge className="bg-green-500 text-white text-xs">
                {severityCounts.low}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Active Responders */}
        <Card className="p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-5 w-5 text-green-600" />
            <Activity className="h-4 w-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold">
            {activeResponders}
            <span className="text-sm font-normal text-gray-500">
              /{totalResponders}
            </span>
          </p>
          <p className="text-xs text-gray-500 mt-1">Active Responders</p>
        </Card>
      </div>

      {/* Recent Activity */}
      {recentIncident && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-600">
                Most Recent Update:
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {new Date(recentIncident.updatedAt).toLocaleTimeString()}
            </span>
          </div>
          <p className="text-sm mt-1 truncate">{recentIncident.title}</p>
        </div>
      )}
    </div>
  );
}
