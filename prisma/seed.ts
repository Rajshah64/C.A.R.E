import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create sample profiles
  const dispatcherProfile = await prisma.profile.upsert({
    where: { email: "dispatcher@example.com" },
    update: {},
    create: {
      userId: "dispatcher-user-id",
      email: "dispatcher@example.com",
      fullName: "John Dispatcher",
      isDispatcher: true,
    },
  });

  const userProfile = await prisma.profile.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      userId: "user-id",
      email: "user@example.com",
      fullName: "Jane User",
      isDispatcher: false,
    },
  });

  console.log("✅ Created profiles");

  // Create sample responders
  const responders = await Promise.all([
    prisma.responder.upsert({
      where: { email: "responder1@example.com" },
      update: {},
      create: {
        name: "Alice Johnson",
        email: "responder1@example.com",
        phone: "+1234567890",
        isActive: true,
        location: "Downtown",
        skills: ["First Aid", "Fire Safety", "Search & Rescue"],
        createdBy: dispatcherProfile.id,
      },
    }),
    prisma.responder.upsert({
      where: { email: "responder2@example.com" },
      update: {},
      create: {
        name: "Bob Smith",
        email: "responder2@example.com",
        phone: "+1234567891",
        isActive: true,
        location: "Uptown",
        skills: ["Medical Emergency", "Trauma Care"],
        createdBy: dispatcherProfile.id,
      },
    }),
    prisma.responder.upsert({
      where: { email: "responder3@example.com" },
      update: {},
      create: {
        name: "Charlie Brown",
        email: "responder3@example.com",
        phone: "+1234567892",
        isActive: false,
        location: "Suburbs",
        skills: ["Water Rescue", "Emergency Response"],
        createdBy: dispatcherProfile.id,
      },
    }),
  ]);

  console.log("✅ Created responders");

  // Create sample emergencies
  const emergencies = await Promise.all([
    prisma.emergency.create({
      data: {
        title: "Fire Emergency - Downtown Building",
        description:
          "Reported fire in a 5-story office building. Multiple people trapped.",
        location: "123 Main St, Downtown",
        severity: "high",
        status: "open",
        createdBy: dispatcherProfile.id,
      },
    }),
    prisma.emergency.create({
      data: {
        title: "Medical Emergency - Park",
        description:
          "Person collapsed in Central Park. Requires immediate medical attention.",
        location: "Central Park, Uptown",
        severity: "critical",
        status: "assigned",
        createdBy: dispatcherProfile.id,
        assignedTo: dispatcherProfile.id,
      },
    }),
    prisma.emergency.create({
      data: {
        title: "Traffic Accident - Highway",
        description: "Multi-vehicle accident on Highway 101. Road blocked.",
        location: "Highway 101, Mile Marker 15",
        severity: "medium",
        status: "resolved",
        createdBy: dispatcherProfile.id,
      },
    }),
  ]);

  console.log("✅ Created emergencies");

  // Create emergency-responder assignments
  await prisma.emergencyResponder.createMany({
    data: [
      {
        emergencyId: emergencies[0].id,
        responderId: responders[0].id,
        status: "accepted",
      },
      {
        emergencyId: emergencies[1].id,
        responderId: responders[1].id,
        status: "accepted",
      },
      {
        emergencyId: emergencies[2].id,
        responderId: responders[2].id,
        status: "completed",
      },
    ],
  });

  console.log("✅ Created emergency-responder assignments");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
