import { describe, expect, it, vi, beforeEach } from "vitest";
import { hasAdminSession, createAdminSession, clearAdminSession } from "./session";

vi.mock("server-only", () => ({}));

const mockCookies = new Map<string, string>();
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => (mockCookies.has(name) ? { value: mockCookies.get(name) } : undefined),
    set: (name: string, value: string) => mockCookies.set(name, value),
    delete: (name: string) => mockCookies.delete(name),
  })),
}));

let mockAuthSession: any = null;
vi.mock("@/auth", () => ({
  auth: vi.fn(async () => mockAuthSession),
}));

describe("admin session management", () => {
  beforeEach(() => {
    mockCookies.clear();
    mockAuthSession = null;
  });

  it("returns false when no session cookie or auth session exists", async () => {
    const hasSession = await hasAdminSession();
    expect(hasSession).toBe(false);
  });

  it("creates an admin session cookie that verifies successfully", async () => {
    await createAdminSession();
    expect(mockCookies.has("sc_admin_session")).toBe(true);

    const hasSession = await hasAdminSession();
    expect(hasSession).toBe(true);
  });

  it("clears the admin session cookie cleanly", async () => {
    await createAdminSession();
    expect(await hasAdminSession()).toBe(true);

    await clearAdminSession();
    expect(await hasAdminSession()).toBe(false);
  });

  it("grants admin session automatically to authenticated admin users", async () => {
    mockAuthSession = {
      user: { email: "vinay@thesmarketers.com", name: "Vinay" },
    };
    const hasSession = await hasAdminSession();
    expect(hasSession).toBe(true);
  });

  it("denies admin access to non-admin users without cookie", async () => {
    mockAuthSession = {
      user: { email: "random-user@example.com", name: "Random User" },
    };
    const hasSession = await hasAdminSession();
    expect(hasSession).toBe(false);
  });
});
