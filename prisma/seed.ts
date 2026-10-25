import { hash } from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

function requireEnvironment(name: "DATABASE_URL" | "DEMO_SEED_PASSWORD") {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to seed the development database.`);
  return value;
}

const databaseUrl = requireEnvironment("DATABASE_URL");
const demoPassword = requireEnvironment("DEMO_SEED_PASSWORD");
if (demoPassword.length < 12) throw new Error("Set DEMO_SEED_PASSWORD to a development-only value with at least 12 characters before seeding.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });

async function demoUser(email: string, name: string, role: "SUPPORTER" | "REQUESTER" | "VOLUNTEER" | "ORGANIZATION_REP" | "MODERATOR") {
  const passwordHash = await hash(demoPassword, 12);
  return prisma.user.upsert({
    where: { email },
    update: { name, role, passwordHash, isSuspended: false, profile: { upsert: { create: { publicName: name }, update: { publicName: name } } }, preferences: { upsert: { create: {}, update: {} } } },
    create: { email, name, role, passwordHash, profile: { create: { publicName: name } }, preferences: { create: {} } },
  });
}

async function main() {
  const [supporter, requester, volunteer, organizationRep, moderator] = await Promise.all([
    demoUser("supporter@impactbridge.demo.test", "Asha Demo", "SUPPORTER"),
    demoUser("requester@impactbridge.demo.test", "Ravi Demo", "REQUESTER"),
    demoUser("volunteer@impactbridge.demo.test", "Meera Demo", "VOLUNTEER"),
    demoUser("organizer@impactbridge.demo.test", "Nila Demo", "ORGANIZATION_REP"),
    demoUser("moderator@impactbridge.demo.test", "Kabir Demo", "MODERATOR"),
  ]);

  const organization = await prisma.organization.upsert({
    where: { slug: "demo-community-collective" },
    update: { ownerId: organizationRep.id, description: "Fictional demonstration organization. Its status is only a test workflow state, not real-world verification.", city: "Pune", state: "Maharashtra", status: "VERIFIED", isDemo: true },
    create: { ownerId: organizationRep.id, name: "Demo Community Collective", slug: "demo-community-collective", description: "Fictional demonstration organization. Its status is only a test workflow state, not real-world verification.", city: "Pune", state: "Maharashtra", status: "VERIFIED", isDemo: true },
  });

  await prisma.organizationMembership.upsert({
    where: { userId_organizationId: { userId: organizationRep.id, organizationId: organization.id } },
    update: { role: "ORGANIZATION_REP" },
    create: { userId: organizationRep.id, organizationId: organization.id, role: "ORGANIZATION_REP" },
  });

  const campaign = await prisma.campaign.upsert({
    where: { slug: "demo-school-meals-pune" },
    update: { title: "Demo: School meals in Pune", description: "Fictional demonstration campaign. No real donations, claims, beneficiaries, or official verifications are represented.", targetAmount: 7500000, status: "ACTIVE", verificationStatus: "VERIFIED", isDemo: true, organizationId: organization.id, createdById: organizationRep.id },
    create: { organizationId: organization.id, createdById: organizationRep.id, title: "Demo: School meals in Pune", slug: "demo-school-meals-pune", description: "Fictional demonstration campaign. No real donations, claims, beneficiaries, or official verifications are represented.", category: "Food security", targetAmount: 7500000, status: "ACTIVE", verificationStatus: "VERIFIED", intendedUse: "Demonstration budget: meals, kitchen supplies, and volunteer coordination.", isDemo: true },
  });

  await prisma.campaignMilestone.upsert({
    where: { id: "00000000-0000-4000-8000-000000000001" },
    update: { campaignId: campaign.id, title: "Demo milestone", description: "Fictional milestone for UI development; it is not evidence of real-world work.", isPublic: true },
    create: { id: "00000000-0000-4000-8000-000000000001", campaignId: campaign.id, title: "Demo milestone", description: "Fictional milestone for UI development; it is not evidence of real-world work.", isPublic: true },
  });

  await prisma.goodsListing.upsert({
    where: { id: "00000000-0000-4000-8000-000000000002" },
    update: { ownerId: supporter.id, title: "Demo: Books for an after-school centre", description: "Fictional listing for development only. No pickup should be attempted.", status: "AVAILABLE", isDemo: true },
    create: { id: "00000000-0000-4000-8000-000000000002", ownerId: supporter.id, title: "Demo: Books for an after-school centre", description: "Fictional listing for development only. No pickup should be attempted.", category: "Books", condition: "Good", quantity: 24, unit: "books", pickupArea: "Bengaluru", status: "AVAILABLE", isDemo: true },
  });

  const report = await prisma.communityReport.upsert({
    where: { id: "00000000-0000-4000-8000-000000000003" },
    update: { authorId: supporter.id, title: "Demo: Streetlight repair request", description: "Fictional community report, not submitted to an authority.", status: "UNDER_REVIEW", isDemo: true },
    create: { id: "00000000-0000-4000-8000-000000000003", authorId: supporter.id, title: "Demo: Streetlight repair request", description: "Fictional community report, not submitted to an authority.", category: "Broken streetlight", severity: 3, approximateArea: "Jaipur", status: "UNDER_REVIEW", isDemo: true },
  });

  await prisma.reportStatusHistory.upsert({
    where: { id: "00000000-0000-4000-8000-000000000004" },
    update: { reportId: report.id, status: "UNDER_REVIEW", note: "Fictional seed history." },
    create: { id: "00000000-0000-4000-8000-000000000004", reportId: report.id, status: "UNDER_REVIEW", note: "Fictional seed history." },
  });

  await prisma.educationRequest.upsert({
    where: { id: "00000000-0000-4000-8000-000000000005" },
    update: { requesterId: requester.id, title: "Demo: Learning materials support", needDescription: "Fictional assistance request without public personal documents.", status: "APPROVED", isDemo: true },
    create: { id: "00000000-0000-4000-8000-000000000005", requesterId: requester.id, title: "Demo: Learning materials support", needDescription: "Fictional assistance request without public personal documents.", educationLevel: "Secondary education", generalLocation: "Kochi", requestedItem: "Textbooks", guardianConsent: true, status: "APPROVED", isDemo: true },
  });

  await prisma.volunteerProfile.upsert({
    where: { userId: volunteer.id },
    update: { skills: ["Teaching", "Translation"], interests: ["Education"], preference: "Remote" },
    create: { userId: volunteer.id, skills: ["Teaching", "Translation"], interests: ["Education"], preference: "Remote" },
  });

  await prisma.volunteerOpportunity.upsert({
    where: { id: "00000000-0000-4000-8000-000000000006" },
    update: { organizationId: organization.id, title: "Demo: Weekend reading mentor", description: "Fictional volunteer opportunity used to exercise the matching workflow.", status: "APPROVED", isDemo: true },
    create: { id: "00000000-0000-4000-8000-000000000006", organizationId: organization.id, title: "Demo: Weekend reading mentor", description: "Fictional volunteer opportunity used to exercise the matching workflow.", requiredSkills: ["Teaching"], capacity: 4, generalLocation: "Remote", isRemote: true, safetyInstructions: "This is seed data only; no activity is scheduled.", status: "APPROVED", isDemo: true },
  });

  await prisma.emergencyRequest.upsert({
    where: { id: "00000000-0000-4000-8000-000000000007" },
    update: { requesterId: requester.id, title: "Demo: Monsoon supply assessment", needDescription: "Fictional report for development; it does not seek emergency services.", status: "UNDER_VERIFICATION", isDemo: true },
    create: { id: "00000000-0000-4000-8000-000000000007", requesterId: requester.id, title: "Demo: Monsoon supply assessment", needDescription: "Fictional report for development; it does not seek emergency services.", category: "Essential supplies", urgency: 4, generalLocation: "Guwahati", status: "UNDER_VERIFICATION", isDemo: true },
  });

  const initialAdminEmail = process.env.INITIAL_ADMIN_EMAIL?.trim().toLowerCase();
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD;
  if (initialAdminEmail && initialAdminPassword) {
    if (initialAdminPassword.length < 12) throw new Error("INITIAL_ADMIN_PASSWORD must have at least 12 characters.");
    const passwordHash = await hash(initialAdminPassword, 12);
    await prisma.user.upsert({
      where: { email: initialAdminEmail },
      update: { role: "ADMIN", passwordHash, isSuspended: false, preferences: { upsert: { create: {}, update: {} } } },
      create: { email: initialAdminEmail, name: "Initial administrator", role: "ADMIN", passwordHash, profile: { create: {} }, preferences: { create: {} } },
    });
  } else if (initialAdminEmail || initialAdminPassword) {
    throw new Error("Set both INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD, or neither.");
  }

  console.log("Seeded clearly labelled fictional demonstration records. No payment or donation was created.");
  console.log(`Demo accounts: ${[supporter, requester, volunteer, organizationRep, moderator].map((user) => user.email).join(", ")}`);
}

main().finally(() => prisma.$disconnect());
