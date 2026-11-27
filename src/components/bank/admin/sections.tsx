import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  Users,
  UserCheck,
  ClipboardList,
  UserX,
  LockKeyhole,
  UserPlus,
  ArrowUpRight,
  ArrowRight,
  Activity,
  CheckCheck,
  Bell,
  Download,
  FileBarChart,
  Search,
  FileCheck,
  ShieldCheck,
  Save,
  Mail,
  Globe,
  FileText,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  createApplication,
  reviewApplication,
  markNotifications,
  exportCustomers,
  recordAdminEvent,
} from "@/lib/central-admin.functions";
import { saveContent } from "@/lib/admin.functions";
import {
  accountTypes,
  currencies,
  applicationSchema,
  csvCell,
  type Section,
} from "@/lib/admin-model";
import { useAdmin, SectionHeading, Empty, Status, RecentCustomers } from "./workspace";
import { UsersPage, CustomerForm } from "./customers";
import { AdminApplicationsTab } from "./AdminApplicationsTab";
import { SecuritySettings } from "./settings";
import { verifyAdminCode } from "./access";
import type { Tables } from "@/integrations/supabase/types";
import { getSiteData } from "@/lib/bank.functions";
import { useQuery } from "@tanstack/react-query";
import { AdminPage } from "../account";
export function Overview() {
  const { data } = useAdmin();
  const metrics = [
    ["Total Registered Users", data.counts[0] ?? 0, Users, "total"],
    ["Active Accounts", data.counts[1] ?? 0, UserCheck, "active"],
    ["Pending Applications", data.summary.pendingApplications, ClipboardList, "pending"],
    ["Suspended Accounts", data.counts[3] ?? 0, UserX, "suspended"],
    ["Closed Accounts", data.counts[4] ?? 0, LockKeyhole, "closed"],
    ["New Registrations", data.counts[6] ?? 0, UserPlus, "new"],
  ] as const;
  const distribution = ["Active", "Pending", "Suspended", "Restricted", "Closed"].map(
    (name, i) => ({ name, value: data.counts[[1, 2, 3, 5, 4][i] ?? 0] ?? 0 }),
  );
  const colors = [
    "var(--admin-success)",
    "var(--gold)",
    "var(--admin-danger)",
    "var(--admin-info)",
    "var(--muted-foreground)",
  ];
  return (
    <>
      <SectionHeading
        title="Welcome Back, Administrator."
        description="Manage your customer records and account reviews from one secure workspace."
      >
        <Button asChild>
          <Link to="/admin/$section" params={{ section: "create" }}>
            <UserPlus />
            Create New User
          </Link>
        </Button>
      </SectionHeading>
      <div className="admin-overview-summary">
        <ShieldCheck />
        <div>
          <strong>Auremont Trust Bank</strong>
          <span>Central Administration · Primary Administrator</span>
        </div>
        <span>ACCOUNT OVERSIGHT</span>
      </div>
      <div className="admin-metrics">
        {metrics.map(([label, value, Icon, tone]) => (
          <article className={`admin-metric metric-${tone}`} key={label}>
            <div>
              <span>{label}</span>
              <Icon />
            </div>
            <strong>{value.toLocaleString()}</strong>
            <small>{label === "New Registrations" ? "Last 30 days" : "Live saved records"}</small>
          </article>
        ))}
      </div>
      <div className="admin-charts">
        <section className="admin-chart-section">
          <div className="admin-band-title">
            <h2>Customer Registration Activity</h2>
            <span>Last 6 months</span>
          </div>
          <div className="admin-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data.summary.registrations}
                margin={{ left: -25, right: 10, top: 15, bottom: 0 }}
              >
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    borderColor: "var(--border)",
                    borderRadius: 4,
                    color: "var(--foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Registrations"
                  stroke="var(--gold)"
                  fill="var(--accent)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="admin-chart-section">
          <div className="admin-band-title">
            <h2>Account Status</h2>
            <span>Distribution</span>
          </div>
          <div className="admin-distribution">
            {(data.counts[0] ?? 0) > 0 ? (
              <div className="admin-donut">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      dataKey="value"
                      innerRadius={57}
                      outerRadius={76}
                      stroke="var(--card)"
                    >
                      {distribution.map((s, i) => (
                        <Cell key={s.name} fill={colors[i]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div>
                  <strong>{data.counts[0]}</strong>
                  <span>accounts</span>
                </div>
              </div>
            ) : (
              <div className="admin-donut admin-donut-empty">
                <div>
                  <strong>0</strong>
                  <span>accounts</span>
                </div>
              </div>
            )}
            <ul>
              {distribution.map((s) => (
                <li key={s.name}>
                  <Status value={s.name} />
                  <strong>{s.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      <RecentCustomers />
      <div className="admin-bottom-grid">
        <section className="admin-band">
          <div className="admin-band-title">
            <h2>Recent Activities</h2>
            <Link to="/admin/$section" params={{ section: "reports" }}>
              Audit history <ArrowUpRight />
            </Link>
          </div>
          {!data.activities.length ? (
            <Empty
              title="No activities recorded"
              detail="Administrative changes will appear with a timestamp and actor."
              icon={Activity}
            />
          ) : (
            <div className="admin-activity-list">
              {data.activities.slice(0, 5).map((a) => (
                <article key={a.id}>
                  <span className="admin-activity-icon">
                    <Activity />
                  </span>
                  <div>
                    <strong>{a.action}</strong>
                    <p>
                      {a.entity_type.replace("admin_", "").replaceAll("_", " ")} · Primary
                      administrator
                    </p>
                  </div>
                  <time>{new Date(a.created_at).toLocaleString()}</time>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="admin-quick-actions">
          <h2>Quick Actions</h2>
          {[
            ["Create New User", "Add a customer record", "create", UserPlus],
            ["Review Applications", "Manage pending reviews", "applications", ClipboardList],
            ["Generate Reports", "Export authorized records", "reports", FileBarChart],
          ].map(([title, detail, section, Icon]) => {
            const I = Icon as typeof Users;
            return (
              <Button asChild variant="ghost" key={String(title)}>
                <Link to="/admin/$section" params={{ section: String(section) }}>
                  <I />
                  <span>
                    {String(title)}
                    <small>{String(detail)}</small>
                  </span>
                  <ArrowRight />
                </Link>
              </Button>
            );
          })}
        </section>
      </div>
    </>
  );
}
export function Applications() {
  const { data, refresh, notify } = useAdmin();
  const create = useServerFn(createApplication);
  const review = useServerFn(reviewApplication);
  const [activeTab, setActiveTab] = useState<"onboarding" | "records">("onboarding");
  const [add, setAdd] = useState(false);
  const [target, setTarget] = useState<Tables<"admin_applications"> | null>(null);
  const [decision, setDecision] = useState<"Information requested" | "Approved" | "Rejected">(
    "Information requested",
  );
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("All");
  const apps = data.applications.filter((a) => filter === "All" || a.status === filter);
  return (
    <>
      <div className="admin-glass-tabs">
        <button
          type="button"
          onClick={() => setActiveTab("onboarding")}
          className={`admin-glass-tab ${activeTab === "onboarding" ? "active" : ""}`}
        >
          <FileText size={15} />
          <span>Customer Onboarding Applications (KYC Portal)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("records")}
          className={`admin-glass-tab ${activeTab === "records" ? "active" : ""}`}
        >
          <ClipboardList size={15} />
          <span>Customer Application Records ({data.applications.length})</span>
        </button>
      </div>

      {activeTab === "onboarding" ? (
        <AdminApplicationsTab />
      ) : (
        <>
          <SectionHeading
            title="Account Applications"
            description="Recorded customer applications. Review and manage onboarding status."
          >
            <Button
              onClick={() => {
                setError("");
                setAdd(true);
              }}
            >
              <ClipboardList />
              Record Application
            </Button>
          </SectionHeading>
      <div className="admin-list-toolbar">
        <label className="admin-filter">
          <select
            aria-label="Filter applications"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["All", "Pending", "Information requested", "Approved", "Rejected"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <span>Latest 200 · {data.summary.totalApplications} total</span>
      </div>
      {!apps.length ? (
        <Empty
          title="No applications to review"
          detail="Recorded customer applications will appear here once submitted."
          icon={ClipboardList}
        />
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Application Reference</th>
                <th>Applicant</th>
                <th>Account Type</th>
                <th>Submitted</th>
                <th>Verification</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td className="admin-mono" title={a.reference}>
                    {a.reference.slice(0, 12)}…
                  </td>
                  <td>
                    <strong>
                      {a.first_name} {a.last_name}
                    </strong>
                    <small className="admin-cell-secondary">{a.email}</small>
                  </td>
                  <td>
                    {a.account_type} · {a.currency}
                  </td>
                  <td>{new Date(a.created_at).toLocaleDateString()}</td>
                  <td>
                    <Status value={a.verification_status} />
                  </td>
                  <td>
                    <Status value={a.status} />
                  </td>
                  <td>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTarget(a);
                        setError("");
                      }}
                    >
                      View Application
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={add} onOpenChange={setAdd}>
        <DialogContent className="admin-dialog">
          <DialogTitle>Record Customer Application</DialogTitle>
          <DialogDescription>
            Record onboarding details and initiate administrative review.
          </DialogDescription>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              try {
                const values = applicationSchema.parse(
                  Object.fromEntries(new FormData(e.currentTarget)),
                );
                await create({ data: values });
                await refresh();
                notify("Application recorded successfully.");
                setAdd(false);
              } catch (e) {
                setError("Check the applicant details and try again.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="admin-form-grid">
              {[
                ["first_name", "First Name"],
                ["last_name", "Last Name"],
                ["email", "Email Address"],
                ["phone", "Phone Number"],
              ].map(([key, label]) => (
                <div className="field" key={key}>
                  <label htmlFor={`application-${key}`}>{label}</label>
                  <input
                    id={`application-${key}`}
                    name={key}
                    required={key !== "phone"}
                    maxLength={key === "email" ? 255 : 80}
                    type={key === "email" ? "email" : "text"}
                  />
                </div>
              ))}
              <div className="field">
                <label htmlFor="application-type">Account Type</label>
                <select id="application-type" name="account_type">
                  {accountTypes.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="application-currency">Currency</label>
                <select id="application-currency" name="currency">
                  {currencies.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button disabled={busy}>
              <Save />
              {busy ? "Saving…" : "Save Application"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!target}
        onOpenChange={(open) => {
          if (!open) setTarget(null);
        }}
      >
        <DialogContent className="admin-dialog">
          <DialogTitle>Application Review</DialogTitle>
          <DialogDescription>
            {target?.first_name} {target?.last_name} · {target?.email}
          </DialogDescription>
          {target && (
            <>
              <dl className="admin-details-grid">
                <div>
                  <dt>Requested account</dt>
                  <dd>
                    {target.account_type} · {target.currency}
                  </dd>
                </div>
                <div>
                  <dt>Verification</dt>
                  <dd>{target.verification_status}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{target.status}</dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{new Date(target.created_at).toLocaleString()}</dd>
                </div>
              </dl>
              {target.customer_id && (
                <Button asChild variant="outline">
                  <Link
                    to="/admin/customers/$customerId"
                    params={{ customerId: target.customer_id }}
                  >
                    View Created Customer <ArrowUpRight />
                  </Link>
                </Button>
              )}
              {["Approved", "Rejected"].includes(target.status) ? (
                <p>{target.review_reason}</p>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setBusy(true);
                    setError("");
                    const fd = new FormData(e.currentTarget);
                    try {
                      await review({
                        data: {
                          id: target.id,
                          decision,
                          reason: String(fd.get("reason")),
                          checks: fd.get("checks") === "on",
                        },
                      });
                      await refresh();
                      notify(
                        decision === "Approved"
                          ? "Application approved; customer account created."
                          : `Application ${decision.toLowerCase()}.`,
                      );
                      setTarget(null);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Review failed.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <div className="field">
                    <label htmlFor="application-decision">Review decision</label>
                    <select
                      id="application-decision"
                      value={decision}
                      onChange={(e) => setDecision(e.target.value as typeof decision)}
                    >
                      <option>Information requested</option>
                      <option>Approved</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="application-reason">
                      Reason / additional information requested
                    </label>
                    <textarea
                      id="application-reason"
                      name="reason"
                      minLength={5}
                      maxLength={1000}
                      required
                      rows={3}
                    />
                  </div>
                  <label className="admin-check">
                    <input type="checkbox" name="checks" required={decision === "Approved"} />
                    <span>
                      Required compliance and onboarding verification checks are complete.
                    </span>
                  </label>
                  {error && (
                    <p role="alert" className="form-error">
                      {error}
                    </p>
                  )}
                  <Button disabled={busy}>
                    <FileCheck />
                    {busy ? "Saving…" : "Confirm Review"}
                  </Button>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
        </>
      )}
    </>
  );
}
export function Transactions() {
  const { data } = useAdmin();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Tables<"admin_transactions"> | null>(null);
  const rows = data.transactions.filter(
    (t) =>
      (filter === "All" || t.status === filter) &&
      `${t.reference} ${t.customer_id}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <SectionHeading
        title="Transactions"
        description="Read-only authorized transaction records. Banking and reversal services are not connected."
      />
      <div className="admin-list-toolbar">
        <label className="admin-list-search">
          <Search />
          <input
            aria-label="Search transactions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Transaction reference or customer ID"
          />
        </label>
        <label className="admin-filter">
          <select
            aria-label="Filter transactions"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {["All", "Completed", "Pending", "Failed", "Reversed"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <span>Latest 200 · {data.summary.totalTransactions} total</span>
      </div>
      {!rows.length ? (
        <Empty
          title="No authorized transactions"
          detail="There is no connected banking provider. No balances, deposits or payment confirmations are fabricated."
          icon={Activity}
        />
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Customer ID</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>{t.reference}</td>
                  <td>{t.customer_id.slice(0, 8)}</td>
                  <td>{t.transaction_type}</td>
                  <td>
                    {t.currency} {t.amount.toLocaleString()}
                  </td>
                  <td>{new Date(t.occurred_at).toLocaleString()}</td>
                  <td>
                    <Status value={t.status} />
                  </td>
                  <td>
                    <Button variant="outline" onClick={() => setSelected(t)}>
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent>
          <DialogTitle>Transaction Review</DialogTitle>
          <DialogDescription>
            Read-only provider record. Reversal and adjustment operations are unavailable.
          </DialogDescription>
          {selected && (
            <dl className="admin-details-grid">
              {Object.entries(selected)
                .filter(([k]) => k !== "id")
                .map(([key, value]) => (
                  <div key={key}>
                    <dt>{key.replaceAll("_", " ")}</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
            </dl>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
export function Notifications() {
  const { data, refresh, notify } = useAdmin();
  const mark = useServerFn(markNotifications);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [error, setError] = useState("");
  async function read(id?: string) {
    try {
      await mark({ data: id ? { id } : {} });
      await refresh();
      notify("Notifications marked as read.");
    } catch (e) {
      setError("Notifications could not be updated.");
    }
  }
  const rows = data.notifications.filter((n) => !unreadOnly || !n.read_at);
  return (
    <>
      <SectionHeading
        title="Notifications"
        description="Registrations, application reviews and customer status changes. Latest 200 notifications."
      >
        <Button
          variant="outline"
          onClick={() => void read()}
          disabled={!data.notifications.some((n) => !n.read_at)}
        >
          <CheckCheck />
          Mark all as read
        </Button>
      </SectionHeading>
      <label className="admin-check">
        <input
          type="checkbox"
          checked={unreadOnly}
          onChange={(e) => setUnreadOnly(e.target.checked)}
        />
        Unread only
      </label>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!rows.length ? (
        <Empty
          title="You're all caught up"
          detail="New administration notifications will appear here."
          icon={Bell}
        />
      ) : (
        <div className="admin-notifications">
          {rows.map((n) => (
            <article key={n.id} className={n.read_at ? "" : "unread"}>
              <span className="admin-activity-icon">
                <Bell />
              </span>
              <div>
                <strong>{n.title}</strong>
                <p>{new Date(n.created_at).toLocaleString()}</p>
              </div>
              {!n.read_at ? (
                <Button variant="ghost" size="sm" onClick={() => void read(n.id)}>
                  <CheckCheck />
                  Mark read
                </Button>
              ) : (
                <span className="admin-read-label">Read</span>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
export function Reports() {
  const { data, notify } = useAdmin();
  const exporter = useServerFn(exportCustomers);
  const event = useServerFn(recordAdminEvent);
  const [kind, setKind] = useState("Customer registrations");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const reports = [
    "Customer registrations",
    "Account status",
    "Applications",
    "Transaction summary",
    "Monthly activity",
  ];
  async function download(code: string) {
    setBusy(true);
    setError("");
    try {
      let rows: unknown[][] = [];
      let headers: string[] = [];
      if (kind === "Customer registrations" || kind === "Account status") {
        const values = await exporter();
        headers = [
          "Customer ID",
          "First Name",
          "Last Name",
          "Account Type",
          "Currency",
          "Status",
          "Registered",
        ];
        rows = values.map((v) => [
          v.customer_ref,
          v.first_name,
          v.last_name,
          v.account_type,
          v.currency,
          v.status,
          v.created_at,
        ]);
      } else {
        await event({ data: { event: "Report exported" } });
        if (kind === "Applications") {
          headers = ["Reference", "Applicant", "Type", "Currency", "Status", "Date"];
          rows = data.applications.map((a) => [
            a.reference,
            `${a.first_name} ${a.last_name}`,
            a.account_type,
            a.currency,
            a.status,
            a.created_at,
          ]);
        } else if (kind === "Transaction summary") {
          headers = ["Reference", "Type", "Amount", "Currency", "Status", "Date"];
          rows = data.transactions.map((t) => [
            t.reference,
            t.transaction_type,
            t.amount,
            t.currency,
            t.status,
            t.occurred_at,
          ]);
        } else {
          headers = ["Month", "Registrations"];
          rows = data.summary.registrations.map((r) => [r.month, r.count]);
        }
      }
      const blob = new Blob(
        ["\uFEFF" + [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n")],
        { type: "text/csv;charset=utf-8" },
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `auremont-${kind.toLowerCase().replaceAll(" ", "-")}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
      notify("Authorized report exported. Keep customer information private.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <SectionHeading
        title="Reports & Audit History"
        description="Authorized exports with masked account information and recorded administrative activity."
      />
      <div className="admin-report-grid">
        {reports.map((r, i) => (
          <article className="admin-report" key={r}>
            <FileBarChart />
            <h3>{r}</h3>
            <p>
              {i < 2
                ? "All active customer accounts"
                : i === 4
                  ? "Six-month registration totals"
                  : "Latest 200 authorized records"}
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setKind(r);
                setError("");
                setOpen(true);
              }}
            >
              <Download />
              Export CSV
            </Button>
          </article>
        ))}
      </div>
      <div className="admin-band-title">
        <h2>Administrative Audit Log</h2>
        <span>Latest 100 events · Read only</span>
      </div>
      {!data.activities.length ? (
        <Empty
          title="No activity yet"
          detail="Account changes and security events are retained here."
          icon={ShieldCheck}
        />
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Administrator</th>
                <th>Activity</th>
                <th>Record</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {data.activities.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.created_at).toLocaleString()}</td>
                  <td className="admin-mono">{a.actor_id.slice(0, 8)}</td>
                  <td>{a.action}</td>
                  <td>{a.entity_type.replace("admin_", "")}</td>
                  <td>{a.reason || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Export {kind}</DialogTitle>
          <DialogDescription>
            Download authorized records in CSV format. This action is recorded in the administrative audit log.
          </DialogDescription>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void download("");
            }}
          >
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <Button disabled={busy}>
              <Download />
              {busy ? "Preparing…" : "Confirm & Download CSV"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
function Content() {
  const read = useServerFn(getSiteData);
  const query = useQuery({ queryKey: ["site-content"], queryFn: () => read() });
  if (!query.data) return <div role="status">Loading website content…</div>;
  return (
    <div className="admin-legacy-content">
      <AdminPage initial={query.data} />
    </div>
  );
}
export function AdminSection({ section }: { section: Section }) {
  switch (section) {
    case "overview":
      return <Overview />;
    case "users":
      return <UsersPage />;
    case "accounts":
      return <UsersPage accounts />;
    case "create":
      return <CustomerForm />;
    case "applications":
      return <Applications />;
    case "transactions":
      return <Transactions />;
    case "notifications":
      return <Notifications />;
    case "reports":
      return <Reports />;
    case "settings":
      return <SecuritySettings />;
    case "profile":
      return <SecuritySettings profile />;
    case "content":
      return <Content />;
  }
}
