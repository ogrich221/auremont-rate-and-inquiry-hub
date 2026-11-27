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
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
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
  deleteCustomer,
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
import {
  CreditDebitDialog,
  EditTransactionDialog,
  DeleteTransactionDialog,
  type AdminTransaction,
} from "./TransactionDialogs";
export function CustomerActions({
  customer,
  onStatus,
  onDelete,
}: {
  customer: Customer;
  onStatus: (c: Customer, status: Customer["status"], archive?: boolean) => void;
  onDelete?: (c: Customer) => void;
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
              Manage Status
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {customer.status !== "Suspended" ? (
              <DropdownMenuItem onSelect={() => onStatus(customer, "Suspended")}>
                <Pause />
                Suspend Account
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => onStatus(customer, "Active")}>
                <Play />
                Reactivate Account
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onSelect={() => onStatus(customer, "Closed")}>
              <LockKeyhole />
              Close Account
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive font-medium"
              onSelect={() => (onDelete ? onDelete(customer) : onStatus(customer, "Closed", true))}
            >
              <Trash2 />
              Delete User
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DeleteCustomerDialog({
  customer,
  onClose,
  onDeleted,
}: {
  customer: Customer | null;
  onClose: () => void;
  onDeleted?: () => void;
}) {
  const { refresh, notify } = useAdmin();
  const remove = useServerFn(deleteCustomer);
  const [permanent, setPermanent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!customer) return null;

  return (
    <Dialog open={!!customer} onOpenChange={(open) => !open && !busy && onClose()}>
      <DialogContent className="admin-dialog">
        <DialogTitle className="text-destructive flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Delete Customer Account
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to delete <strong>{fullName(customer)}</strong> ({customer.email})?
        </DialogDescription>
        <div className="space-y-4 py-2">
          <div className="p-3 rounded-lg border border-border/60 bg-muted/30 text-xs space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="delete_mode"
                checked={permanent}
                onChange={() => setPermanent(true)}
                className="mt-0.5"
              />
              <div>
                <strong className="block text-foreground font-semibold">Permanently Delete User</strong>
                <span className="text-muted-foreground text-[11px]">
                  Erases customer records, linked transactions, and access. This action cannot be undone.
                </span>
              </div>
            </label>
            <label className="flex items-start gap-2 cursor-pointer pt-2 border-t border-border/40">
              <input
                type="radio"
                name="delete_mode"
                checked={!permanent}
                onChange={() => setPermanent(false)}
                className="mt-0.5"
              />
              <div>
                <strong className="block text-foreground font-semibold">Archive Record (Soft Delete)</strong>
                <span className="text-muted-foreground text-[11px]">
                  Closes the account and archives customer data while preserving audit history.
                </span>
              </div>
            </label>
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
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setError("");
                try {
                  await remove({ data: { id: customer.id, permanent } });
                  await refresh();
                  notify(
                    permanent
                      ? "Customer record permanently deleted."
                      : "Customer record archived successfully.",
                  );
                  onClose();
                  onDeleted?.();
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Deletion failed.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Deleting…" : permanent ? "Permanently Delete" : "Archive Customer"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
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
            : "Changes affect official customer records and operational account status."}
        </DialogDescription>
        {target && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError("");
              const fd = new FormData(e.currentTarget);
              try {
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
              <span>Required verification checks and closure procedures are complete.</span>
            </label>
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
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
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
            : "A complete view of registered customer accounts."
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
                      onDelete={(customer) => setDeleteTarget(customer)}
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
      <DeleteCustomerDialog
        customer={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
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
            : "Create a customer profile and operational account record."
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
              <label htmlFor="customer-status">Account Status</label>
              <select
                id="customer-status"
                name="status"
                defaultValue={customer?.status ?? "Active"}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
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
            Administrative customer profiles and permissions are managed directly within the Auremont private banking workspace.
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
  const navigate = useNavigate();
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
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [creditDebitOpen, setCreditDebitOpen] = useState(false);
  const [creditDebitType, setCreditDebitType] = useState<"Credit" | "Debit">("Credit");
  const [editingTx, setEditingTx] = useState<AdminTransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<AdminTransaction | null>(null);
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
          <>
            <Button
              variant="outline"
              className="border-emerald-600/40 text-emerald-600 hover:bg-emerald-500/10 gap-1.5"
              onClick={() => {
                setCreditDebitType("Credit");
                setCreditDebitOpen(true);
              }}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Credit Account
            </Button>
            <Button
              variant="outline"
              className="border-rose-600/40 text-rose-600 hover:bg-rose-500/10 gap-1.5"
              onClick={() => {
                setCreditDebitType("Debit");
                setCreditDebitOpen(true);
              }}
            >
              <ArrowUpRight className="h-4 w-4" />
              Debit Account
            </Button>
            {c.status !== "Suspended" ? (
              <Button
                variant="outline"
                onClick={() => setTarget({ customer: c, status: "Suspended", archive: false })}
              >
                <Pause />
                Suspend Account
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setTarget({ customer: c, status: "Active", archive: false })}
              >
                <Play />
                Reactivate Account
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setTarget({ customer: c, status: c.status, archive: false })}
            >
              <Landmark />
              Manage Status
            </Button>
            <Button
              variant="destructive"
              onClick={() => setDeleteTarget(c)}
            >
              <Trash2 />
              Delete User
            </Button>
          </>
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
              ["Account Reference", maskReference(c.account_ref)],
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
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
              <div>
                <h3 className="text-base font-semibold text-foreground">Account Transactions</h3>
                <span className="text-xs text-muted-foreground">
                  History of verified credits, debits, wires, and internal transfers for this client.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-600 border-emerald-600/40 hover:bg-emerald-500/10 gap-1.5"
                  onClick={() => {
                    setCreditDebitType("Credit");
                    setCreditDebitOpen(true);
                  }}
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  Credit User
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-rose-600 border-rose-600/40 hover:bg-rose-500/10 gap-1.5"
                  onClick={() => {
                    setCreditDebitType("Debit");
                    setCreditDebitOpen(true);
                  }}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Debit User
                </Button>
              </div>
            </div>

            {!query.data.transactions?.length ? (
              <Empty
                title="No recent transaction activity"
                detail="Transaction logs and asset transfers for this account will appear here once executed."
                icon={Activity}
              >
                <Button
                  size="sm"
                  onClick={() => {
                    setCreditDebitType("Credit");
                    setCreditDebitOpen(true);
                  }}
                  className="mt-2"
                >
                  Post First Transaction
                </Button>
              </Empty>
            ) : (
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Type</th>
                      <th>Narration / Memo</th>
                      <th>Amount</th>
                      <th>Date & Time</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {query.data.transactions.map((tx: any) => {
                      const isCredit =
                        tx.transaction_type === "Deposit" || tx.transaction_type === "Credit";
                      return (
                        <tr key={tx.id}>
                          <td className="admin-mono font-medium">{tx.reference}</td>
                          <td>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                                isCredit
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                  : "bg-muted text-foreground"
                              }`}
                            >
                              {tx.transaction_type}
                            </span>
                          </td>
                          <td className="max-w-[220px] truncate" title={tx.provider_reference}>
                            {tx.provider_reference || "—"}
                          </td>
                          <td className="font-mono font-medium">
                            <span
                              className={
                                isCredit
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-foreground"
                              }
                            >
                              {isCredit ? "+" : "-"}
                              {tx.currency} {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="whitespace-nowrap text-xs text-muted-foreground">
                            {new Date(tx.occurred_at).toLocaleString()}
                          </td>
                          <td>
                            <Status value={tx.status} />
                          </td>
                          <td>
                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingTx(tx)}
                                title="Edit Date, Time, Narration & Amount"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:bg-destructive/10 h-8 w-8"
                                onClick={() => setDeletingTx(tx)}
                                title="Delete Transaction"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {tab === "Documents" && (
          <>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/40">
              <h3 className="text-base font-medium">Identity & KYC Verification</h3>
              <Status value={c.verification_status} />
            </div>
            <Empty
              title="No pending document requests"
              detail="Client identification records and compliance files are verified and securely archived."
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
      <DeleteCustomerDialog
        customer={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => {
          void navigate({
            to: "/admin/$section",
            params: { section: "users" },
            search: (p) => p,
          });
        }}
      />
      <CreditDebitDialog
        open={creditDebitOpen}
        onClose={() => setCreditDebitOpen(false)}
        preselectedCustomer={c}
        defaultType={creditDebitType}
        onSuccess={() => void query.refetch()}
      />
      <EditTransactionDialog
        transaction={editingTx}
        onClose={() => setEditingTx(null)}
        onSuccess={() => void query.refetch()}
      />
      <DeleteTransactionDialog
        transaction={deletingTx}
        onClose={() => setDeletingTx(null)}
        onSuccess={() => void query.refetch()}
      />
    </>
  );
}
