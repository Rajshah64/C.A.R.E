"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, Shield, AlertCircle } from "lucide-react";

export default function ResponderLogin() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    location: "",
    skills: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Create responder profile directly
      const response = await fetch("/api/responders/create-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const responder = await response.json();
        // Store responder data in localStorage for session management
        localStorage.setItem("responder", JSON.stringify(responder));
        // Redirect to responder dashboard
        router.push("/responder/dashboard");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to create profile");
      }
    } catch (error) {
      console.error("Error creating responder profile:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExistingResponder = () => {
    router.push("/responder/existing");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Responder Login</h2>
          <p className="mt-2 text-sm text-gray-600">
            Access your responder dashboard
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* New Responder Form */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                New Responder
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+91-98765-43210"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    placeholder="e.g., Mumbai Central"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="skills">Primary Skill</Label>
                  <Select
                    value={formData.skills}
                    onValueChange={(value) =>
                      setFormData({ ...formData, skills: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your primary skill" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Police">Police</SelectItem>
                      <SelectItem value="Ambulance">Ambulance</SelectItem>
                      <SelectItem value="Fire Brigade">Fire Brigade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Creating Profile..." : "Create Profile & Login"}
                </Button>
              </form>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">OR</span>
              </div>
            </div>

            {/* Existing Responder */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Existing Responder
              </h3>
              <Button
                onClick={handleExistingResponder}
                variant="outline"
                className="w-full"
              >
                <User className="h-4 w-4 mr-2" />
                Login with Existing Profile
              </Button>
            </div>

            {/* Back to Main Dashboard */}
            <div className="text-center">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="ghost"
                className="text-sm text-gray-600"
              >
                ← Back to Main Dashboard
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
