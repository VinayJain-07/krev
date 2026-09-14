import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireApiUser, updateUser } = vi.hoisted(() => ({
  requireApiUser: vi.fn(),
  updateUser: vi.fn(),
}));

vi.mock("@/lib/auth-helpers", () => ({ requireApiUser }));
vi.mock("@/lib/db", () => ({ db: { user: { update: updateUser } } }));

import { POST } from "./route";

describe("POST /api/settings/token-usage/reset", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("requires a signed-in user", async () => {
    requireApiUser.mockResolvedValue(null);

    const response = await POST();

    expect(response.status).toBe(401);
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("resets only the signed-in user's usage counter", async () => {
    requireApiUser.mockResolvedValue({ id: "user-123" });
    updateUser.mockResolvedValue({ tokenUsed: 0 });

    const response = await POST();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ tokenUsed: 0 });
    expect(updateUser).toHaveBeenCalledWith({
      where: { id: "user-123" },
      data: { tokenUsed: 0 },
      select: { tokenUsed: true },
    });
  });
});
