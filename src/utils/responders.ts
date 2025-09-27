import { prisma } from "@/utils/prisma";
import { User } from "@supabase/supabase-js";

export interface ResponderData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  location?: string;
  skills: string[];
  createdBy?: string;
}

export async function getResponders(): Promise<ResponderData[]> {
  try {
    const responders = await prisma.responder.findMany({
      orderBy: { createdAt: "desc" },
    });
    return responders;
  } catch (error) {
    console.error("Error fetching responders:", error);
    return [];
  }
}

export async function getResponderById(
  id: string
): Promise<ResponderData | null> {
  try {
    const responder = await prisma.responder.findUnique({
      where: { id },
    });
    return responder;
  } catch (error) {
    console.error("Error fetching responder:", error);
    return null;
  }
}

export async function createResponder(
  responderData: Omit<ResponderData, "id" | "createdBy">,
  user: User
): Promise<ResponderData | null> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      throw new Error("User profile not found");
    }

    const responder = await prisma.responder.create({
      data: {
        ...responderData,
        createdBy: profile.id,
      },
    });
    return responder;
  } catch (error) {
    console.error("Error creating responder:", error);
    return null;
  }
}

export async function updateResponder(
  id: string,
  updates: Partial<Omit<ResponderData, "id" | "createdBy">>
): Promise<ResponderData | null> {
  try {
    const responder = await prisma.responder.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
    });
    return responder;
  } catch (error) {
    console.error("Error updating responder:", error);
    return null;
  }
}

export async function toggleResponderStatus(
  id: string,
  isActive: boolean
): Promise<boolean> {
  try {
    await prisma.responder.update({
      where: { id },
      data: {
        isActive,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Error toggling responder status:", error);
    return false;
  }
}

export async function deleteResponder(id: string): Promise<boolean> {
  try {
    await prisma.responder.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    console.error("Error deleting responder:", error);
    return false;
  }
}

export async function getActiveResponders(): Promise<ResponderData[]> {
  try {
    const responders = await prisma.responder.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });
    return responders;
  } catch (error) {
    console.error("Error fetching active responders:", error);
    return [];
  }
}
