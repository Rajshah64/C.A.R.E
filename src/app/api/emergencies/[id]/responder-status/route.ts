import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { createClient } from "@/utils/supabase/server";
import { createClientWithJWT } from "@/utils/supabase/server-with-jwt";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const { id } = await params;

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

    // For responder dashboard, we allow updates without authentication
    // as long as the responderId is provided and valid

    const body = await request.json();
    const { responderId, status, notes } = body;

    if (!responderId || !status) {
      return NextResponse.json(
        { error: "responderId and status are required" },
        {
          status: 400,
          headers: corsHeaders(),
        }
      );
    }

    // Check if the responder is assigned to this emergency
    const emergencyResponder = await prisma.emergencyResponder.findFirst({
      where: {
        emergencyId: id,
        responderId: responderId,
      },
      include: {
        emergency: {
          select: { id: true, title: true, status: true },
        },
        responder: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!emergencyResponder) {
      return NextResponse.json(
        { error: "Assignment not found or access denied" },
        {
          status: 404,
          headers: corsHeaders(),
        }
      );
    }

    // Update the responder status
    const updatedAssignment = await prisma.emergencyResponder.update({
      where: {
        id: emergencyResponder.id,
      },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        emergency: {
          select: { id: true, title: true, status: true },
        },
        responder: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // If responder marks as completed, check if all responders are done
    if (status === "completed") {
      const allAssignments = await prisma.emergencyResponder.findMany({
        where: { emergencyId: id },
      });

      const allCompleted = allAssignments.every(
        (assignment) => assignment.status === "completed"
      );

      if (allCompleted) {
        // Update emergency status to resolved
        await prisma.emergency.update({
          where: { id: id },
          data: { status: "resolved" },
        });
      }
    }

    return NextResponse.json(updatedAssignment, {
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Error updating responder status:", error);
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
