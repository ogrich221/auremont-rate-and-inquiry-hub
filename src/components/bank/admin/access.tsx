import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, ShieldCheck, ArrowRight, LockKeyhole, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getAdministratorAccess, recordAdminEvent } from "@/lib/central-admin.functions";
import { Emblem, Brand } from "../shell";
export function AdminLoading({
  text = "Preparing Your Secure Banking Workspace…",
}: {
  text?: string;
}) {
  return (
    <div className="admin-loading" role="status">
      <Emblem />
      <h2>AUREMONT TRUST BANK</h2>
      <span className="admin-loading-ring" />
      <p>{text}</p>
    </div>
  );
}
export async function verifyAdminCode(code: string) {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  const factor = data.totp.find((f) => f.status === "verified");
  if (!factor) throw new Error("Set up your authenticator before continuing.");
  const result = await supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (result.error) throw new Error("The verification code is incorrect or expired.");
}
export function AdminLogin() {
  const [stage, setStage] = useState<"checking" | "login" | "mfa" | "denied">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [setup, setSetup] = useState<{ id: string; qr: string } | null>(null);
  const access = useServerFn(getAdministratorAccess);
  const event = useServerFn(recordAdminEvent);
  const navigate = useNavigate();
  const client = useQueryClient();
  async function check() {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setStage("login");
      return;
    }
    const a = await access();
    if (!a.primary || !a.role) {
      setStage("denied");
      return;
    }
    if (a.allowed) {
      await event({ data: { event: "Workspace opened" } });
      await navigate({ to: "/admin" });
      return;
    }
    setStage("mfa");
  }
  useEffect(() => {
    void check().catch(() => setStage("login"));
  }, []);
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(fd.get("email")),
        password: String(fd.get("password")),
      });
      if (error) throw new Error("Email or password not recognized.");
      await check();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  async function enroll() {
    setBusy(true);
    setError("");
    try {
      const factors = await supabase.auth.mfa.listFactors();
      if (factors.error) throw factors.error;
      for (const f of factors.data.all.filter(
        (f) => f.factor_type === "totp" && f.status === "unverified",
      ))
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "Auremont administrator",
      });
      if (error) throw error;
      setSetup({ id: data.id, qr: data.totp.qr_code });
    } catch (e) {
      setError("Authenticator setup could not start. Try again.");
    } finally {
      setBusy(false);
    }
  }
  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const code = String(new FormData(e.currentTarget).get("code"));
    try {
      if (setup) {
        const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: setup.id, code });
        if (error) throw new Error("Invalid verification code.");
      } else await verifyAdminCode(code);
      await check();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed.");
    } finally {
      setBusy(false);
    }
  }
  async function signout() {
    await client.cancelQueries();
    client.clear();
    await supabase.auth.signOut();
    setSetup(null);
    setError("");
    setStage("login");
  }
  if (stage === "checking") return <AdminLoading />;
  return (
    <div className="admin-access">
      <div className="admin-access-brand">
        <Brand />
        <span>PRIVATE ADMINISTRATION</span>
      </div>
      <div className="admin-access-body">
        <div className="admin-access-seal">
          <Emblem />
        </div>
        <span className="eyebrow">CENTRAL ADMINISTRATION</span>
        <h1>Administrator Access</h1>
        <p className="admin-access-intro">One identity. One secure workspace.</p>
        {stage === "login" && (
          <form onSubmit={login}>
            <div className="field">
              <label htmlFor="admin-email">Administrator email</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                maxLength={255}
              />
            </div>
            <div className="field">
              <label htmlFor="admin-password">Password</label>
              <div className="admin-password">
                <input
                  id="admin-password"
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  maxLength={128}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow(!show)}
                >
                  {show ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <Link className="admin-forgot" to="/reset-password">
              Forgot password?
            </Link>
            <Button className="admin-login-submit" disabled={busy}>
              <LockKeyhole />
              {busy ? "Signing in…" : "Secure Sign In"}
              <ArrowRight />
            </Button>
          </form>
        )}
        {stage === "mfa" && (
          <>
            <h3>Multi-factor verification</h3>
            {setup && (
              <img className="admin-qr" src={setup.qr} alt="Authenticator enrollment QR code" />
            )}
            <form onSubmit={verify}>
              <div className="field">
                <label htmlFor="admin-code">Authenticator code</label>
                <input
                  id="admin-code"
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  minLength={6}
                  autoComplete="one-time-code"
                  required
                />
              </div>
              <Button disabled={busy}>
                Verify & Continue <ArrowRight />
              </Button>
            </form>
            {!setup && (
              <Button variant="link" disabled={busy} onClick={enroll}>
                Set up authenticator
              </Button>
            )}
            <Button variant="ghost" onClick={signout}>
              <LogOut />
              Sign out
            </Button>
          </>
        )}
        {stage === "denied" && (
          <>
            <div className="admin-access-denied">
              <ShieldCheck />
              <h3>Administrator approval required</h3>
              <p>
                This account is not the designated primary administrator. No customer records are
                accessible.
              </p>
            </div>
            <Button variant="outline" onClick={signout}>
              Use another account
            </Button>
          </>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="admin-access-security">
          <ShieldCheck />
          <p>Authorized access only. All administrative activities are protected and recorded.</p>
        </div>
        <div className="admin-access-demo">
          Demonstration administration · No real banking operations
        </div>
      </div>
      <Link className="admin-access-back" to="/">
        ← Return to Auremont
      </Link>
    </div>
  );
}
