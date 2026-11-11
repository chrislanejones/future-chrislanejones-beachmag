import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.fn();
const revalidatePath = vi.fn();
const isSiteOwner = vi.fn();

vi.mock("@clerk/nextjs/server", () => ({ auth: () => auth() }));
vi.mock("next/cache", () => ({ revalidatePath: (...a: unknown[]) => revalidatePath(...a) }));
vi.mock("@/lib/owner-policy", () => ({ isSiteOwner: (id: unknown) => isSiteOwner(id) }));

const { POST } = await import("./route");

describe("POST /api/revalidate", () => {
  beforeEach(() => {
    auth.mockReset();
    revalidatePath.mockReset();
    isSiteOwner.mockReset();
  });

  it("refuses a visitor who is not signed in, and refreshes nothing", async () => {
    auth.mockResolvedValue({ userId: null });
    const res = await POST();
    expect(res.status).toBe(403);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("refuses a signed-in user who is not the site owner", async () => {
    auth.mockResolvedValue({ userId: "user_stranger" });
    isSiteOwner.mockReturnValue(false);
    const res = await POST();
    expect(res.status).toBe(403);
    expect(isSiteOwner).toHaveBeenCalledWith("user_stranger");
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("refreshes the whole site for the owner", async () => {
    auth.mockResolvedValue({ userId: "user_owner" });
    isSiteOwner.mockReturnValue(true);
    const res = await POST();
    expect(res.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledExactlyOnceWith("/", "layout");
  });
});
