"use server";

import { createHmac } from "node:crypto";
import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clearAdminSession, createAdminSession } from "@/lib/admin/session";

async function throttleKey(): Promise<string> {
  const requestHeaders = await headers();
  const address = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
  return createHmac("sha256", process.env.AUTH_SECRET ?? "admin-unconfigured").update(address.slice(0, 128)).digest("hex");
}

export async function adminSignIn(formData: FormData): Promise<void> {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash || !process.env.AUTH_SECRET) redirect("/admin/login?error=config");

  const key = await throttleKey();
  const now = new Date();
  const previous = await db.adminAuthThrottle.findUnique({ where: { key } });
  if (previous?.lockedUntil && previous.lockedUntil > now) redirect("/admin/login?error=locked");

  const password = formData.get("password");
  const valid = typeof password === "string" && password.length <= 256 && await compare(password, passwordHash);
  if (!valid) {
    const failures = previous?.lockedUntil ? 1 : (previous?.failedCount ?? 0) + 1;
    const lockedUntil = failures >= 5 ? new Date(now.getTime() + 15 * 60_000) : null;
    await db.adminAuthThrottle.upsert({
      where: { key },
      create: { key, failedCount: failures, lockedUntil },
      update: { failedCount: failures, lockedUntil },
    });
    redirect(`/admin/login?error=${lockedUntil ? "locked" : "invalid"}`);
  }

  await db.adminAuthThrottle.deleteMany({ where: { key } });
  await createAdminSession();
  redirect("/admin");
}

export async function adminSignOut(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
