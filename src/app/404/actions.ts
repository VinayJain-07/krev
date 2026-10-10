"use server";

import { createHmac } from "node:crypto";
import { compare } from "bcryptjs";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { clearAdminSession, createAdminSession } from "@/lib/admin/session";

async function throttleKey(): Promise<string> {
  try {
    const requestHeaders = await headers();
    const address = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || requestHeaders.get("x-real-ip") || "unknown";
    return createHmac("sha256", process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "admin-unconfigured").update(address.slice(0, 128)).digest("hex");
  } catch {
    return "unknown";
  }
}

function isRedirectError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("digest" in error)) return false;
  return typeof error.digest === "string" && error.digest.startsWith("NEXT_REDIRECT");
}

export async function fourOhFourSignIn(formData: FormData): Promise<void> {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!passwordHash && !adminPassword) redirect("/404/login?error=config");

  let key = "";
  let previous: { failedCount: number; lockedUntil: Date | null } | null = null;
  const now = new Date();

  try {
    key = await throttleKey();
    previous = await db.adminAuthThrottle.findUnique({ where: { key } });
    if (previous?.lockedUntil && previous.lockedUntil > now) {
      redirect("/404/login?error=locked");
    }
  } catch (error: unknown) {
    if (isRedirectError(error)) throw error;
  }

  const password = formData.get("password");
  let valid = false;

  if (typeof password === "string" && password.length <= 256) {
    // 1. Check bcrypt hash if provided
    if (passwordHash) {
      try {
        valid = await compare(password, passwordHash);
      } catch {}
    }
    // 2. Check plaintext ADMIN_PASSWORD if provided
    if (!valid && adminPassword) {
      valid = password === adminPassword;
    }
  }

  if (!valid) {
    if (key) {
      try {
        const failures = previous?.lockedUntil ? 1 : (previous?.failedCount ?? 0) + 1;
        const lockedUntil = failures >= 5 ? new Date(now.getTime() + 15 * 60_000) : null;
        await db.adminAuthThrottle.upsert({
          where: { key },
          create: { key, failedCount: failures, lockedUntil },
          update: { failedCount: failures, lockedUntil },
        });
        redirect(`/404/login?error=${lockedUntil ? "locked" : "invalid"}`);
      } catch (error: unknown) {
        if (isRedirectError(error)) throw error;
      }
    }
    redirect("/404/login?error=invalid");
  }

  if (key) {
    try {
      await db.adminAuthThrottle.deleteMany({ where: { key } });
    } catch {}
  }

  await createAdminSession();
  redirect("/404");
}

export async function fourOhFourSignOut(): Promise<void> {
  await clearAdminSession();
  redirect("/404/login");
}
