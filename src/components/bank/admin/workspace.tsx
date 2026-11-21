import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  ClipboardList,
  Landmark,
  ArrowLeftRight,
  Bell,
  ChartNoAxesCombined,
  Settings,
  UserRound,
  LogOut,
  PanelLeftClose,
  Menu,
  X,
  Search,
  ChevronRight,
  ShieldCheck,
  ArrowUpRight,
  RefreshCw,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWorkspace } from "@/lib/central-admin.functions";
import { sectionNames, type Section, fullName, maskReference } from "@/lib/admin-model";
import { supabase } from "@/integrations/supabase/client";
import { Brand } from "../shell";
import { AdminLoading } from "./access";
export type WorkspaceData = Awaited<ReturnType<typeof getWorkspace>>;
const AdminContext = createContext<{
  data: WorkspaceData;
  refresh: () => Promise<void>;
  notify: (m: string) => void;
} | null>(null);
export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error("Administration workspace missing");
  return context;
}
const icons = {
  overview: LayoutDashboard,
  users: Users,
  create: UserPlus,
  applications: ClipboardList,
  accounts: Landmark,
  transactions: ArrowLeftRight,
  notifications: Bell,
  reports: ChartNoAxesCombined,
  settings: Settings,
  profile: UserRound,
  content: Globe,
};
export function Status({ value }: { value: string }) {
  return (
    <span className={`admin-status status-${value.toLowerCase().replaceAll(" ", "-")}`}>
      <i />
      {value}
    </span>
  );
}
export function Empty({
  title,
  detail,
  icon: Icon = Users,
  children,
}: {
  title: string;
  detail: string;
  icon?: typeof Users;
  children?: ReactNode;
}) {
  return (
    <div className="admin-empty">
      <Icon />
      <h3>{title}</h3>
      <p>{detail}</p>
      {children}
    </div>
  );
}
export function SectionHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="admin-section-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="admin-heading-actions">{children}</div>
    </div>
  );
}
export function AdminWorkspace() {
  const read = useServerFn(getWorkspace);
  const client = useQueryClient();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const query = useQuery({
    queryKey: ["admin", "workspace"],
    queryFn: () => read(),
    retry: false,
    staleTime: 30000,
  });
  useEffect(() => {
    if (!query.data) return;
    let timer: ReturnType<typeof setTimeout>;
    const expire = () => {
      void (async () => {
        await client.cancelQueries();
        client.clear();
        await supabase.auth.signOut();
        await navigate({ to: "/admin-login", replace: true });
      })();
    };
    const reset = () => { clearTimeout(timer); timer = setTimeout(expire, 15 * 60 * 1000); };
    const events = ["pointerdown", "keydown", "scroll"];
    events.forEach(event => window.addEventListener(event, reset, { passive: true }));
    reset();
    return () => { clearTimeout(timer); events.forEach(event => window.removeEventListener(event, reset)); };
  }, [!!query.data, client, navigate]);
  async function refresh() {
    await client.invalidateQueries({ queryKey: ["admin"] });
  }
  async function logout() {
    await client.cancelQueries();
    client.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/admin-login", replace: true });
  }
  if (query.isPending) return <AdminLoading />;
  if (query.isError || !query.data)
    return (
      <div className="admin-access">
        <div className="admin-access-body">
          <Brand />
          <ShieldCheck className="admin-access-icon" />
          <h1>Secure access required</h1>
          <p>{query.error?.message ?? "Administrator verification is required."}</p>
          <Button asChild>
            <Link to="/admin-login">
              Administrator Sign In <ArrowUpRight />
            </Link>
          </Button>
          <Button variant="outline" onClick={() => void query.refetch()}>
            <RefreshCw />
            Try again
          </Button>
        </div>
      </div>
    );
  const data = query.data;
  const current = path === "/admin" ? "overview" : (path.split("/")[2] ?? "overview");
  const unread = data.notifications.filter((n) => !n.read_at).length;
  const name = data.preferences?.display_name ?? "Administrator";
  return (
    <AdminContext.Provider value={{ data, refresh, notify: setMessage }}>
      <div className={`admin-shell ${collapsed ? "admin-collapsed" : ""}`}>
        {mobile && <div className="admin-drawer-backdrop" onClick={() => setMobile(false)} />}
        <aside className={`admin-sidebar ${mobile ? "admin-sidebar-open" : ""}`}>
          <div className="admin-sidebar-brand">
            <Brand />
            <Button
              variant="ghost"
              size="icon"
              className="admin-mobile-close"
              aria-label="Close administration navigation"
              onClick={() => setMobile(false)}
            >
              <X />
            </Button>
          </div>
          <div className="admin-sidebar-label">ADMINISTRATION</div>
          <nav aria-label="Administration navigation">
            {(Object.keys(sectionNames) as Section[]).map((section) => {
              const Icon = icons[section];
              return (
                <Button
                  asChild
                  variant="ghost"
                  key={section}
                  className={current === section ? "selected" : ""}
                  title={collapsed ? sectionNames[section] : undefined}
                >
                  <Link
                    to={section === "overview" ? "/admin" : "/admin/$section"}
                    params={{ section }}
                    search={{}}
                    onClick={() => {
                      setMobile(false);
                      setMessage("");
                    }}
                  >
                    <Icon />
                    <span>{sectionNames[section]}</span>
                    {section === "notifications" && unread > 0 && <b>{unread}</b>}
                  </Link>
                </Button>
              );
            })}
          </nav>
          <div className="admin-sidebar-bottom">
            <div className="admin-sidebar-secure">
              <ShieldCheck />
              <span>
                Secure workspace<small>Multi-factor protected</small>
              </span>
            </div>
            <Button variant="ghost" onClick={logout}>
              <LogOut />
              <span>Logout</span>
            </Button>
            <Button
              variant="ghost"
              className="admin-collapse-button"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeftClose />
              <span>Collapse sidebar</span>
            </Button>
          </div>
        </aside>
        <div className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <Button
                className="admin-mobile-menu"
                size="icon"
                variant="ghost"
                aria-label="Open administration navigation"
                onClick={() => setMobile(true)}
              >
                <Menu />
              </Button>
              <div>
                <span className="admin-topbar-title">Central Administration</span>
                <span className="admin-topbar-date">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <form
              className="admin-global-search"
              onSubmit={(e) => {
                e.preventDefault();
                void navigate({
                  to: "/admin/$section",
                  params: { section: "users" },
                  search: { q: search, page: 1 },
                });
              }}
            >
              <Search />
              <input
                aria-label="Search all customers"
                placeholder="Search customers…"
                value={search}
                maxLength={100}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" variant="ghost" size="icon" aria-label="Search">
                <ArrowUpRight />
              </Button>
            </form>
            <Button
              asChild
              variant="ghost"
              size="icon"
              title="Notifications"
              aria-label={`Notifications, ${unread} unread`}
              className="admin-bell"
            >
              <Link to="/admin/$section" params={{ section: "notifications" }}>
                <Bell />
                {unread > 0 && <i />}
              </Link>
            </Button>
            <Link
              to="/admin/$section"
              params={{ section: "profile" }}
              className="admin-topbar-profile"
            >
              <span className="admin-avatar">{name.slice(0, 1).toUpperCase()}</span>
              <span>
                {name}
                <small>Primary Administrator</small>
              </span>
            </Link>
          </header>
          <div className="admin-content">
            <div className="admin-breadcrumb">
              <Link to="/admin">Dashboard</Link>
              {current !== "overview" && (
                <>
                  <ChevronRight />
                  <span>{sectionNames[current as Section] ?? "Customer Profile"}</span>
                </>
              )}
              <span className="admin-session-badge">
                <ShieldCheck />
                Verified session
              </span>
            </div>
            <div className="admin-demo-strip">
              <span>DEMONSTRATION WORKSPACE</span> Customer records only. No funds, real account
              opening, or financial transactions.
            </div>
            {message && (
              <div className="admin-message" role="status">
                {message}
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Dismiss message"
                  onClick={() => setMessage("")}
                >
                  <X />
                </Button>
              </div>
            )}
            <Outlet />
          </div>
          <footer className="admin-workspace-footer">
            <span>© {new Date().getFullYear()} Auremont Trust Bank</span>
            <span>
              <ShieldCheck />
              Access-controlled · Audit protected
            </span>
          </footer>
        </div>
      </div>
    </AdminContext.Provider>
  );
}
export function RecentCustomers() {
  const { data } = useAdmin();
  return (
    <div className="admin-band">
      <div className="admin-band-title">
        <h2>Recent Customers</h2>
        <Link to="/admin/$section" params={{ section: "users" }}>
          View all users <ArrowUpRight />
        </Link>
      </div>
      {!data.customers.length ? (
        <Empty
          title="No customers yet"
          detail="Your first saved customer record will appear here."
        />
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Customer ID</th>
                <th>Account Type</th>
                <th>Account Reference</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link
                      className="admin-person"
                      to="/admin/customers/$customerId"
                      params={{ customerId: c.id }}
                    >
                      <span className="admin-avatar">
                        {c.first_name[0]}
                        {c.last_name[0]}
                      </span>
                      <span>
                        {fullName(c)}
                        <small>{c.email}</small>
                      </span>
                    </Link>
                  </td>
                  <td className="admin-mono">{c.customer_ref.slice(0, 11)}…</td>
                  <td>{c.account_type}</td>
                  <td className="admin-mono">{maskReference(c.account_ref)}</td>
                  <td>
                    <Status value={c.status} />
                  </td>
                  <td>
                    <Button asChild variant="ghost" size="icon" aria-label={`View ${fullName(c)}`}>
                      <Link to="/admin/customers/$customerId" params={{ customerId: c.id }}>
                        <ChevronRight />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
