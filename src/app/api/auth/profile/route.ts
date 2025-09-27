import { createClient } from "@/utils/supabase/server";
import { createClientWithJWT } from "@/utils/supabase/server-with-jwt";
import { getUserProfile, isUserDispatcher } from "@/utils/auth";
import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function GET(request: NextRequest) {
  // Handle CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    // Try to get JWT token from Authorization header first
    const authHeader = request.headers.get("authorization");
    let supabase;
    let user;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // Use JWT token from header
      const token = authHeader.substring(7);
      supabase = createClientWithJWT(token);
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
      supabase = await createClient();
      const {
        data: { user: cookieUser },
      } = await supabase.auth.getUser();
      user = cookieUser;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders() }
      );
    }

    const profile = await getUserProfile(user);
    const isDispatcher = await isUserDispatcher(user);

    return NextResponse.json(
      { profile, isDispatcher },
      { headers: corsHeaders() }
    );
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: (error as Error).message ?? "Unknown error",
      },
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
