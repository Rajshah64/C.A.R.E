import { createClient } from "@/utils/supabase/client";
import { prisma } from "@/utils/prisma";
import { User } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string | null;
  isDispatcher: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export async function getUserProfile(user: User): Promise<UserProfile | null> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      // Create profile if it doesn't exist
      const newProfile = await prisma.profile.create({
        data: {
          userId: user.id,
          email: user.email || "",
          fullName: user.user_metadata?.full_name || null,
        },
      });
      return newProfile;
    }

    return profile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

export async function isUserDispatcher(user: User): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { isDispatcher: true },
    });
    return profile?.isDispatcher || false;
  } catch (error) {
    console.error("Error checking dispatcher status:", error);
    return false;
  }
}

export async function updateUserProfile(
  user: User,
  updates: Partial<Pick<UserProfile, "fullName">>
): Promise<boolean> {
  try {
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        fullName: updates.fullName,
        updatedAt: new Date(),
      },
    });
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    return false;
  }
}

export async function createOrUpdateProfile(
  user: User
): Promise<UserProfile | null> {
  try {
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        email: user.email || "",
        fullName: user.user_metadata?.full_name || null,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        email: user.email || "",
        fullName: user.user_metadata?.full_name || null,
      },
    });
    return profile;
  } catch (error) {
    console.error("Error creating/updating profile:", error);
    return null;
  }
}
