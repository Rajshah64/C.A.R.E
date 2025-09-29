"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MapPanel } from "@/components/dashboard/MapPanel";
import { BottomPanel } from "@/components/dashboard/BottomPanel";
import {
  EmergencyDialog,
  EmergencyFormData,
} from "@/components/dashboard/EmergencyDialog";
import { AssignResponderDialog } from "@/components/dashboard/AssignResponderDialog";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { Emergency, Responder, UserProfile } from "@/types/dashboard";

export default function DashboardPage() {
  // Dashboard component using shared types
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isDispatcher, setIsDispatcher] = useState(false);
  const [loading, setLoading] = useState(true);
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [responders, setResponders] = useState<Responder[]>([]);
  const [selectedEmergency, setSelectedEmergency] = useState<Emergency | null>(
    null
  );
  const [selectedResponder, setSelectedResponder] = useState<Responder | null>(
    null
  );
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [editingEmergency, setEditingEmergency] = useState<Emergency | null>(
    null
  );
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/auth/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsDispatcher(data.isDispatcher);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchEmergencies = async () => {
    try {
      const response = await fetch("/api/emergencies");
      if (response.ok) {
        const data = await response.json();
        setEmergencies(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching emergencies:", error);
      setEmergencies([]);
    }
  };

  const fetchResponders = async () => {
    try {
      const response = await fetch("/api/responders");
      if (response.ok) {
        const data = await response.json();
        setResponders(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching responders:", error);
      setResponders([]);
    }
  };

  const handleNewIncident = () => {
    setEditingEmergency(null);
    setEmergencyDialogOpen(true);
  };

  const handleEditIncident = (emergency: Emergency) => {
    setEditingEmergency(emergency);
    setEmergencyDialogOpen(true);
  };

  const handleEmergencySubmit = async (data: EmergencyFormData) => {
    try {
      const url = editingEmergency
        ? `/api/emergencies/${editingEmergency.id}`
        : "/api/emergencies";
      const method = editingEmergency ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        await fetchEmergencies();
        setEmergencyDialogOpen(false);
        setEditingEmergency(null);
      } else {
        console.error("Error saving emergency");
      }
    } catch (error) {
      console.error("Error saving emergency:", error);
    }
  };

  const handleAssignResponder = async (responderId: string) => {
    if (!selectedEmergency) return;

    try {
      const response = await fetch(
        `/api/emergencies/${selectedEmergency.id}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ responderId }),
        }
      );

      if (response.ok) {
        await fetchEmergencies();
      } else {
        console.error("Error assigning responder");
      }
    } catch (error) {
      console.error("Error assigning responder:", error);
    }
  };

  const handleUnassignResponder = async (responderId: string) => {
    if (!selectedEmergency) return;

    try {
      const response = await fetch(
        `/api/emergencies/${selectedEmergency.id}/assign`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ responderId }),
        }
      );

      if (response.ok) {
        await fetchEmergencies();
      } else {
        console.error("Error unassigning responder");
      }
    } catch (error) {
      console.error("Error unassigning responder:", error);
    }
  };

  const handleEmergencySelect = (emergency: Emergency) => {
    setSelectedEmergency(emergency);
    setSelectedResponder(null);
  };

  const handleResponderSelect = (responder: Responder) => {
    setSelectedResponder(responder);
    setSelectedEmergency(null);
  };

  const handleAssignResponders = (emergency: Emergency) => {
    setSelectedEmergency(emergency);
    setAssignDialogOpen(true);
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        await fetchUserProfile();
        await fetchEmergencies();
        await fetchResponders();
      }

      setLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        router.push("/login");
      } else {
        setUser(session.user);
        if (session.user) {
          await fetchUserProfile();
          await fetchEmergencies();
          await fetchResponders();
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  // Real-time updates - poll every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      await fetchEmergencies();
      await fetchResponders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b flex-shrink-0 z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Emergency Response Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <span className="text-sm text-gray-700">
                  {profile?.fullName || user.email}
                </span>
                {isDispatcher && (
                  <span className="block text-xs text-blue-600 font-medium">
                    Dispatcher
                  </span>
                )}
              </div>
              <Link href="/responder">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700"
                >
                  <UserIcon className="h-4 w-4 mr-1" />
                  Responder View
                </Button>
              </Link>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 z-30"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 flex-shrink-0 border-r bg-white flex flex-col">
          <Sidebar
            emergencies={emergencies}
            onEmergencySelect={handleEmergencySelect}
            onNewIncident={handleNewIncident}
            onAssignResponders={handleAssignResponders}
            selectedEmergency={selectedEmergency}
            isDispatcher={isDispatcher}
          />
        </div>

        {/* Map and Bottom Panel Container */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Map Panel */}
          <div className="flex-1 p-4 min-h-0">
            <MapPanel
              emergencies={emergencies}
              responders={responders}
              selectedEmergency={selectedEmergency}
              onEmergencySelectAction={handleEmergencySelect}
              onResponderSelectAction={handleResponderSelect}
            />
          </div>

          {/* Bottom Panel */}
          <div className="flex-shrink-0 border-t bg-white max-h-48 overflow-y-auto">
            <BottomPanel emergencies={emergencies} responders={responders} />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <EmergencyDialog
        open={emergencyDialogOpen}
        onOpenChangeAction={setEmergencyDialogOpen}
        onSubmitAction={handleEmergencySubmit}
        emergency={editingEmergency || undefined}
      />

      {selectedEmergency && (
        <AssignResponderDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          emergencyId={selectedEmergency.id}
          emergencyTitle={selectedEmergency.title}
          assignedResponderIds={
            selectedEmergency.responders?.map((r) => r.responder.id) || []
          }
          responders={responders}
          onAssign={handleAssignResponder}
          onUnassign={handleUnassignResponder}
        />
      )}
    </div>
  );
}
