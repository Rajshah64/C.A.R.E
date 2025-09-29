"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, AlertCircle, ArrowLeft } from "lucide-react";

export default function ExistingResponderLogin() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responders, setResponders] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Fetch all responders to show available options
    fetchResponders();
  }, []);

  const fetchResponders = async () => {
    try {
      const response = await fetch("/api/responders/public");
      const data = await response.json();
      setResponders(data);
    } catch (error) {
      console.error("Error fetching responders:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Find responder by email
      const responder = responders.find(
        (r) => r.email.toLowerCase() === email.toLowerCase()
      );

      if (!responder) {
        setError("No responder found with this email address");
        setLoading(false);
        return;
      }

      // Store responder data in localStorage for session management
      localStorage.setItem("responder", JSON.stringify(responder));
      // Redirect to responder dashboard
      router.push("/responder/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <User className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">
            Existing Responder Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email to access your dashboard
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
              />
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Available Responders List */}
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Available Responders:
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {responders.map((responder) => (
                <div
                  key={responder.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm"
                >
                  <div>
                    <span className="font-medium">{responder.name}</span>
                    <span className="text-gray-500 ml-2">
                      ({responder.email})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEmail(responder.email)}
                  >
                    Use
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button
              onClick={() => router.push("/responder/login")}
              variant="ghost"
              className="text-sm text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to New Responder
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
