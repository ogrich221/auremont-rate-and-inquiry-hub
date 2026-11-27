import type { ReactNode } from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const mocks = vi.hoisted(() => ({
  signup: vi.fn(), session: vi.fn(), access: vi.fn(), event: vi.fn(), navigate: vi.fn(),
}));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
  useNavigate: () => mocks.navigate,
}));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@tanstack/react-query", () => ({ useQueryClient: () => ({ cancelQueries: vi.fn(), clear: vi.fn() }) }));
vi.mock("@/components/bank/shell", () => ({ Emblem: () => null, Brand: () => null }));
vi.mock("@/lib/central-admin.functions", () => ({ getAdministratorAccess: mocks.access, recordAdminEvent: mocks.event }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { auth: { getSession: mocks.session, signUp: mocks.signup } },
}));
import { AdminLogin } from "@/components/bank/admin/access";

async function registrationForm() {
  render(<AdminLogin />);
  fireEvent.click(await screen.findByRole("button", { name: "Register administrator email" }));
  fireEvent.change(screen.getByLabelText("Administrator email"), { target: { value: "skybridgeairline@gmail.com" } });
  fireEvent.change(screen.getByLabelText("Password", { exact: true }), { target: { value: "Only-A-Test-Password-2026!" } });
  fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "Only-A-Test-Password-2026!" } });
}

describe("Designated administrator registration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.session.mockResolvedValue({ data: { session: null } });
    mocks.signup.mockResolvedValue({ data: { session: null }, error: null });
  });
  afterEach(cleanup);

  it("registers the chosen email without requesting client-controlled roles", async () => {
    await registrationForm();
    fireEvent.click(screen.getByRole("button", { name: /^Register Administrator Email$/ }));
    await waitFor(() => expect(mocks.signup).toHaveBeenCalledOnce());
    expect(mocks.signup).toHaveBeenCalledWith({
      email: "skybridgeairline@gmail.com",
      password: "Only-A-Test-Password-2026!",
      options: { emailRedirectTo: window.location.origin + "/admin-login" },
    });
  });

  it("does not open administration before email confirmation supplies a session", async () => {
    await registrationForm();
    fireEvent.click(screen.getByRole("button", { name: /^Register Administrator Email$/ }));
    await waitFor(() => expect(mocks.signup).toHaveBeenCalledOnce());
    await waitFor(() => expect(screen.getByRole("button", { name: /^Register Administrator Email$/ })).not.toBeDisabled());
    expect(mocks.access).not.toHaveBeenCalled();
    expect(mocks.event).not.toHaveBeenCalled();
    expect(mocks.navigate).not.toHaveBeenCalled();
  });

  it("rejects mismatched passwords before account creation", async () => {
    await registrationForm();
    fireEvent.change(screen.getByLabelText("Confirm password"), { target: { value: "Different-Test-Password" } });
    fireEvent.click(screen.getByRole("button", { name: /^Register Administrator Email$/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Register Administrator Email$/ })).not.toBeDisabled());
    expect(mocks.signup).not.toHaveBeenCalled();
  });

  it("strictly restricts registration to the solo admin email", async () => {
    await registrationForm();
    fireEvent.change(screen.getByLabelText("Administrator email"), { target: { value: "unauthorized@gmail.com" } });
    fireEvent.click(screen.getByRole("button", { name: /^Register Administrator Email$/ }));
    await waitFor(() => expect(screen.getByRole("button", { name: /^Register Administrator Email$/ })).not.toBeDisabled());
    expect(mocks.signup).not.toHaveBeenCalled();
    expect(await screen.findByText(/strictly restricted to skybridgeairline@gmail\.com/i)).toBeDefined();
  });
});