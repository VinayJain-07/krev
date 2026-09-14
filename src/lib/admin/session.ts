import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const cookieName = "sc_admin_session";
const lifetimeSeconds = 8 * 60 * 60;

function signature(payload: string): string | null {
  const secret = process.env.AUTH_SECRET;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!secret || !passwordHash) return null;
  return createHmac("sha256", secret).update(`smark-admin-v1:${passwordHash}:${payload}`).digest("base64url");
}

export async function hasAdminSession(): Promise<boolean> {
  const value = (await cookies()).get(cookieName)?.value;
  if (!value) return false;
  const [expiresText, nonce, actual, extra] = value.split(".");
  if (extra || !/^\d{13}$/.test(expiresText ?? "") || !/^[0-9a-f]{32}$/.test(nonce ?? "") || !actual) return false;
  const expires = Number(expiresText);
  if (expires <= Date.now() || expires > Date.now() + lifetimeSeconds * 1000) return false;
  const expected = signature(`${expiresText}.${nonce}`);
  if (!expected) return false;
  const actualBytes = Buffer.from(actual);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export async function createAdminSession(): Promise<void> {
  const expires = Date.now() + lifetimeSeconds * 1000;
  const payload = `${expires}.${randomBytes(16).toString("hex")}`;
  const signed = signature(payload);
  if (!signed) throw new Error("Admin access is not configured.");
  (await cookies()).set(cookieName, `${payload}.${signed}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: lifetimeSeconds,
  });
}

export async function clearAdminSession(): Promise<void> {
  (await cookies()).delete(cookieName);
}
