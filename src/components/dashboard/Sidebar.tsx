"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Search,
  Filter,
  AlertCircle,
  Users,
  UserPlus,
} from "lucide-react";
import { Emergency } from "@/types/dashboard";

interface SidebarProps {
  emergencies: Emergency[];
  onEmergencySelect: (emergency: Emergency) => void;
  onNewIncident: () => void;
  onAssignResponders: (emergency: Emergency) => void;
  selectedEmergency: Emergency | null;
  isDispatcher: boolean;
}

export function Sidebar({
  emergencies,
  onEmergencySelect,
  onNewIncident,
  onAssignResponders,
  selectedEmergency,
  isDispatcher,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredEmergencies, setFilteredEmergencies] =
    useState<Emergency[]>(emergencies);

  useEffect(() => {
    let filtered = emergencies;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply severity filter
    if (severityFilter !== "all") {
      filtered = filtered.filter((e) => e.severity === severityFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    setFilteredEmergencies(filtered);
  }, [emergencies, searchQuery, severityFilter, statusFilter]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return "bg-red-600";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">Open</Badge>;
      case "assigned":
        return <Badge variant="secondary">Assigned</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-600">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-600">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Incidents</h2>
          {isDispatcher && (
            <Button
              onClick={onNewIncident}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search incidents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <div className="space-y-3">
          <div>
            <Label
              htmlFor="severity-filter"
              className="text-sm font-medium mb-1"
            >
              Severity
            </Label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger id="severity-filter">
                <SelectValue placeholder="All severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status-filter" className="text-sm font-medium mb-1">
              Status
            </Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
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

      {/* Incident List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredEmergencies.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p>No incidents found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEmergencies.map((emergency) => (
                <Card
                  key={emergency.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedEmergency?.id === emergency.id
                      ? "border-blue-500 bg-blue-50"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => onEmergencySelect(emergency)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm line-clamp-1">
                      {emergency.title}
                    </h3>
                    <Badge
                      className={`${getSeverityColor(
                        emergency.severity
                      )} text-white ml-2`}
                    >
                      {emergency.severity}
                    </Badge>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      {getStatusBadge(emergency.status)}
                      {emergency.responders &&
                        emergency.responders.length > 0 && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <Users className="h-3 w-3 mr-1" />
                            {emergency.responders.length}
                          </span>
                        )}
                    </div>

                    {emergency.assignee && (
                      <p className="text-xs text-gray-600">
                        Assigned to:{" "}
                        {emergency.assignee.fullName ||
                          emergency.assignee.email}
                      </p>
                    )}

                    <p className="text-xs text-gray-500 line-clamp-1">
                      {emergency.location}
                    </p>

                    {isDispatcher && (
                      <div className="flex gap-1 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssignResponders(emergency);
                          }}
                        >
                          <UserPlus className="h-3 w-3 mr-1" />
                          Assign
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
