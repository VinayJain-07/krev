import { describe, expect, it } from "vitest";
import { buildAdminActivityFeed } from "./feed";

describe("buildAdminActivityFeed", () => {
  it("merges registrations, company additions, and tracked activity newest first", () => {
    const feed = buildAdminActivityFeed({
      registrations: [{ id: "user-1", name: "Asha", email: "asha@example.com", createdAt: new Date("2026-10-10T08:00:00Z") }],
      companies: [{ id: "company-1", name: "Acme", normalizedDomain: "acme.example", createdAt: new Date("2026-10-10T09:00:00Z"), user: { name: "Asha", email: "asha@example.com" } }],
      trackedEvents: [{ id: "login-1", kind: "LOGIN", detail: "credentials", createdAt: new Date("2026-10-10T10:00:00Z"), user: { name: "Asha", email: "asha@example.com" }, company: null }],
    });

    expect(feed.map((event) => event.kind)).toEqual(["LOGIN", "COMPANY_CREATED", "REGISTERED"]);
    expect(feed[1]?.company?.name).toBe("Acme");
  });

  it("limits the combined feed after sorting", () => {
    const feed = buildAdminActivityFeed({
      registrations: [
        { id: "older", name: null, email: "older@example.com", createdAt: new Date("2026-10-09T08:00:00Z") },
        { id: "newer", name: null, email: "newer@example.com", createdAt: new Date("2026-10-10T08:00:00Z") },
      ],
      companies: [],
      trackedEvents: [],
      limit: 1,
    });

    expect(feed).toHaveLength(1);
    expect(feed[0]?.user.email).toBe("newer@example.com");
  });
});
