import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { auth } from "@/auth";

const cookieName = "sc_admin_session";
const lifetimeSeconds = 8 * 60 * 60;

function signature(payload: string): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "smark-connect-admin-secret-fallback";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || process.env.ADMIN_PASSWORD || "smark-admin-default-key";
  return createHmac("sha256", secret).update(`smark-admin-v1:${passwordHash}:${payload}`).digest("base64url");
}

export async function hasAdminSession(): Promise<boolean> {
  // 1. Check direct admin cookie session
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(cookieName)?.value;
    if (value) {
      const [expiresText, nonce, actual, extra] = value.split(".");
      if (!extra && /^\d{13}$/.test(expiresText ?? "") && /^[0-9a-f]{32}$/.test(nonce ?? "") && actual) {
        const expires = Number(expiresText);
        if (expires > Date.now() && expires <= Date.now() + lifetimeSeconds * 1000) {
          const expected = signature(`${expiresText}.${nonce}`);
          if (expected) {
            const actualBytes = Buffer.from(actual);
            const expectedBytes = Buffer.from(expected);
            if (actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes)) {
              return true;
            }
          }
        }
      }
    }
  } catch {}

  // 2. Check active NextAuth user session for admin credentials
  try {
    const session = await auth();
    if (session?.user?.email) {
      const email = session.user.email.toLowerCase();
      const adminEmails = (process.env.ADMIN_EMAILS ?? "vinay@thesmarketers.com,demo@thesmarketers.com")
        .toLowerCase()
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      if (adminEmails.includes(email)) {
        return true;
      }
    }
  } catch {}

  return false;
}

export async function createAdminSession(): Promise<void> {
  const expires = Date.now() + lifetimeSeconds * 1000;
  const payload = `${expires}.${randomBytes(16).toString("hex")}`;
  const signed = signature(payload);
  const cookieStore = await cookies();
  cookieStore.set(cookieName, `${payload}.${signed}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: lifetimeSeconds,
  });
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}
