import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create system dispatcher profile
  const dispatcherProfile = await prisma.profile.upsert({
    where: { userId: "system" },
    update: {},
    create: {
      userId: "system",
      fullName: "System Dispatcher",
      email: "dispatcher@system.com",
      isDispatcher: true,
    },
  });

  console.log("✅ Created dispatcher profile");

  // Create responders
  const responders = await Promise.all([
    (async () => {
      const existing = await prisma.responder.findFirst({
        where: { email: "inspector.rajesh@mumbai.gov.in" },
      });
      if (existing) return existing;
      return prisma.responder.create({
        data: {
          name: "Inspector Rajesh Kumar",
          email: "inspector.rajesh@mumbai.gov.in",
          phone: "+91-98765-43210",
          skills: "Police",
          location: "Mumbai Police Station, Colaba",
          latitude: 18.922,
          longitude: 72.8347,
          isActive: true,
        },
      });
    })(),
    (async () => {
      const existing = await prisma.responder.findFirst({
        where: { email: "dr.priya@mumbai.gov.in" },
      });
      if (existing) return existing;
      return prisma.responder.create({
        data: {
          name: "Dr. Priya Sharma",
          email: "dr.priya@mumbai.gov.in",
          phone: "+91-98765-43211",
          skills: "Ambulance",
          location: "KEM Hospital, Parel",
          latitude: 19.002,
          longitude: 72.841,
          isActive: true,
        },
      });
    })(),
    (async () => {
      const existing = await prisma.responder.findFirst({
        where: { email: "fire.captain@mumbai.gov.in" },
      });
      if (existing) return existing;
      return prisma.responder.create({
        data: {
          name: "Fire Captain Arjun Singh",
          email: "fire.captain@mumbai.gov.in",
          phone: "+91-98765-43212",
          skills: "Fire Brigade",
          location: "Mumbai Fire Station, Andheri",
          latitude: 19.1136,
          longitude: 72.8697,
          isActive: true,
        },
      });
    })(),
    (async () => {
      const existing = await prisma.responder.findFirst({
        where: { email: "constable.suresh@mumbai.gov.in" },
      });
      if (existing) return existing;
      return prisma.responder.create({
        data: {
          name: "Constable Suresh Patel",
          email: "constable.suresh@mumbai.gov.in",
          phone: "+91-98765-43213",
          skills: "Police",
          location: "Bandra Police Station",
          latitude: 19.0544,
          longitude: 72.8406,
          isActive: false,
        },
      });
    })(),
    (async () => {
      const existing = await prisma.responder.findFirst({
        where: { email: "paramedic.anita@mumbai.gov.in" },
      });
      if (existing) return existing;
      return prisma.responder.create({
        data: {
          name: "Paramedic Anita Desai",
          email: "paramedic.anita@mumbai.gov.in",
          phone: "+91-98765-43214",
          skills: "Ambulance",
          location: "Sion Hospital",
          latitude: 19.039,
          longitude: 72.857,
          isActive: true,
        },
      });
    })(),
  ]);

  console.log("✅ Created responders");

  // Create sample emergencies (will be auto-assigned)
  const emergencies = await Promise.all([
    prisma.emergency.create({
      data: {
        title: "Fire at High-Rise Building - Nariman Point",
        description:
          "Major fire reported in 15-story commercial building. Multiple people trapped on upper floors. Fire brigade and police deployed.",
        location: "Nariman Point, Mumbai",
        latitude: 18.922,
        longitude: 72.8347,
        type: "fire",
        severity: "high",
        status: "open", // Will be auto-assigned
        createdBy: dispatcherProfile.id,
      },
    }),
    prisma.emergency.create({
      data: {
        title: "Road Accident on Western Express Highway",
        description:
          "Multi-vehicle collision involving 3 cars and 1 bus. Multiple casualties reported. Ambulance and police required immediately.",
        location: "Western Express Highway, Andheri",
        latitude: 19.1136,
        longitude: 72.8697,
        type: "medical",
        severity: "high",
        status: "open", // Will be auto-assigned
        createdBy: dispatcherProfile.id,
      },
    }),
    prisma.emergency.create({
      data: {
        title: "Gas Cylinder Explosion - Dharavi",
        description:
          "LPG cylinder explosion in slum area. Fire spreading to nearby structures. Evacuation in progress.",
        location: "Dharavi, Mumbai",
        latitude: 19.006,
        longitude: 72.841,
        type: "fire",
        severity: "high",
        status: "open", // Will be auto-assigned
        createdBy: dispatcherProfile.id,
      },
    }),
    prisma.emergency.create({
      data: {
        title: "Heart Attack - Marine Drive",
        description:
          "Elderly person collapsed while walking on Marine Drive. Requires immediate medical attention.",
        location: "Marine Drive, Mumbai",
        latitude: 18.943,
        longitude: 72.826,
        type: "medical",
        severity: "medium",
        status: "open", // Will be auto-assigned
        createdBy: dispatcherProfile.id,
      },
    }),
    prisma.emergency.create({
      data: {
        title: "Building Collapse - Construction Site",
        description:
          "Under-construction building collapsed in Powai. Multiple construction workers trapped under debris.",
        location: "Powai, Mumbai",
        latitude: 19.1197,
        longitude: 72.9064,
        type: "general",
        severity: "high",
        status: "open", // Will be auto-assigned
        createdBy: dispatcherProfile.id,
      },
    }),
  ]);

  console.log("✅ Created emergencies");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });