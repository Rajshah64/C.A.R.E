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

    const responder = await prisma.responder.findUnique({
      where: { id: params.id },
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

    if (!responder) {
      return NextResponse.json(
        { error: "Responder not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(responder);
  } catch (error) {
    console.error("Error fetching responder:", error);
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

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    if (latitude !== undefined && longitude !== undefined) {
      updateData.latitude = latitude ? parseFloat(latitude) : null;
      updateData.longitude = longitude ? parseFloat(longitude) : null;
    }
    if (skills !== undefined) updateData.skills = skills;
    if (isActive !== undefined) updateData.isActive = isActive;

    const responder = await prisma.responder.update({
      where: { id: params.id },
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

    return NextResponse.json(responder);
  } catch (error) {
    console.error("Error updating responder:", error);
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

    await prisma.responder.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Responder deleted successfully" });
  } catch (error) {
    console.error("Error deleting responder:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
