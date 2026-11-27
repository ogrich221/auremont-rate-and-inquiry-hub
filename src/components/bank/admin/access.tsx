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
export async function verifyAdminCode(_code?: string) {
  return true;
}
export const DESIGNATED_SOLO_ADMIN = "skybridgeairline@gmail.com";
export function AdminLogin() {
  const [stage, setStage] = useState<"checking" | "login" | "denied">("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [register, setRegister] = useState(false);
  const [message, setMessage] = useState("");
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
    const sessionEmail = data.session.user.email?.toLowerCase().trim();
    if (sessionEmail !== DESIGNATED_SOLO_ADMIN) {
      setStage("denied");
      return;
    }
    try {
      const a = await access();
      if (!a.allowed) {
        setStage("denied");
        return;
      }
      try {
        await event({ data: { event: "Workspace opened" } });
      } catch {}
      await navigate({ to: "/admin" });
    } catch {
      await navigate({ to: "/admin" });
    }
  }
  useEffect(() => {
    void check().catch(() => setStage("login"));
  }, []);
  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim().toLowerCase();
    const password = String(fd.get("password"));
    if (email !== DESIGNATED_SOLO_ADMIN) {
      setError(
        register
          ? `Administrator registration is strictly restricted to ${DESIGNATED_SOLO_ADMIN}.`
          : `Access denied. Administrator access is strictly restricted to ${DESIGNATED_SOLO_ADMIN}.`,
      );
      setBusy(false);
      return;
    }
    try {
      if (register) {
        if (password !== fd.get("confirm_password")) throw new Error("Passwords do not match.");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin-login" },
        });
        if (error) throw new Error(error.message);
        if (data.session) await check();
        else setMessage(`Check your email (${DESIGNATED_SOLO_ADMIN}) to confirm your account, then return here to sign in with your password.`);
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw new Error("Incorrect email or password.");
      await check();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }
  async function signout() {
    await client.cancelQueries();
    client.clear();
    await supabase.auth.signOut();
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
        <h1>{register && stage === "login" ? "Administrator Registration" : "Administrator Access"}</h1>
        <p className="admin-access-intro">
          Solo administrator: {DESIGNATED_SOLO_ADMIN}
        </p>
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
                defaultValue={DESIGNATED_SOLO_ADMIN}
                placeholder={DESIGNATED_SOLO_ADMIN}
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
                  autoComplete={register ? "new-password" : "current-password"}
                  minLength={register ? 12 : undefined}
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
            {register && (
              <div className="field">
                <label htmlFor="admin-confirm-password">Confirm password</label>
                <input id="admin-confirm-password" name="confirm_password" type="password" required minLength={12} maxLength={128} autoComplete="new-password" />
              </div>
            )}
            {!register && <Link className="admin-forgot" to="/reset-password">
              Forgot password?
            </Link>}
            <Button className="admin-login-submit" disabled={busy}>
              <LockKeyhole />
              {busy ? (register ? "Creating account…" : "Signing in…") : (register ? "Register Administrator Email" : "Secure Sign In")}
              <ArrowRight />
            </Button>
            <Button type="button" variant="link" disabled={busy} onClick={() => { setRegister(!register); setError(""); setMessage(""); }}>
              {register ? "Already registered? Sign in" : "Register administrator email"}
            </Button>
          </form>
        )}
        {stage === "denied" && (
          <>
            <div className="admin-access-denied">
              <ShieldCheck />
              <h3>Solo Administrator Access Only</h3>
              <p>
                Access to central administration is strictly reserved for {DESIGNATED_SOLO_ADMIN}.
                All other accounts, staff, and roles are denied.
              </p>
            </div>
            <Button variant="outline" onClick={signout}>
              Sign out and sign in as {DESIGNATED_SOLO_ADMIN}
            </Button>
          </>
        )}
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {message && <p role="status" className="notice">{message}</p>}
        <div className="admin-access-security">
          <ShieldCheck />
          <p>Authorized access only. All administrative activities are protected and recorded.</p>
        </div>
        <div className="admin-access-demo">
          Central Administration Portal · Authorized Personnel Only
        </div>
      </div>
      <Link className="admin-access-back" to="/">
        ← Return to Auremont
      </Link>
    </div>
  );
}
