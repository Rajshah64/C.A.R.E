import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { isUserDispatcher } from "@/utils/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isDispatcher = await isUserDispatcher(user);
    if (!isDispatcher) {
      return NextResponse.json(
        { error: "Forbidden - Dispatcher only" },
        { status: 403 }
      );
    }

    // Get current status
    const currentResponder = await prisma.responder.findUnique({
      where: { id: params.id },
      select: { isActive: true },
    });

    if (!currentResponder) {
      return NextResponse.json(
        { error: "Responder not found" },
        { status: 404 }
      );
    }

    // Toggle status
    const responder = await prisma.responder.update({
      where: { id: params.id },
      data: {
        isActive: !currentResponder.isActive,
      },
    });

    return NextResponse.json(responder);
  } catch (error) {
    console.error("Error toggling responder status:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
