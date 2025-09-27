import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { isUserDispatcher } from "@/utils/auth";

export async function GET(
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

    const emergency = await prisma.emergency.findUnique({
      where: { id: params.id },
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

    if (!emergency) {
      return NextResponse.json(
        { error: "Emergency not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(emergency);
  } catch (error) {
    console.error("Error fetching emergency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const { title, description, location, severity, status, assignedTo } = body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (location !== undefined) updateData.location = location;
    if (severity !== undefined) updateData.severity = severity;
    if (status !== undefined) updateData.status = status;
    if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

    const emergency = await prisma.emergency.update({
      where: { id: params.id },
      data: updateData,
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

    return NextResponse.json(emergency);
  } catch (error) {
    console.error("Error updating emergency:", error);
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

    await prisma.emergency.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Emergency deleted successfully" });
  } catch (error) {
    console.error("Error deleting emergency:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
