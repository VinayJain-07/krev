import "server-only";
import { db } from "@/lib/db";

export async function recordLogin(userId: string, provider: string) {
  try {
    await db.activityEvent.create({ data: { userId, kind: "LOGIN", detail: provider.slice(0, 40) } });
  } catch (error) {
    console.error("Could not record login activity", error);
  }
}

export async function recordCompanyCreated(userId: string, companyId: string) {
  try {
    await db.activityEvent.create({ data: { userId, companyId, kind: "COMPANY_CREATED" } });
  } catch (error) {
    console.error("Could not record company activity", error);
  }
}

export async function recordCompanyView(userId: string, companyId: string) {
  try {
    const recent = await db.activityEvent.findFirst({
      where: { userId, companyId, kind: "COMPANY_VIEWED", createdAt: { gte: new Date(Date.now() - 5 * 60_000) } },
      select: { id: true },
    });
    if (!recent) await db.activityEvent.create({ data: { userId, companyId, kind: "COMPANY_VIEWED" } });
  } catch (error) {
    console.error("Could not record company view", error);
  }
}
