import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, LockKeyhole, Save, LogOut, UserRound, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { savePreferences, recordAdminEvent } from "@/lib/central-admin.functions";
import { useAdmin, SectionHeading, Status } from "./workspace";
import { verifyAdminCode } from "./access";
export function SecuritySettings({ profile = false }: { profile?: boolean }) {
  const { data, refresh, notify } = useAdmin();
  const save = useServerFn(savePreferences);
  const event = useServerFn(recordAdminEvent);
  const client = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState(data.preferences?.display_name ?? "Administrator");
  const [notifications, setNotifications] = useState(
    data.preferences?.security_notifications ?? true,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<"password" | "sessions" | null>(null);
  return (
    <>
      <SectionHeading
        title={profile ? "Administrator Profile" : "Security & Settings"}
        description="Protect your designated administrator identity and review recorded access."
      />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <div className="admin-settings-grid">
        <section className="admin-settings-section">
          <h2>
            <UserRound />
            Administrator Identity
          </h2>
          <div className="admin-profile-identity">
            <span className="admin-avatar admin-avatar-large">{name[0]?.toUpperCase()}</span>
            <div>
              <h3>{name}</h3>
              <p>{data.email}</p>
              <Status value="Primary Administrator" />
            </div>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                await save({ data: { name, notifications } });
                await refresh();
                notify("Administrator settings saved.");
              } catch (e) {
                setError("Settings could not be saved.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="field">
              <label htmlFor="admin-display-name">Display Name</label>
              <input
                id="admin-display-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={100}
              />
            </div>
            <div className="admin-setting-row">
              <div>
                <strong>Security notifications</strong>
                <p>Retain security alerts in your notification centre.</p>
              </div>
              <Switch
                aria-label="Security notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <Button disabled={busy}>
              <Save />
              {busy ? "Saving…" : "Save Settings"}
            </Button>
          </form>
        </section>
        <section className="admin-settings-section">
          <h2>
            <ShieldCheck />
            Account Security
          </h2>
          <div className="admin-setting-row">
            <div>
              <strong>Multi-factor authentication</strong>
              <p>Authenticator verification is required for every administrative session.</p>
            </div>
            <Status value="Enabled" />
          </div>
          <div className="admin-setting-row">
            <div>
              <strong>Password</strong>
              <p>Never reuse an existing bank password.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setDialog("password");
                setError("");
              }}
            >
              <LockKeyhole />
              Change
            </Button>
          </div>
          <div className="admin-setting-row">
            <div>
              <strong>Other sessions</strong>
              <p>End sessions on other browsers and devices.</p>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setDialog("sessions");
                setError("");
              }}
            >
              <Monitor />
              Manage
            </Button>
          </div>
          <div className="admin-setting-row">
            <div>
              <strong>Current session</strong>
              <p>Multi-factor verified · This browser</p>
            </div>
            <Button
              variant="ghost"
              onClick={async () => {
                await client.cancelQueries();
                client.clear();
                await supabase.auth.signOut();
                await navigate({ to: "/admin-login", replace: true });
              }}
            >
              <LogOut />
              Sign out
            </Button>
          </div>
        </section>
      </div>
      <div className="admin-band-title">
        <h2>Workspace Access & Security History</h2>
        <span>Recorded website activity</span>
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Activity</th>
              <th>Administrator</th>
            </tr>
          </thead>
          <tbody>
            {data.activities
              .filter((a) => a.entity_type === "security")
              .map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                  <td>{a.action}</td>
                  <td>{a.actor_id.slice(0, 8)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <Dialog
        open={!!dialog}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
      >
        <DialogContent>
          <DialogTitle>
            {dialog === "password" ? "Change Administrator Password" : "End Other Sessions"}
          </DialogTitle>
          <DialogDescription>
            {dialog === "password"
              ? "Reauthenticate before updating your website password."
              : "Other signed-in sessions will be ended. Existing access tokens may remain valid until expiry."}
          </DialogDescription>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const fd = new FormData(e.currentTarget);
              try {
                await verifyAdminCode(String(fd.get("code")));
                if (dialog === "password") {
                  const password = String(fd.get("password"));
                  if (password !== fd.get("confirm")) throw new Error("Passwords do not match.");
                  const { error } = await supabase.auth.updateUser({ password, current_password: String(fd.get("current_password")) });
                  if (error) throw new Error("Password could not be changed.");
                  await event({ data: { event: "Password changed" } });
                  notify("Administrator password changed.");
                } else {
                  const { error } = await supabase.auth.signOut({ scope: "others" });
                  if (error) throw new Error("Other sessions could not be ended.");
                  await event({ data: { event: "Other sessions signed out" } });
                  notify("Other sessions signed out. Existing tokens expire automatically.");
                }
                await refresh();
                setDialog(null);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Security action failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {dialog === "password" && (
              <>
                <div className="field">
                  <label htmlFor="setting-current-password">Current password</label>
                  <input id="setting-current-password" name="current_password" type="password" required maxLength={128} autoComplete="current-password" />
                </div>
                {[
                  ["password", "New password"],
                  ["confirm", "Confirm new password"],
                ].map(([key, label]) => (
                  <div className="field" key={key}>
                    <label htmlFor={`setting-${key}`}>{label}</label>
                    <input
                      id={`setting-${key}`}
                      name={key}
                      type="password"
                      minLength={12}
                      maxLength={128}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                ))}
              </>
            )}
            <div className="field">
              <label htmlFor="setting-code">Authenticator code</label>
              <input
                id="setting-code"
                name="code"
                pattern="[0-9]{6}"
                maxLength={6}
                inputMode="numeric"
                required
                autoComplete="one-time-code"
              />
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button disabled={busy}>
              <ShieldCheck />
              {busy ? "Saving…" : "Confirm Action"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
