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
    const { isActive, latitude, longitude } = body;

    // Check if the responder exists
    const responder = await prisma.responder.findFirst({
      where: {
        id: id,
      },
    });

    if (!responder) {
      return NextResponse.json(
        { error: "Responder not found or access denied" },
        {
          status: 404,
          headers: corsHeaders(),
        }
      );
    }

    const updateData: any = {};
    if (isActive !== undefined) updateData.isActive = isActive;
    if (latitude !== undefined)
      updateData.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined)
      updateData.longitude = longitude ? parseFloat(longitude) : null;

    const updatedResponder = await prisma.responder.update({
      where: { id: id },
      data: updateData,
      include: {
        creator: {
          select: { fullName: true, email: true },
        },
        emergencies: {
          include: {
            emergency: {
              select: { id: true, title: true, status: true, severity: true },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedResponder, {
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
