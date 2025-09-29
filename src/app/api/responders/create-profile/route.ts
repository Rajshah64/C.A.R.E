import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function POST(request: NextRequest) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const {
      name,
      phone,
      location,
      skills,
      isActive = false,
    } = await request.json();

    if (!name || !phone || !location || !skills) {
      return NextResponse.json(
        {
          error: "Name, phone, location, and skills are required",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Generate a unique email for the responder
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@responder.local`;

    // Check if responder already exists
    const existingResponder = await prisma.responder.findFirst({
      where: { email },
    });

    if (existingResponder) {
      return NextResponse.json(
        {
          error: "Responder profile already exists for this name",
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Get or create a dispatcher profile for the creator
    let dispatcherProfile = await prisma.profile.findFirst({
      where: { isDispatcher: true },
    });

    if (!dispatcherProfile) {
      dispatcherProfile = await prisma.profile.create({
        data: {
          id: "system-dispatcher",
          userId: "system",
          email: "system@dispatcher.local",
          fullName: "System Dispatcher",
          isDispatcher: true,
        },
      });
    }

    // Create responder profile
    const responder = await prisma.responder.create({
      data: {
        name,
        email,
        phone,
        location,
        latitude: 19.1248, // Default Mumbai coordinates
        longitude: 72.8485,
        skills: Array.isArray(skills) ? skills : [skills],
        isActive,
        createdBy: dispatcherProfile.id,
      },
    });

    return NextResponse.json(responder, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error creating responder profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}
