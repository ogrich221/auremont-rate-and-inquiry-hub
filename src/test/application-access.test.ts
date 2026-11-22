import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  auth: Symbol("required authentication"),
  list: vi.fn(() => []),
  update: vi.fn(() => ({ status: "APPROVED" })),
}));

vi.mock("@/integrations/supabase/auth-middleware", () => ({
  requireSupabaseAuth: mocks.auth,
}));
vi.mock("@/lib/application.server", () => ({
  getAllApplications: mocks.list,
  updateApplicationReview: mocks.update,
}));
// Run the real validators and handlers; require the auth middleware to be
// registered and simulate its verified context, without reading private files.
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let middleware: unknown[] = [];
    let validate = (input: unknown): unknown => input;
    const builder = {
      middleware(value: unknown[]) {
        middleware = value;
        return builder;
      },
      inputValidator(value: typeof validate) {
        validate = value;
        return builder;
      },
      handler(fn: (arg: { context: unknown; data: unknown }) => unknown) {
        return async (arg: { context?: unknown; data?: unknown } = {}) => {
          expect(middleware).toContain(mocks.auth);
          if (!arg.context) throw new Error("Unauthorized");
          return fn({ context: arg.context, data: validate(arg.data) });
        };
      },
    };
    return builder;
  },
}));

import {
  getAdminApplicationsListFn,
  updateApplicationDecisionFn,
} from "@/lib/application.functions";

type TestContext = { userId: string; supabase: { rpc: ReturnType<typeof vi.fn> } };
// Production calls obtain context exclusively through the auth middleware.
const list = getAdminApplicationsListFn as unknown as (args?: {
  context: TestContext;
}) => Promise<unknown>;
const update = updateApplicationDecisionFn as unknown as (args: {
  context?: TestContext;
  data: unknown;
}) => Promise<unknown>;
const decision = {
  referenceNumber: "ATB-2026-TEST1",
  newStatus: "APPROVED",
  decisionNote: "Review completed",
  actor: "Forged administrator",
};
const context = (allowed: boolean): TestContext => ({
  userId: "verified-administrator-id",
  supabase: {
    rpc: vi.fn().mockResolvedValue({ error: allowed ? null : { message: "Forbidden" } }),
  },
});

describe("Legacy application administrator access", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects anonymous listing and decisions before touching records", async () => {
    await expect(list()).rejects.toThrow("Unauthorized");
    await expect(update({ data: decision })).rejects.toThrow("Unauthorized");
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it.each([
    "ordinary applicant",
    "non-designated administrator",
    "administrator without multi-factor verification",
  ])("rejects %s when the database guard denies access", async () => {
    const caller = context(false);
    await expect(list({ context: caller })).rejects.toThrow("Administrator verification required");
    await expect(update({ context: caller, data: decision })).rejects.toThrow(
      "Administrator verification required",
    );
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });

  it("allows listing only after the designated-administrator guard succeeds", async () => {
    const caller = context(true);
    await expect(list({ context: caller })).resolves.toEqual({ applications: [] });
    expect(caller.supabase.rpc).toHaveBeenCalledWith("require_primary_administrator", {
      recent: false,
    });
    expect(mocks.list).toHaveBeenCalledOnce();
  });

  it("requires recent verification for decisions and ignores forged audit actors", async () => {
    const caller = context(true);
    await update({ context: caller, data: decision });
    expect(caller.supabase.rpc).toHaveBeenCalledWith("require_primary_administrator", {
      recent: true,
    });
    expect(mocks.update).toHaveBeenCalledWith(
      decision.referenceNumber,
      "APPROVED",
      decision.decisionNote,
      caller.userId,
    );
  });

  it("fails closed when the administrator check fails", async () => {
    const caller = context(true);
    caller.supabase.rpc.mockRejectedValue(new Error("Access check unavailable"));
    await expect(list({ context: caller })).rejects.toThrow("Access check unavailable");
    await expect(update({ context: caller, data: decision })).rejects.toThrow(
      "Access check unavailable",
    );
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.update).not.toHaveBeenCalled();
  });
});
