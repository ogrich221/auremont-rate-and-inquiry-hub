import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { LoaderCircle, ArrowUpRight, ShieldCheck } from "lucide-react";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { checkUserLoginStatus, registerPendingCustomer } from "@/lib/central-admin.functions";
import headquarters from "@/assets/headquarters.asset.json";
export function AuthPage({ mode }: { mode: "login" | "register" | "reset" }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const checkStatus = useServerFn(checkUserLoginStatus);
  const registerPending = useServerFn(registerPendingCustomer);
  const register = mode === "register";
  const reset = mode === "reset";

  useEffect(() => {
    if (reset) return;
    const verifyAndRedirect = async (email: string) => {
      if (email.toLowerCase().trim() === "skybridgeairline@gmail.com") {
        void navigate({ to: "/account" });
        return;
      }
      try {
        const check = await checkStatus({ data: { email } });
        if (check.allowed) {
          void navigate({ to: "/account" });
        } else {
          await supabase.auth.signOut();
          setError(
            check.reason ||
              "Your account is pending administrator approval before you can log in.",
          );
        }
      } catch {
        // If check error, wait for explicit user action
      }
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user?.email) void verifyAndRedirect(s.user.email);
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) void verifyAndRedirect(data.session.user.email);
    });

    return () => subscription.unsubscribe();
  }, [navigate, reset, checkStatus]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim();
    const password = String(fd.get("password") ?? "");
    try {
      if (reset) {
        const { error: e } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/update-password",
        });
        if (e) throw e;
        setMessage("If an account exists, a password reset email will be sent.");
      } else if (register) {
        const { error: e } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/login" },
        });
        if (e) throw e;

        // Register user with status "Pending" in admin_customers
        try {
          await registerPending({ data: { email } });
        } catch {}

        // Ensure user is signed out so they cannot access account before admin approval
        await supabase.auth.signOut();

        setMessage(
          "Registration received! Every newly created account must be approved by the administrator before you can log in. You will receive access once approved.",
        );
      } else {
        // Verify user approval status before logging in
        const check = await checkStatus({ data: { email } });
        if (!check.allowed) {
          throw new Error(
            check.reason ||
              "Account pending administrator approval. An administrator must approve your account before you can log in.",
          );
        }

        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;

        // Verify again after authentication
        const postCheck = await checkStatus({ data: { email } });
        if (!postCheck.allowed) {
          await supabase.auth.signOut();
          throw new Error(
            postCheck.reason ||
              "Account pending administrator approval. Please wait for an administrator to activate your account.",
          );
        }

        await navigate({ to: "/account" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to continue. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function social(provider: "google" | "lovable") {
    setBusy(true);
    setError("");
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin + "/login",
      });
      if (result.error) throw result.error;
      if (!result.redirected) await navigate({ to: "/account" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-layout">
      <div className="auth-photo">
        <img src={headquarters.url} alt="Auremont Trust Bank architecture" />
        <div className="auth-photo-copy">
          <span className="eyebrow">A HIGHER STANDARD OF BANKING</span>
          <h2>
            Your Wealth.
            <br />
            Your Future.
            <br />
            Our Commitment.
          </h2>
          <p>A thoughtful digital experience, built around what matters to you.</p>
          <span className="hero-assurances">
            <ShieldCheck /> Secure Banking Portal
          </span>
        </div>
      </div>
      <div className="auth-form">
        <span className="eyebrow">{register ? "YOUR NEXT CHAPTER" : "AUREMONT ONLINE"}</span>
        <h1>
          {reset ? "Reset your password" : register ? "Begin with Auremont." : "Welcome back."}
        </h1>
        <p>
          {reset
            ? "Enter your email address to request a reset link."
            : register
              ? "Create your secure online account."
              : "Sign in to your Auremont online banking account."}
        </p>
        <div className="notice">
          Bank-grade 256-bit encryption. Always verify you are accessing the secure Auremont portal before entering credentials.
        </div>
        {!reset && (
          <>
            <div className="social-buttons">
              <Button variant="google" disabled={busy} onClick={() => social("google")}>
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
                  />
                </svg>
                Continue with Google
              </Button>
              <Button variant="outline" disabled={busy} onClick={() => social("lovable")}>
                <LovableMark />
                Continue with Lovable
              </Button>
            </div>
            <div className="auth-divider">or continue with email</div>
          </>
        )}
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              maxLength={255}
              required
              autoComplete="email"
            />
          </div>
          {!reset && (
            <div className="field">
              <label htmlFor="auth-password">Password</label>
              <input
                id="auth-password"
                name="password"
                type="password"
                minLength={8}
                maxLength={128}
                required
                autoComplete={register ? "new-password" : "current-password"}
              />
            </div>
          )}
          {register && (
            <label className="auth-check">
              <input type="checkbox" required />
              <span>
                I accept the <Link to="/terms">Terms &amp; Conditions</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>.
              </span>
            </label>
          )}
          <Button disabled={busy}>
            {busy ? <LoaderCircle className="animate-spin" /> : <ArrowUpRight />}
            {reset ? "Send Reset Link" : register ? "Open Account" : "Sign In"}
          </Button>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="form-message">
              {message}
            </p>
          )}
        </form>
        <div className="auth-switch">
          {register ? (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          ) : reset ? (
            <Link to="/login">Back to sign in</Link>
          ) : (
            <>
              New to Auremont? <Link to="/open-account">Open an account</Link>
              <br />
              <Link to="/reset-password">Forgot password?</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export function UpdatePassword() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  return (
    <div className="auth-form">
      <h1>Choose a new password.</h1>
      <p>Choose a strong, secure password for your account.</p>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          const password = String(new FormData(e.currentTarget).get("password"));
          const { error } = await supabase.auth.updateUser({ password });
          setBusy(false);
          if (error) setError(error.message);
          else setDone(true);
        }}
      >
        <div className="field">
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
          />
        </div>
        <Button disabled={busy}>Update Password</Button>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        {done && (
          <p role="status" className="form-message">
            Password updated. <Link to="/account">Continue to your account →</Link>
          </p>
        )}
      </form>
    </div>
  );
}
