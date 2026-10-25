import "server-only";
import { db } from "@/lib/db";

export type ExploreItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location?: string | null;
  href: string;
  type: "Campaign" | "Goods" | "Community" | "Education" | "Volunteer" | "Emergency";
  isDemo: boolean;
};

const demoCampaigns = [
  { id: "demo-school-meals", slug: "demo-school-meals", title: "Nutritious school meals in Pune", description: "A fictional demonstration campaign showing how a verified project would explain its intended use and updates.", category: "Food security", targetAmount: 7500000, raisedAmount: 2680000, isDemo: true },
  { id: "demo-learning-lab", slug: "demo-learning-lab", title: "Community learning lab", description: "Demonstration content for a local library's devices, books, and digital-skills workshops.", category: "Education", targetAmount: 12000000, raisedAmount: 5410000, isDemo: true },
  { id: "demo-accessible-park", slug: "demo-accessible-park", title: "Accessible neighbourhood park", description: "A fictional example of community-led improvements with public financial evidence.", category: "Community", targetAmount: 4500000, raisedAmount: 1180000, isDemo: true },
];

function canUseDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getHomeData() {
  if (!canUseDatabase()) return { campaigns: demoCampaigns, totals: null, isDemo: true };
  try {
    const client = db();
    const [campaigns, campaignCount, goodsCount, reportsCount, volunteersCount] = await Promise.all([
      client.campaign.findMany({
        where: { status: "ACTIVE", verificationStatus: "VERIFIED" },
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { donations: { where: { status: "CONFIRMED", isSimulated: false }, select: { amount: true } } },
      }),
      client.campaign.count({ where: { status: "ACTIVE", verificationStatus: "VERIFIED" } }),
      client.goodsListing.count({ where: { status: "AVAILABLE" } }),
      client.communityReport.count({ where: { status: { in: ["ACCEPTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"] } } }),
      client.volunteerOpportunity.count({ where: { status: "APPROVED" } }),
    ]);
    return {
      campaigns: campaigns.map((campaign) => ({ ...campaign, raisedAmount: campaign.donations.reduce((sum, donation) => sum + donation.amount, 0) })),
      totals: { campaignCount, goodsCount, reportsCount, volunteersCount },
      isDemo: campaigns.some((campaign) => campaign.isDemo),
    };
  } catch {
    return { campaigns: demoCampaigns, totals: null, isDemo: true };
  }
}

export async function getExploreData(query = "", type = "all", category = "") {
  if (!canUseDatabase()) return demoExplore(query, type, category);
  try {
    const term = query.trim();
    const textFilter = term ? { OR: [{ title: { contains: term, mode: "insensitive" as const } }, { description: { contains: term, mode: "insensitive" as const } }] } : {};
    const client = db();
    const [campaigns, goods, reports, education, opportunities, emergencies] = await Promise.all([
      type === "all" || type === "campaigns" ? client.campaign.findMany({ where: { status: "ACTIVE", verificationStatus: "VERIFIED", ...(category ? { category } : {}), ...textFilter }, take: 24, orderBy: { createdAt: "desc" } }) : [],
      type === "all" || type === "goods" ? client.goodsListing.findMany({ where: { status: "AVAILABLE", ...(category ? { category } : {}), ...textFilter }, take: 24, orderBy: { createdAt: "desc" } }) : [],
      type === "all" || type === "community" ? client.communityReport.findMany({ where: { status: { in: ["ACCEPTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED"] }, ...(category ? { category } : {}), ...textFilter }, take: 24, orderBy: { createdAt: "desc" } }) : [],
      type === "all" || type === "education" ? client.educationRequest.findMany({ where: { status: { in: ["APPROVED", "FUNDING_ACTIVE", "IN_PROGRESS"] }, ...textFilter }, take: 24, orderBy: { createdAt: "desc" } }) : [],
      type === "all" || type === "volunteer" ? client.volunteerOpportunity.findMany({ where: { status: "APPROVED", ...textFilter }, take: 24, orderBy: { createdAt: "desc" } }) : [],
      type === "all" || type === "emergency" ? client.emergencyRequest.findMany({ where: { status: { in: ["VERIFIED_FOR_PUBLICATION", "FUNDING_ACTIVE", "ASSISTANCE_IN_PROGRESS"] }, ...(category ? { category } : {}), ...textFilter }, take: 24, orderBy: [{ urgency: "desc" }, { createdAt: "desc" }] }) : [],
    ]);
    const items: ExploreItem[] = [
      ...campaigns.map((item) => ({ id: item.id, title: item.title, description: item.description, category: item.category, status: item.status, href: `/campaigns/${item.slug}`, type: "Campaign" as const, isDemo: item.isDemo })),
      ...goods.map((item) => ({ id: item.id, title: item.title, description: item.description, category: item.category, status: item.status, location: item.pickupArea, href: `/goods/${item.id}`, type: "Goods" as const, isDemo: item.isDemo })),
      ...reports.map((item) => ({ id: item.id, title: item.title, description: item.description, category: item.category, status: item.status, location: item.approximateArea, href: `/community/reports/${item.id}`, type: "Community" as const, isDemo: item.isDemo })),
      ...education.map((item) => ({ id: item.id, title: item.title, description: item.needDescription, category: item.educationLevel, status: item.status, location: item.generalLocation, href: `/education/${item.id}`, type: "Education" as const, isDemo: item.isDemo })),
      ...opportunities.map((item) => ({ id: item.id, title: item.title, description: item.description, category: item.requiredSkills.join(", ") || "Volunteer", status: item.status, location: item.generalLocation, href: `/volunteer/opportunities/${item.id}`, type: "Volunteer" as const, isDemo: item.isDemo })),
      ...emergencies.map((item) => ({ id: item.id, title: item.title, description: item.needDescription, category: item.category, status: item.status, location: item.generalLocation, href: `/emergency/${item.id}`, type: "Emergency" as const, isDemo: item.isDemo })),
    ];
    return { items, isDemo: items.some((item) => item.isDemo) };
  } catch {
    return demoExplore(query, type, category);
  }
}

function demoExplore(query: string, type: string, category: string) {
  const items: ExploreItem[] = [
    ...demoCampaigns.map((item) => ({ id: item.id, title: item.title, description: item.description, category: item.category, status: "DEMONSTRATION", href: `/campaigns/${item.slug}`, type: "Campaign" as const, isDemo: true })),
    { id: "demo-goods", title: "Books for an after-school centre", description: "Fictional item listing for interface demonstration only.", category: "Books", status: "AVAILABLE", location: "Bengaluru", href: "/goods/demo-goods", type: "Goods", isDemo: true },
    { id: "demo-report", title: "Streetlight repair request", description: "Fictional community report; it has not been sent to an authority.", category: "Public safety", status: "UNDER_REVIEW", location: "Jaipur", href: "/community/reports/demo-report", type: "Community", isDemo: true },
    { id: "demo-education", title: "Learning materials support", description: "Fictional assistance request with no public personal documents.", category: "Secondary education", status: "PENDING_REVIEW", location: "Kochi", href: "/education/demo-education", type: "Education", isDemo: true },
    { id: "demo-volunteer", title: "Weekend reading mentor", description: "Fictional volunteer opportunity for skilled reading support.", category: "Teaching", status: "APPROVED", location: "Remote", href: "/volunteer/opportunities/demo-volunteer", type: "Volunteer", isDemo: true },
    { id: "demo-emergency", title: "Monsoon supply assessment", description: "Fictional emergency report awaiting verification — not a request for emergency services.", category: "Essential supplies", status: "UNDER_VERIFICATION", location: "Guwahati", href: "/emergency/demo-emergency", type: "Emergency", isDemo: true },
  ];
  const filtered = items.filter((item) => (type === "all" || item.type.toLowerCase().startsWith(type.slice(0, -1))) && (!category || item.category === category) && (!query || `${item.title} ${item.description}`.toLowerCase().includes(query.toLowerCase())));
  return { items: filtered, isDemo: true };
}

export async function getCampaign(slug: string) {
  if (!canUseDatabase()) return demoCampaigns.find((item) => item.slug === slug) ?? null;
  try {
    return await db().campaign.findFirst({
      where: { slug, status: "ACTIVE", verificationStatus: "VERIFIED" },
      include: {
        organization: { select: { name: true, slug: true, status: true } },
        milestones: { where: { isPublic: true }, orderBy: { reachedAt: "desc" } },
        donations: { where: { status: "CONFIRMED", isSimulated: false }, select: { amount: true } },
      },
    });
  } catch { return demoCampaigns.find((item) => item.slug === slug) ?? null; }
}

export async function getTransparency(campaignId: string) {
  if (!canUseDatabase()) return null;
  try {
    return await db().campaign.findFirst({
      where: { id: campaignId, status: "ACTIVE", verificationStatus: "VERIFIED" },
      include: {
        ledgerEntries: { where: { isSimulated: false }, orderBy: { occurredAt: "desc" }, take: 100 },
        expenses: { where: { status: "APPROVED" }, include: { evidence: { where: { isPublic: true }, select: { redactedUrl: true } } }, orderBy: { transactionDate: "desc" }, take: 100 },
      },
    });
  } catch { return null; }
}
