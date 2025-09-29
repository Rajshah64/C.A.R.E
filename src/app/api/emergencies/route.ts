import { createClient } from "@/utils/supabase/server";
import { createClientWithJWT } from "@/utils/supabase/server-with-jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { isUserDispatcher } from "@/utils/auth";
import { corsHeaders, handleCors } from "@/lib/cors";
import { findBestResponder } from "@/utils/geo";

export async function GET(request: NextRequest) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Try to get JWT token from Authorization header first
    const authHeader = request.headers.get("authorization");
    let user;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Use JWT token from header
      const token = authHeader.substring(7);
      const supabase = createClientWithJWT(token);
      const {
        data: { user: jwtUser },
        error,
      } = await supabase.auth.getUser();
      user = jwtUser;

      if (error) {
        console.error("JWT token error:", error);
        return NextResponse.json(
          { error: "Invalid token", details: error.message },
          { status: 401, headers: corsHeaders() }
        );
      }
    } else {
      // Fallback to cookie-based auth
      const supabase = await createClient();
      const {
        data: { user: cookieUser },
      } = await supabase.auth.getUser();
      user = cookieUser;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }

    const emergencies = await prisma.emergency.findMany({
      orderBy: { createdAt: "desc" },
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
              select: { id: true, name: true, email: true, phone: true },
            },
          },
        },
      },
    });

    return NextResponse.json(emergencies, {
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Error fetching emergencies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

export async function POST(request: NextRequest) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Try to get JWT token from Authorization header first
    const authHeader = request.headers.get("authorization");
    let user;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Use JWT token from header
      const token = authHeader.substring(7);
      const supabase = createClientWithJWT(token);
      const {
        data: { user: jwtUser },
        error,
      } = await supabase.auth.getUser();
      user = jwtUser;

      if (error) {
        console.error("JWT token error:", error);
        return NextResponse.json(
          { error: "Invalid token", details: error.message },
          { status: 401, headers: corsHeaders() }
        );
      }
    } else {
      // Fallback to cookie-based auth
      const supabase = await createClient();
      const {
        data: { user: cookieUser },
      } = await supabase.auth.getUser();
      user = cookieUser;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: corsHeaders(),
        }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      location,
      latitude,
      longitude,
      type = "general",
      severity,
      status,
    } = body;

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        {
          status: 404,
          headers: corsHeaders(),
        }
      );
    }

    // Auto-assign responder if coordinates are available
    let assignedResponderId = null;
    let emergencyStatus = status || "open";

    if (latitude && longitude) {
      console.log("🔍 Auto-assignment: Emergency has coordinates", {
        latitude,
        longitude,
        type,
      });

      // Get all active responders
      const responders = await prisma.responder.findMany({
        where: { isActive: true },
        select: {
          id: true,
          latitude: true,
          longitude: true,
          skills: true,
          isActive: true,
        },
      });

      console.log("👥 Active responders found:", responders.length);

      // Find best responder
      const bestMatch = findBestResponder(
        parseFloat(latitude),
        parseFloat(longitude),
        type,
        responders
      );

      if (bestMatch) {
        assignedResponderId = bestMatch.responder.id;
        emergencyStatus = "assigned";
        console.log("✅ Auto-assigned responder:", {
          responderId: assignedResponderId,
          distance: bestMatch.distance,
        });
      } else {
        console.log("❌ No suitable responder found for auto-assignment");
      }
    }

    const emergency = await prisma.emergency.create({
      data: {
        title,
        description,
        location,
        type,
        ...(latitude && longitude
          ? {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            }
          : {}),
        severity: severity || "medium",
        status: emergencyStatus,
        assignedResponder: assignedResponderId,
        createdBy: profile.id,
      },
      include: {
        creator: {
          select: { fullName: true, email: true },
        },
        assignedResponderProfile: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // If responder was auto-assigned, create the assignment relationship
    if (assignedResponderId) {
      await prisma.emergencyResponder.create({
        data: {
          emergencyId: emergency.id,
          responderId: assignedResponderId,
          status: "assigned",
        },
      });
    }

    return NextResponse.json(emergency, {
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Error creating emergency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      {
        status: 500,
        headers: corsHeaders(),
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}
