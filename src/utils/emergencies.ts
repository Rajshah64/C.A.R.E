import { prisma } from "@/utils/prisma";
import { User } from "@supabase/supabase-js";

export interface EmergencyData {
  id?: string;
  title: string;
  description?: string;
  location: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed";
  createdBy?: string;
  assignedTo?: string;
}

export async function getEmergencies(): Promise<EmergencyData[]> {
  try {
    const emergencies = await prisma.emergency.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creator: {
          select: { fullName: true, email: true },
        },
        assignee: {
          select: { fullName: true, email: true },
        },
      },
    });
    return emergencies;
  } catch (error) {
    console.error("Error fetching emergencies:", error);
    return [];
  }
}

export async function getEmergencyById(
  id: string
): Promise<EmergencyData | null> {
  try {
    const emergency = await prisma.emergency.findUnique({
      where: { id },
      include: {
        creator: {
          select: { fullName: true, email: true },
        },
        assignee: {
          select: { fullName: true, email: true },
        },
        responders: {
          include: {
            responder: {
              select: { name: true, email: true, phone: true },
            },
          },
        },
      },
    });
    return emergency;
  } catch (error) {
    console.error("Error fetching emergency:", error);
    return null;
  }
}

export async function createEmergency(
  emergencyData: Omit<EmergencyData, "id" | "createdBy">,
  user: User
): Promise<EmergencyData | null> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      throw new Error("User profile not found");
    }

    const emergency = await prisma.emergency.create({
      data: {
        ...emergencyData,
        createdBy: profile.id,
      },
    });
    return emergency;
  } catch (error) {
    console.error("Error creating emergency:", error);
    return null;
  }
}

export async function updateEmergency(
  id: string,
  updates: Partial<Omit<EmergencyData, "id" | "createdBy">>
): Promise<EmergencyData | null> {
  try {
    const emergency = await prisma.emergency.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
    return emergency;
  } catch (error) {
    console.error("Error updating emergency:", error);
    return null;
  }
}

export async function assignEmergencyToResponder(
  emergencyId: string,
  responderId: string
): Promise<boolean> {
  try {
    await prisma.emergencyResponder.create({
      data: {
        emergencyId,
        responderId,
        status: "pending",
      },
    });
    return true;
  } catch (error) {
    console.error("Error assigning emergency to responder:", error);
    return false;
  }
}

export async function updateEmergencyResponderStatus(
  emergencyId: string,
  responderId: string,
  status: "pending" | "accepted" | "declined" | "completed"
): Promise<boolean> {
  try {
    await prisma.emergencyResponder.updateMany({
      where: {
        emergencyId,
        responderId,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating emergency responder status:", error);
    return false;
  }
}

export async function getOpenEmergencies(): Promise<EmergencyData[]> {
  try {
    const emergencies = await prisma.emergency.findMany({
      where: { status: "open" },
      orderBy: { createdAt: "desc" },
    });
    return emergencies;
  } catch (error) {
    console.error("Error fetching open emergencies:", error);
    return [];
  }
}
