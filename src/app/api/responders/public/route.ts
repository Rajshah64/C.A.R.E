import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { corsHeaders, handleCors } from "@/lib/cors";

export async function GET(request: NextRequest) {
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;

  try {
    const responders = await prisma.responder.findMany({
      include: {
        creator: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(responders, { headers: corsHeaders() });
  } catch (error) {
    console.error("Error fetching responders:", error);
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
