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

    const body = await request.json();
    const { responderId } = body;

    if (!responderId) {
      return NextResponse.json(
        { error: "Responder ID required" },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existingAssignment = await prisma.emergencyResponder.findUnique({
      where: {
        emergencyId_responderId: {
          emergencyId: params.id,
          responderId: responderId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Responder already assigned" },
        { status: 400 }
      );
    }

    // Create assignment
    const assignment = await prisma.emergencyResponder.create({
      data: {
        emergencyId: params.id,
        responderId: responderId,
        status: "pending",
      },
      include: {
        responder: {
          select: { id: true, name: true, email: true, phone: true },
        },
      },
    });

    // Update emergency status to assigned if it was open
    await prisma.emergency.updateMany({
      where: {
        id: params.id,
        status: "open",
      },
      data: {
        status: "assigned",
      },
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error assigning responder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const body = await request.json();
    const { responderId } = body;

    if (!responderId) {
      return NextResponse.json(
        { error: "Responder ID required" },
        { status: 400 }
      );
    }

    await prisma.emergencyResponder.delete({
      where: {
        emergencyId_responderId: {
          emergencyId: params.id,
          responderId: responderId,
        },
      },
    });

    return NextResponse.json({ message: "Assignment removed successfully" });
  } catch (error) {
    console.error("Error removing assignment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
