"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  MapPin,
  User,
  Phone,
  Mail,
  Play,
  Pause,
  RefreshCw,
  LogOut,
} from "lucide-react";

interface Emergency {
  id: string;
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  severity: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  responders: Array<{
    id: string;
    status: string;
    assignedAt: string;
    responder: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface Responder {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  skills: string[];
}

export default function ResponderDashboard() {
  const [responder, setResponder] = useState<Responder | null>(null);
  const [assignedEmergencies, setAssignedEmergencies] = useState<Emergency[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if responder is logged in via localStorage
    const storedResponder = localStorage.getItem("responder");
    if (!storedResponder) {
      router.push("/responder/login");
      return;
    }

    try {
      const responderData = JSON.parse(storedResponder);
      setResponder(responderData);
      fetchAssignedEmergencies(responderData);
    } catch (error) {
      console.error("Error parsing responder data:", error);
      router.push("/responder/login");
    }
  }, [router]);

  const fetchAssignedEmergencies = async (responderData: Responder) => {
    try {
      const emergenciesResponse = await fetch("/api/emergencies/public");
      const allEmergencies = await emergenciesResponse.json();

      const assigned = allEmergencies.filter((emergency: Emergency) =>
        emergency.responders?.some(
          (r) => r.responder.email === responderData.email
        )
      );

      setAssignedEmergencies(assigned);
    } catch (error) {
      console.error("Error fetching emergencies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("responder");
    router.push("/responder/login");
  };

  const updateResponderStatus = async (isActive: boolean) => {
    if (!responder) return;

    try {
      const response = await fetch(`/api/responders/${responder.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive,
          latitude: responder.latitude,
          longitude: responder.longitude,
        }),
      });

      if (response.ok) {
        const updatedResponder = { ...responder, isActive };
        setResponder(updatedResponder);
        localStorage.setItem("responder", JSON.stringify(updatedResponder));
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateAssignmentStatus = async (
    emergencyId: string,
    status: string
  ) => {
    if (!responder) return;

    setUpdating(emergencyId);
    try {
      console.log("Updating assignment status:", {
        emergencyId,
        responderId: responder.id,
        status,
      });

      const response = await fetch(
        `/api/emergencies/${emergencyId}/responder-status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            responderId: responder.id,
            status,
          }),
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const result = await response.json();
        console.log("Update successful:", result);

        // Update local state immediately for better UX
        setAssignedEmergencies((prev) =>
          prev.map((emergency) => {
            if (emergency.id === emergencyId) {
              return {
                ...emergency,
                responders: emergency.responders.map((r) =>
                  r.responder.id === responder.id ? { ...r, status } : r
                ),
              };
            }
            return emergency;
          })
        );
      } else {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        alert(`Failed to update status: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error updating assignment status:", error);
      alert(`Error updating status: ${error}`);
    } finally {
      setUpdating(null);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-amber-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "accepted":
        return "bg-yellow-500";
      case "pending":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In Progress";
      case "accepted":
        return "Accepted";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading responder dashboard...</p>
        </div>
      </div>
    );
  }

  if (!responder) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Not Logged In
          </h2>
          <p className="text-gray-600 mb-4">
            Please login to access your responder dashboard.
          </p>
          <Button onClick={() => router.push("/responder/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Responder Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm text-gray-700">{responder.name}</span>
                <span className="block text-xs text-blue-600 font-medium">
                  {responder.isActive ? "Available" : "Unavailable"}
                </span>
              </div>
              <Button
                onClick={() => updateResponderStatus(!responder.isActive)}
                variant={responder.isActive ? "destructive" : "default"}
                size="sm"
              >
                {responder.isActive ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Go Offline
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Go Online
                  </>
                )}
              </Button>
              <Button
                onClick={() => fetchAssignedEmergencies(responder)}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-6">
        {/* Responder Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{responder.name}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span>{responder.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-4 w-4" />
                  <span>{responder.phone}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{responder.location}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {responder.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Assigned Emergencies */}
        <div>
          <h3 className="text-lg font-semibold mb-4">My Assignments</h3>
          {assignedEmergencies.length === 0 ? (
            <Card className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No assignments yet</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {assignedEmergencies.map((emergency) => {
                const assignment = emergency.responders?.find(
                  (r) => r.responder.email === responder.email
                );
                return (
                  <Card key={emergency.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-semibold">
                            {emergency.title}
                          </h4>
                          <Badge
                            className={getSeverityColor(emergency.severity)}
                          >
                            {emergency.severity}
                          </Badge>
                          <Badge
                            className={getStatusColor(
                              assignment?.status || "pending"
                            )}
                          >
                            {getStatusText(assignment?.status || "pending")}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">
                          {emergency.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{emergency.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Assigned:{" "}
                              {new Date(
                                assignment?.assignedAt || emergency.createdAt
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                      </div>
                      <div className="flex flex-col space-y-2 ml-4">
                        <Select
                          value={assignment?.status || "pending"}
                          onValueChange={(value) =>
                            updateAssignmentStatus(emergency.id, value)
                          }
                          disabled={updating === emergency.id}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                        {updating === emergency.id && (
                          <div className="flex items-center justify-center text-sm text-gray-500">
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                            Updating...
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
