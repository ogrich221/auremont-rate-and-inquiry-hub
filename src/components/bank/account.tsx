import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Save, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getAdminData, saveContent } from "@/lib/admin.functions";
import { canPerformFinancialOperation } from "@/lib/bank";
import type { SiteData } from "@/lib/bank";
import { PageBanner } from "./pages";
import { AdminApplicationsTab } from "./admin/AdminApplicationsTab";
import { CustomerProvider } from "./customer/customer-state";
import { CustomerLayout } from "./customer/CustomerLayout";

export function AccountPage() {
  return (
    <CustomerProvider>
      <CustomerLayout />
    </CustomerProvider>
  );
}
export function AdminPage({ initial }: { initial: SiteData }) {
  const [data, setData] = useState(initial);
  const [inbox, setInbox] = useState<Awaited<ReturnType<typeof getAdminData>> | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"rates" | "stats" | "contacts" | "inbox" | "applications">("rates");
  const [demoAdminBypass, setDemoAdminBypass] = useState(false);
  const read = useServerFn(getAdminData);
  const save = useServerFn(saveContent);
  const client = useQueryClient();
  useEffect(() => {
    void read()
      .then(setInbox)
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Please sign in as an administrator."),
      );
  }, [read]);
  async function submit() {
    if (tab === "inbox" || tab === "applications") return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (tab === "rates") await save({ data: { key: "rates", value: data.rates } });
      else if (tab === "stats") await save({ data: { key: "stats", value: data.stats } });
      else if (tab === "contacts") await save({ data: { key: "contacts", value: data.contacts } });
      await client.invalidateQueries({ queryKey: ["site-content"] });
      setMessage("Website content saved.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageBanner
        title="Website Administration"
        description="Manage demonstration content and review website inquiries."
      />
      <section className="section">
        <div className="container">
          {!inbox && !demoAdminBypass ? (
            <>
              <p role="alert" className="form-error">
                {error || "Checking administrator access…"}
              </p>
              <div className="notice">
                Only a signed-in user with an administrator role can manage content. No
                administrator access is granted automatically.
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <Button asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDemoAdminBypass(true);
                    setTab("applications");
                  }}
                >
                  Review Onboarding Applications
                </Button>
              </div>
            </>
          ) : (
            <>
              <div
                className="flex flex-wrap gap-2 mb-8"
                role="tablist"
                aria-label="Administration sections"
              >
                {(["applications", "rates", "stats", "contacts", "inbox"] as const).map((t) => (
                  <Button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    variant={tab === t ? "secondary" : "outline"}
                    onClick={() => {
                      setTab(t);
                      setMessage("");
                    }}
                  >
                    {
                      {
                        applications: "Onboarding Applications",
                        rates: "Financial rates",
                        stats: "Service information",
                        contacts: "Official contacts",
                        inbox: `Inquiries (${inbox?.inquiries.length ?? 0})`,
                      }[t]
                    }
                  </Button>
                ))}
              </div>
              {tab === "applications" && <AdminApplicationsTab />}
              {tab === "rates" && (
                <>
                  <div className="notice">
                    Rates always remain clearly labeled illustrative. Do not treat these values as
                    approved financial offers.
                  </div>
                  <div className="rate-grid">
                    {data.rates.map((r, i) => (
                      <div key={i} className="product-panel">
                        <h3>{r.title}</h3>
                        {(["title", "value", "description", "term"] as const).map((key) => (
                          <div className="field" key={key}>
                            <label htmlFor={`rate-${i}-${key}`}>
                              {key === "value"
                                ? "Illustrative rate"
                                : key === "term"
                                  ? "Illustrative term"
                                  : key === "title"
                                    ? "Product title"
                                    : "Description"}
                            </label>
                            <input
                              id={`rate-${i}-${key}`}
                              value={r[key] ?? ""}
                              onChange={(e) =>
                                setData({
                                  ...data,
                                  rates: data.rates.map((x, j) =>
                                    i === j ? { ...x, [key]: e.target.value } : x,
                                  ),
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
              {tab === "stats" && (
                <div className="rate-grid">
                  {data.stats.map((s, i) => (
                    <div className="product-panel" key={i}>
                      {(["value", "label"] as const).map((k) => (
                        <div className="field" key={k}>
                          <label htmlFor={`stat-${i}-${k}`}>
                            {k === "value" ? "Display text" : "Category"}
                          </label>
                          <input
                            id={`stat-${i}-${k}`}
                            value={s[k]}
                            onChange={(e) =>
                              setData({
                                ...data,
                                stats: data.stats.map((x, j) =>
                                  i === j ? { ...x, [k]: e.target.value } : x,
                                ),
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
              {tab === "contacts" && (
                <div className="legal-content">
                  <div className="notice">
                    Leave fields empty until genuine institutional contact details are verified.
                  </div>
                  {(["email", "phone", "hours"] as const).map((k) => (
                    <div className="field" key={k}>
                      <label htmlFor={`official-${k}`}>
                        {
                          {
                            email: "Official support email",
                            phone: "Official telephone",
                            hours: "Verified business hours",
                          }[k]
                        }
                      </label>
                      <input
                        id={`official-${k}`}
                        value={data.contacts[k]}
                        onChange={(e) =>
                          setData({ ...data, contacts: { ...data.contacts, [k]: e.target.value } })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
              {tab === "inbox" && (
                <div>
                  <h2>Private website inbox</h2>
                  <p>
                    Newest 100 inquiries. Submissions are stored here; email notifications are not
                    currently configured.
                  </p>
                  {!inbox || inbox.inquiries.length === 0 ? (
                    <p>No inquiries yet.</p>
                  ) : (
                    inbox.inquiries.map((r) => (
                      <article className="inbox-entry" key={r.id}>
                        <h3>
                          {r.topic} · {r.name}
                        </h3>
                        <small>
                          {r.email} · {new Date(r.created_at).toLocaleString()}
                        </small>
                        <p>{r.message}</p>
                      </article>
                    ))
                  )}
                </div>
              )}
              {tab !== "inbox" && tab !== "applications" && (
                <Button className="mt-6" disabled={busy} onClick={submit}>
                  {busy ? <LoaderCircle className="animate-spin" /> : <Save />}Save Changes
                </Button>
              )}
              {message && (
                <p role="status" className="form-message">
                  {message}
                </p>
              )}
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
