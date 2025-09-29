import { createClient } from "@/utils/supabase/server";
import { createClientWithJWT } from "@/utils/supabase/server-with-jwt";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { isUserDispatcher } from "@/utils/auth";
import { corsHeaders, handleCors } from "@/lib/cors";

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

    const responders = await prisma.responder.findMany({
      orderBy: { createdAt: "desc" },
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

    return NextResponse.json(responders, {
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Error fetching responders:", error);
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

    const isDispatcher = await isUserDispatcher(user);
    if (!isDispatcher) {
      return NextResponse.json(
        { error: "Forbidden - Dispatcher only" },
        {
          status: 403,
          headers: corsHeaders(),
        }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      location,
      latitude,
      longitude,
      skills,
      isActive,
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

    const responder = await prisma.responder.create({
      data: {
        name,
        email,
        phone,
        location,
        ...(latitude && longitude
          ? {
              latitude: parseFloat(latitude),
              longitude: parseFloat(longitude),
            }
          : {}),
        skills: skills || [],
        isActive: isActive ?? false,
        createdBy: profile.id,
      },
      include: {
        creator: {
          select: { fullName: true, email: true },
        },
      },
    });

    return NextResponse.json(responder, {
      headers: corsHeaders(),
    });
  } catch (error) {
    console.error("Error creating responder:", error);
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
