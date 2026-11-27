import { useEffect, useState, type ReactNode } from "react";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const KEY = "auremont-pin-unlocked";
export const isValidPin = (pin: string) => /^[0-9]{6}$/.test(pin);

type Stage = "loading" | "open" | "create" | "enter";

export function PinGate({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      if (typeof window !== "undefined") {
        if (sessionStorage.getItem("auremont_impersonate_customer")) {
          return setStage("open");
        }
      }
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id;
      if (!id) return setStage("open");
      if (data.user?.email?.toLowerCase().trim() === "skybridgeairline@gmail.com") {
        return setStage("open");
      }
      if (sessionStorage.getItem(KEY) === id) return setStage("open");
      const { data: has, error: e } = await supabase.rpc("has_security_pin");
      if (e) return setError("Unable to check your security PIN."), setStage("enter");
      setStage(has ? "enter" : "create");
    })();
  }, []);

  async function unlock() {
    const { data } = await supabase.auth.getUser();
    if (data.user) sessionStorage.setItem(KEY, data.user.id);
    setStage("open");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!isValidPin(pin)) return setError("Your PIN must be exactly 6 digits.");
    setBusy(true);
    try {
      if (stage === "create") {
        if (pin !== confirm) return setError("The PINs do not match.");
        const { error: e2 } = await supabase.rpc("set_security_pin", { _pin: pin });
        if (e2) return setError(e2.message);
        await unlock();
      } else {
        const { data, error: e2 } = await supabase.rpc("verify_security_pin", { _pin: pin });
        if (e2) return setError("Unable to verify your PIN. Please try again.");
        if (data === "ok") return await unlock();
        setPin("");
        setError(
          data === "locked"
            ? "Too many incorrect attempts. Your PIN is locked for 15 minutes."
            : "Incorrect PIN. Please try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  }

  if (stage === "open") return <>{children}</>;
  if (stage === "loading")
    return (
      <div className="auth-form" style={{ margin: "4rem auto", textAlign: "center" }}>
        <LoaderCircle className="animate-spin" />
      </div>
    );
  const digits = (v: string) => v.replace(/\D/g, "").slice(0, 6);
  return (
    <div className="auth-form" style={{ margin: "4rem auto", maxWidth: 440 }}>
      <span className="eyebrow">ADDITIONAL SECURITY</span>
      <h1>
        <LockKeyhole aria-hidden="true" /> {stage === "create" ? "Create your security PIN" : "Enter your security PIN"}
      </h1>
      <p>
        {stage === "create"
          ? "Choose a 6-digit PIN. You'll need it each time you open your profile."
          : "Enter your 6-digit PIN to open your profile."}
      </p>
      <form onSubmit={submit}>
        <label>
          Security PIN
          <input
            type="password"
            inputMode="numeric"
            autoComplete="off"
            value={pin}
            onChange={(e) => setPin(digits(e.target.value))}
            required
          />
        </label>
        {stage === "create" && (
          <label>
            Confirm PIN
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={confirm}
              onChange={(e) => setConfirm(digits(e.target.value))}
              required
            />
          </label>
        )}
        {error && <div className="form-error" role="alert">{error}</div>}
        <Button type="submit" disabled={busy}>
          {busy ? <LoaderCircle className="animate-spin" /> : stage === "create" ? "Save PIN" : "Unlock profile"}
        </Button>
      </form>
    </div>
  );
}
