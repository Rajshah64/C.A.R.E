import {
  getResponders,
  createResponder,
  toggleResponderStatus as prismaToggleResponderStatus,
  getResponderById,
  updateResponder,
  deleteResponder,
  getActiveResponders,
} from "@/utils/responders";
import {
  getEmergencies,
  createEmergency,
  getEmergencyById,
  updateEmergency,
  assignEmergencyToResponder,
  updateEmergencyResponderStatus,
  getOpenEmergencies,
} from "@/utils/emergencies";
import { User } from "@supabase/supabase-js";

// Prisma-based responder functions
export async function getRespondersList() {
  return await getResponders();
}

export async function getResponder(responderId: string) {
  return await getResponderById(responderId);
}

export async function createResponderData(responderData: any, user: User) {
  return await createResponder(responderData, user);
}

export async function updateResponderData(responderId: string, updates: any) {
  return await updateResponder(responderId, updates);
}

export async function deleteResponderData(responderId: string) {
  return await deleteResponder(responderId);
}

export async function toggleResponderStatus(
  responderId: string,
  isActive: boolean
) {
  return await prismaToggleResponderStatus(responderId, isActive);
}

export async function getActiveRespondersList() {
  return await getActiveResponders();
}

// Prisma-based emergency functions
export async function getEmergenciesList() {
  return await getEmergencies();
}

export async function getEmergency(emergencyId: string) {
  return await getEmergencyById(emergencyId);
}

export async function createEmergencyData(emergencyData: any, user: User) {
  return await createEmergency(emergencyData, user);
}

export async function updateEmergencyData(emergencyId: string, updates: any) {
  return await updateEmergency(emergencyId, updates);
}

export async function assignEmergency(
  emergencyId: string,
  responderId: string
) {
  return await assignEmergencyToResponder(emergencyId, responderId);
}

export async function updateEmergencyResponder(
  emergencyId: string,
  responderId: string,
  status: "pending" | "accepted" | "declined" | "completed"
) {
  return await updateEmergencyResponderStatus(emergencyId, responderId, status);
}

export async function getOpenEmergenciesList() {
  return await getOpenEmergencies();
}
