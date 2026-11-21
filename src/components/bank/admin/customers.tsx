import { useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  UserPlus,
  SlidersHorizontal,
  MoreHorizontal,
  Eye,
  Pencil,
  Pause,
  Play,
  Archive,
  LockKeyhole,
  ChevronLeft,
  ChevronRight,
  ArrowDownUp,
  Save,
  ArrowLeft,
  FileCheck,
  Activity,
  History,
  Landmark,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  getCustomers,
  getCustomer,
  saveCustomer,
  changeCustomer,
} from "@/lib/central-admin.functions";
import {
  listSchema,
  customerSchema,
  statuses,
  accountTypes,
  currencies,
  fullName,
  maskReference,
  type Customer,
} from "@/lib/admin-model";
import { useAdmin, SectionHeading, Empty, Status } from "./workspace";
import { AdminLoading, verifyAdminCode } from "./access";
export function CustomerActions({
  customer,
  onStatus,
}: {
  customer: Customer;
  onStatus: (c: Customer, status: Customer["status"], archive?: boolean) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" aria-label={`Actions for ${fullName(customer)}`}>
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link
            to="/admin/customers/$customerId"
            params={{ customerId: customer.id }}
            search={(p) => p}
          >
            <Eye />
            View Profile
          </Link>
        </DropdownMenuItem>
        {!customer.archived_at && (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/admin/customers/$customerId/edit"
                params={{ customerId: customer.id }}
                search={(p) => p}
              >
                <Pencil />
                Edit Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onStatus(customer, customer.status)}>
              <Landmark />
              Manage Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onStatus(customer, "Suspended")}>
              <Pause />
              Suspend Account
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onStatus(customer, "Active")}>
              <Play />
              Reactivate Account
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onStatus(customer, "Closed")}>
              <LockKeyhole />
              Close Account
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={() => onStatus(customer, "Closed", true)}
            >
              <Archive />
              Delete Record (archive)
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function StatusDialog({
  target,
  onClose,
}: {
  target: { customer: Customer; status: Customer["status"]; archive: boolean } | null;
  onClose: () => void;
}) {
  const { refresh, notify } = useAdmin();
  const change = useServerFn(changeCustomer);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <Dialog
      open={!!target}
      onOpenChange={(open) => {
        if (!open && !busy) {
          setError("");
          onClose();
        }
      }}
    >
      <DialogContent className="admin-dialog">
        <DialogTitle>
          {target?.archive
            ? "Are You Sure You Want to Delete This Customer Record?"
            : "Manage Account Status"}
        </DialogTitle>
        <DialogDescription>
          {target?.archive
            ? "The record will be archived, not permanently erased. Audit history is retained."
            : "Changes affect demonstration records only, not a financial account."}
        </DialogDescription>
        {target && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const fd = new FormData(e.currentTarget);
              try {
                await verifyAdminCode(String(fd.get("code")));
                await change({
                  data: {
                    id: target.customer.id,
                    version: target.customer.version,
                    status: String(fd.get("status")) as Customer["status"],
                    reason: String(fd.get("reason")),
                    checks: fd.get("checks") === "on",
                    archive: target.archive,
                  },
                });
                await refresh();
                notify(
                  target.archive
                    ? "Customer record archived. History retained."
                    : "Account status updated successfully.",
                );
                onClose();
              } catch (e) {
                setError(e instanceof Error ? e.message : "Action failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <p>
              <strong>{fullName(target.customer)}</strong> ·{" "}
              <Status value={target.customer.status} />
            </p>
            <div className="field">
              <label htmlFor="status-target">New status</label>
              <select
                id="status-target"
                name="status"
                defaultValue={target.status}
                disabled={target.archive}
              >
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              {target.archive && <input type="hidden" name="status" value="Closed" />}
            </div>
            <div className="field">
              <label htmlFor="status-reason">Documented reason</label>
              <textarea
                id="status-reason"
                name="reason"
                required
                minLength={5}
                maxLength={1000}
                rows={3}
              />
            </div>
            <label className="admin-check">
              <input name="checks" type="checkbox" />
              <span>Required demo checks and closure procedures are complete.</span>
            </label>
            <div className="field">
              <label htmlFor="status-code">Reauthenticate with an authenticator code</label>
              <input
                id="status-code"
                name="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="admin-form-actions">
              <Button variant="outline" type="button" disabled={busy} onClick={onClose}>
                Cancel
              </Button>
              <Button variant={target.archive ? "destructive" : "default"} disabled={busy}>
                {busy ? "Saving…" : "Confirm Action"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
export function UsersPage({ accounts = false }: { accounts?: boolean }) {
  const search = listSchema.parse(useSearch({ strict: false }));
  const navigate = useNavigate();
  const read = useServerFn(getCustomers);
  const [target, setTarget] = useState<{
    customer: Customer;
    status: Customer["status"];
    archive: boolean;
  } | null>(null);
  const [q, setQ] = useState(search.q);
  const query = useQuery({
    queryKey: ["admin", "customers", search],
    queryFn: () => read({ data: search }),
    staleTime: 10000,
  });
  function filter(values: Partial<typeof search>) {
    void navigate({
      to: "/admin/$section",
      params: { section: accounts ? "accounts" : "users" },
      search: { ...search, ...values },
    });
  }
  const count = query.data?.count ?? 0;
  const rows = query.data?.rows ?? [];
  const pages = Math.max(1, Math.ceil(count / 20));
  return (
    <>
      <SectionHeading
        title={accounts ? "Account Management" : "All Users"}
        description={
          accounts
            ? "Review account statuses and maintain a documented history."
            : "A complete view of your registered demo customers."
        }
      >
        <Button asChild>
          <Link to="/admin/$section" params={{ section: "create" }}>
            <UserPlus />
            Create New User
          </Link>
        </Button>
      </SectionHeading>
      <div className="admin-list-toolbar">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            filter({ q, page: 1 });
          }}
          className="admin-list-search"
        >
          <Search />
          <input
            aria-label="Search customer records"
            placeholder="Name, email, customer ID, phone or reference"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            maxLength={100}
          />
          <Button type="submit" variant="ghost" size="icon" aria-label="Search customer records">
            <ChevronRight />
          </Button>
        </form>
        <label className="admin-filter">
          <SlidersHorizontal />
          <select
            aria-label="Filter by status"
            value={search.status}
            onChange={(e) =>
              filter({ status: listSchema.shape.status.parse(e.target.value), page: 1 })
            }
          >
            {["All", ...statuses, "Archived"].map((s) => (
              <option value={s} key={s}>
                {s === "All" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </label>
        <label className="admin-filter">
          <ArrowDownUp />
          <select
            aria-label="Sort customers"
            value={search.sort}
            onChange={(e) =>
              filter({
                sort: listSchema.shape.sort.parse(e.target.value),
                page: 1,
                asc: e.target.value === "first_name",
              })
            }
          >
            <option value="created_at">Registration date</option>
            <option value="first_name">Customer name</option>
            <option value="status">Status</option>
            <option value="account_type">Account type</option>
          </select>
        </label>
        <Button
          variant="ghost"
          size="icon"
          title="Reverse sort order"
          aria-label="Reverse sort order"
          onClick={() => filter({ asc: !search.asc })}
        >
          <ArrowDownUp />
        </Button>
      </div>
      <div className="admin-table-heading">
        <span>{count.toLocaleString()} customers</span>
        {search.q && (
          <Button
            variant="link"
            onClick={() => {
              setQ("");
              filter({ q: "", page: 1 });
            }}
          >
            Clear search
          </Button>
        )}
      </div>
      {query.isPending ? (
        <div className="admin-inline-loading" role="status">
          Loading customer records…
        </div>
      ) : query.isError ? (
        <p className="form-error" role="alert">
          {query.error.message}
        </p>
      ) : !rows.length ? (
        <Empty
          title="No matching customers"
          detail={
            search.q || search.status !== "All"
              ? "Try another search or account status."
              : "Saved customer records will appear here."
          }
        >
          <Button asChild variant="outline">
            <Link to="/admin/$section" params={{ section: "create" }}>
              <UserPlus />
              Add a customer
            </Link>
          </Button>
        </Empty>
      ) : (
        <div className="admin-table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Customer ID</th>
                <th>Phone</th>
                <th>Account Reference</th>
                <th>Account Type</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link
                      className="admin-person"
                      to="/admin/customers/$customerId"
                      params={{ customerId: c.id }}
                      search={(p) => p}
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
                  <td className="admin-mono" title={c.customer_ref}>
                    {c.customer_ref.slice(0, 11)}…
                  </td>
                  <td>{c.phone || "—"}</td>
                  <td className="admin-mono">{maskReference(c.account_ref)}</td>
                  <td>{c.account_type}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <Status value={c.archived_at ? "Archived" : c.status} />
                  </td>
                  <td>
                    <CustomerActions
                      customer={c}
                      onStatus={(customer, status, archive = false) =>
                        setTarget({ customer, status, archive })
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="admin-pagination">
        <span>
          {count
            ? `${(search.page - 1) * 20 + 1}–${Math.min(search.page * 20, count)} of ${count}`
            : "0 customers"}
        </span>
        <div>
          <Button
            variant="outline"
            size="sm"
            disabled={search.page <= 1}
            onClick={() => filter({ page: search.page - 1 })}
          >
            <ChevronLeft />
            Previous
          </Button>
          <span>
            {search.page} / {pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={search.page >= pages}
            onClick={() => filter({ page: search.page + 1 })}
          >
            Next
            <ChevronRight />
          </Button>
        </div>
      </div>
      <StatusDialog target={target} onClose={() => setTarget(null)} />
    </>
  );
}
const fields = [
  ["first_name", "First Name", true],
  ["middle_name", "Middle Name", false],
  ["last_name", "Last Name", true],
  ["date_of_birth", "Date of Birth", false],
  ["nationality", "Nationality", false],
  ["country", "Country of Residence", false],
  ["address", "Residential Address", false],
  ["email", "Email Address", true],
  ["phone", "Phone Number", false],
  ["alternative_phone", "Alternative Phone Number", false],
] as const;
export function CustomerForm({ customer }: { customer?: Customer }) {
  const save = useServerFn(saveCustomer);
  const { refresh, notify } = useAdmin();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <SectionHeading
        title={customer ? "Edit Customer Information" : "Create New User"}
        description={
          customer
            ? "Update permitted details. Every change is recorded."
            : "Create a demo customer record, not a financial account."
        }
      >
        <Button variant="outline" asChild>
          <Link
            to={customer ? "/admin/customers/$customerId" : "/admin/$section"}
            params={{ customerId: customer?.id ?? "", section: "users" }}
            search={(p) => p}
          >
            <ArrowLeft />
            Cancel
          </Link>
        </Button>
      </SectionHeading>
      <form
        className="admin-customer-form"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            const values = Object.fromEntries(new FormData(e.currentTarget));
            const payload = customerSchema.parse(values);
            const result = await save({
              data: {
                customer: payload,
                ...(customer ? { id: customer.id, version: customer.version } : {}),
              },
            });
            await refresh();
            notify(
              customer
                ? "Customer Information Updated Successfully."
                : "Customer record created successfully.",
            );
            await navigate({
              to: "/admin/customers/$customerId",
              params: { customerId: result.id },
              search: (p) => p,
            });
          } catch (e) {
            setError(
              e instanceof Error
                ? e.message.startsWith("[")
                  ? "Please check the customer details and try again."
                  : e.message
                : "Unable to save.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <section>
          <h2>
            <UserRound />
            Personal Details
          </h2>
          <div className="admin-form-grid">
            {fields.slice(0, 7).map(([key, label, required]) => (
              <div className={`field ${key === "address" ? "admin-field-wide" : ""}`} key={key}>
                <label htmlFor={`customer-${key}`}>
                  {label}
                  {required && <span> *</span>}
                </label>
                <input
                  id={`customer-${key}`}
                  name={key}
                  type={key === "date_of_birth" ? "date" : "text"}
                  defaultValue={customer?.[key] ?? ""}
                  maxLength={key === "address" ? 500 : 80}
                  required={required}
                />
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2>Contact Details</h2>
          <div className="admin-form-grid">
            {fields.slice(7).map(([key, label, required]) => (
              <div className="field" key={key}>
                <label htmlFor={`customer-${key}`}>
                  {label}
                  {required && <span> *</span>}
                </label>
                <input
                  id={`customer-${key}`}
                  name={key}
                  type={key === "email" ? "email" : "tel"}
                  defaultValue={customer?.[key] ?? ""}
                  maxLength={key === "email" ? 255 : 40}
                  required={required}
                />
              </div>
            ))}
          </div>
        </section>
        <section>
          <h2>
            <Landmark />
            Account Details
          </h2>
          <div className="admin-form-grid">
            <div className="field">
              <label htmlFor="customer-type">Account Type</label>
              <select
                id="customer-type"
                name="account_type"
                defaultValue={customer?.account_type ?? "Personal"}
              >
                {accountTypes.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="customer-currency">Account Currency</label>
              <select
                id="customer-currency"
                name="currency"
                defaultValue={customer?.currency ?? "USD"}
              >
                {currencies.map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="customer-opening">Account Opening Date</label>
              <input
                id="customer-opening"
                type="date"
                name="opening_date"
                defaultValue={customer?.opening_date ?? new Date().toISOString().slice(0, 10)}
                readOnly={!!customer}
              />
            </div>
            <div className="field">
              <label>Account Status</label>
              <div className="admin-field-static">
                <Status value={customer?.status ?? "Pending"} />
              </div>
            </div>
            <div className="field admin-field-wide">
              <label htmlFor="customer-notes">Administrative Notes</label>
              <textarea
                id="customer-notes"
                name="notes"
                maxLength={1000}
                rows={3}
                defaultValue={customer?.notes ?? ""}
              />
            </div>
          </div>
          <div className="admin-form-notice">
            <LockKeyhole />
            New records start pending. No bank account or customer credentials are created.
            Invitations await a verified activation service.
          </div>
        </section>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-form-actions">
          <Button
            variant="outline"
            type="button"
            onClick={() =>
              void navigate({
                to: customer ? "/admin/customers/$customerId" : "/admin/$section",
                params: { customerId: customer?.id ?? "", section: "users" },
                search: (p) => p,
              })
            }
          >
            Cancel
          </Button>
          <Button disabled={busy}>
            <Save />
            {busy ? "Saving Changes…" : customer ? "Save Changes" : "Create Customer"}
          </Button>
        </div>
      </form>
    </>
  );
}
export function CustomerProfile({ id, edit = false }: { id: string; edit?: boolean }) {
  const read = useServerFn(getCustomer);
  const query = useQuery({
    queryKey: ["admin", "customer", id],
    queryFn: () => read({ data: { id } }),
  });
  const [tab, setTab] = useState("Personal Information");
  const [target, setTarget] = useState<{
    customer: Customer;
    status: Customer["status"];
    archive: boolean;
  } | null>(null);
  if (query.isPending) return <AdminLoading text="Loading Customer Record…" />;
  if (query.isError || !query.data)
    return (
      <p role="alert" className="form-error">
        {query.error?.message ?? "Record unavailable"}
      </p>
    );
  const c = query.data.customer;
  if (edit) return <CustomerForm customer={c} />;
  const tabs = [
    ["Personal Information", UserRound],
    ["Account Information", Landmark],
    ["Account Activity", Activity],
    ["Documents", FileCheck],
    ["Administrative History", History],
  ] as const;
  return (
    <>
      <Button className="admin-back-button" asChild variant="ghost">
        <Link to="/admin/$section" params={{ section: "users" }} search={(p) => p}>
          <ArrowLeft />
          Back to All Users
        </Link>
      </Button>
      <SectionHeading title={fullName(c)} description={c.customer_ref}>
        <Button asChild variant="outline" disabled={!!c.archived_at}>
          <Link
            to="/admin/customers/$customerId/edit"
            params={{ customerId: c.id }}
            search={(p) => p}
          >
            <Pencil />
            Edit Details
          </Link>
        </Button>
        {!c.archived_at && (
          <Button onClick={() => setTarget({ customer: c, status: c.status, archive: false })}>
            <Landmark />
            Manage Account
          </Button>
        )}
      </SectionHeading>
      <div className="admin-profile-summary">
        <span className="admin-avatar admin-avatar-large">
          {c.first_name[0]}
          {c.last_name[0]}
        </span>
        <div>
          <h3>{fullName(c)}</h3>
          <p>{c.email}</p>
        </div>
        <Status value={c.archived_at ? "Archived" : c.status} />
        <span className="admin-profile-opening">
          Registered {new Date(c.created_at).toLocaleDateString()}
        </span>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Customer profile">
        {tabs.map(([label, Icon]) => (
          <Button
            role="tab"
            aria-selected={tab === label}
            variant="ghost"
            key={label}
            onClick={() => setTab(label)}
          >
            <Icon />
            {label}
          </Button>
        ))}
      </div>
      <div role="tabpanel" className="admin-profile-details">
        {tab === "Personal Information" && (
          <dl className="admin-details-grid">
            {[
              ["Full Name", fullName(c)],
              ["Date of Birth", c.date_of_birth],
              ["Nationality", c.nationality],
              ["Country of Residence", c.country],
              ["Residential Address", c.address],
              ["Email Address", c.email],
              ["Phone Number", c.phone],
              ["Alternative Phone", c.alternative_phone],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v || "Not provided"}</dd>
              </div>
            ))}
          </dl>
        )}
        {tab === "Account Information" && (
          <dl className="admin-details-grid">
            {[
              ["Customer ID", c.customer_ref],
              ["Demo Account Reference", maskReference(c.account_ref)],
              ["Account Type", c.account_type],
              ["Currency", c.currency],
              ["Account Status", c.status],
              ["Opening Date", c.opening_date],
            ].map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        )}
        {tab === "Account Activity" && (
          <Empty
            title="No financial transactions"
            detail="Real banking operations are not connected. No balances or transactions are fabricated."
            icon={Activity}
          />
        )}
        {tab === "Documents" && (
          <>
            <h3>Identity Verification</h3>
            <Status value={c.verification_status} />
            <Empty
              title="No verified documents"
              detail="Secure document collection and institutional verification are not connected."
              icon={FileCheck}
            />
          </>
        )}
        {tab === "Administrative History" && (
          <>
            <h3>Account changes & notes</h3>
            {c.notes && <p className="admin-note">{c.notes}</p>}
            <div className="admin-history">
              {query.data.history.map((a) => (
                <article key={a.id}>
                  <span className="admin-history-dot" />
                  <div>
                    <h3>{a.action} · Customer record</h3>
                    <p>{a.reason || "Record created by the primary administrator."}</p>
                    <small>
                      {new Date(a.created_at).toLocaleString()} · Administrator{" "}
                      {a.actor_id.slice(0, 8)}
                    </small>
                    {a.old_values && (
                      <details>
                        <summary>Old and new values</summary>
                        <div className="admin-audit-values">
                          <pre>{JSON.stringify(a.old_values, null, 2)}</pre>
                          <pre>{JSON.stringify(a.new_values, null, 2)}</pre>
                        </div>
                      </details>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
      <StatusDialog target={target} onClose={() => setTarget(null)} />
    </>
  );
}
