import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Pencil,
  Trash2,
  Calendar,
  FileText,
  DollarSign,
  Clock,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAdmin } from "./workspace";
import {
  recordCustomerTransaction,
  updateCustomerTransaction,
  deleteCustomerTransaction,
} from "@/lib/central-admin.functions";
import {
  currencies,
  transactionStatuses,
  fullName,
  type Customer,
} from "@/lib/admin-model";
import type { Tables } from "@/integrations/supabase/types";

export type AdminTransaction = Tables<"admin_transactions">;

function toLocalDateTimeInput(isoString?: string) {
  if (!isoString) {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }
  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export function CreditDebitDialog({
  open,
  onClose,
  preselectedCustomer,
  defaultType = "Credit",
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  preselectedCustomer?: Customer | null;
  defaultType?: "Credit" | "Debit";
  onSuccess?: () => void;
}) {
  const { data, refresh, notify } = useAdmin();
  const record = useServerFn(recordCustomerTransaction);
  const [type, setType] = useState<"Credit" | "Debit">(defaultType);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    preselectedCustomer?.id || data.customers[0]?.id || "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const activeCustomer =
    preselectedCustomer ||
    data.customers.find((c) => c.id === selectedCustomerId) ||
    data.customers[0];

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !busy) {
          setError("");
          onClose();
        }
      }}
    >
      <DialogContent className="admin-dialog sm:max-w-lg">
        <DialogTitle className="flex items-center gap-2">
          {type === "Credit" ? (
            <span className="p-1 rounded bg-emerald-500/10 text-emerald-600">
              <ArrowDownLeft className="h-5 w-5" />
            </span>
          ) : (
            <span className="p-1 rounded bg-rose-500/10 text-rose-600">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          )}
          <span>{type === "Credit" ? "Credit User Account" : "Debit User Account"}</span>
        </DialogTitle>
        <DialogDescription>
          Post a direct {type === "Credit" ? "deposit credit" : "withdrawal debit"} to the user's
          account. The balance and transaction history will reflect immediately.
        </DialogDescription>

        <form
          className="space-y-4 py-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const fd = new FormData(e.currentTarget);
            const customerId = preselectedCustomer?.id || String(fd.get("customer_id") || selectedCustomerId);

            if (!customerId) {
              setError("Please select a target customer.");
              setBusy(false);
              return;
            }

            const amount = parseFloat(String(fd.get("amount")));
            if (isNaN(amount) || amount <= 0) {
              setError("Amount must be a positive number.");
              setBusy(false);
              return;
            }

            const narration = String(fd.get("narration")).trim();
            if (!narration) {
              setError("Narration / Description is required.");
              setBusy(false);
              return;
            }

            const occurredAt = String(fd.get("occurred_at"));
            const currency = String(fd.get("currency")) as any;
            const status = String(fd.get("status")) as any;
            const reference = String(fd.get("reference")).trim() || undefined;

            try {
              await record({
                data: {
                  customer_id: customerId,
                  type,
                  amount,
                  currency,
                  occurred_at: occurredAt,
                  narration,
                  status,
                  reference,
                },
              });
              await refresh();
              notify(
                `${type === "Credit" ? "Credit" : "Debit"} of ${currency} ${amount.toLocaleString()} posted successfully.`,
              );
              onClose();
              onSuccess?.();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to record transaction.");
            } finally {
              setBusy(false);
            }
          }}
        >
          {/* Operation Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-lg border border-border/50">
            <button
              type="button"
              className={`py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                type === "Credit"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setType("Credit")}
            >
              <ArrowDownLeft className="h-4 w-4" />
              Credit (Deposit)
            </button>
            <button
              type="button"
              className={`py-2 px-3 text-xs font-semibold rounded-md flex items-center justify-center gap-2 transition-all ${
                type === "Debit"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setType("Debit")}
            >
              <ArrowUpRight className="h-4 w-4" />
              Debit (Withdrawal)
            </button>
          </div>

          {/* Customer Selection */}
          <div className="field">
            <label htmlFor="tx-customer">Target Customer *</label>
            {preselectedCustomer ? (
              <div className="admin-field-static font-medium">
                {fullName(preselectedCustomer)} ({preselectedCustomer.email}) · Ref:{" "}
                <span className="font-mono">{preselectedCustomer.customer_ref}</span>
              </div>
            ) : (
              <select
                id="tx-customer"
                name="customer_id"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                required
              >
                {data.customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {fullName(c)} ({c.email}) · {c.customer_ref}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label htmlFor="tx-amount">Amount *</label>
              <input
                id="tx-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="10000.00"
              />
            </div>
            <div className="field">
              <label htmlFor="tx-currency">Currency *</label>
              <select
                id="tx-currency"
                name="currency"
                defaultValue={activeCustomer?.currency || "USD"}
              >
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="field">
            <label htmlFor="tx-occurred-at" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Transaction Date & Time *
            </label>
            <input
              id="tx-occurred-at"
              name="occurred_at"
              type="datetime-local"
              defaultValue={toLocalDateTimeInput()}
              required
            />
            <span className="text-[11px] text-muted-foreground">
              Editable timestamp that displays on the user's transaction ledger and statements.
            </span>
          </div>

          {/* Narration / Description */}
          <div className="field">
            <label htmlFor="tx-narration" className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Narration / Description *
            </label>
            <textarea
              id="tx-narration"
              name="narration"
              rows={2}
              required
              placeholder={
                type === "Credit"
                  ? "e.g. Private Wealth Yield Disbursement, Portfolio Capital Injection"
                  : "e.g. Asset Management Fee Settlement, Private Wire Retainer"
              }
              maxLength={500}
            />
            <span className="text-[11px] text-muted-foreground">
              This narration is visible to the customer in their transaction history.
            </span>
          </div>

          {/* Status & Custom Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div className="field">
              <label htmlFor="tx-status">Execution Status</label>
              <select id="tx-status" name="status" defaultValue="Completed">
                {transactionStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="tx-reference">Custom Reference (Optional)</label>
              <input
                id="tx-reference"
                name="reference"
                placeholder="Auto-generated if empty"
                maxLength={40}
              />
            </div>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-form-actions pt-2">
            <Button variant="outline" type="button" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button
              disabled={busy}
              className={type === "Credit" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-rose-600 hover:bg-rose-700 text-white"}
            >
              {busy ? "Posting…" : type === "Credit" ? "Confirm Credit" : "Confirm Debit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function EditTransactionDialog({
  transaction,
  onClose,
  onSuccess,
}: {
  transaction: AdminTransaction | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { refresh, notify } = useAdmin();
  const update = useServerFn(updateCustomerTransaction);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!transaction) return null;

  return (
    <Dialog open={!!transaction} onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="admin-dialog sm:max-w-lg">
        <DialogTitle className="flex items-center gap-2">
          <Pencil className="h-5 w-5 text-amber-500" />
          <span>Edit Transaction Record</span>
        </DialogTitle>
        <DialogDescription>
          Modify the transaction timestamp, narration, amount, or execution status.
        </DialogDescription>

        <form
          className="space-y-4 py-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            const fd = new FormData(e.currentTarget);

            const amount = parseFloat(String(fd.get("amount")));
            if (isNaN(amount) || amount <= 0) {
              setError("Amount must be a positive number.");
              setBusy(false);
              return;
            }

            const narration = String(fd.get("narration")).trim();
            if (!narration) {
              setError("Narration / Description is required.");
              setBusy(false);
              return;
            }

            const occurredAt = String(fd.get("occurred_at"));
            const currency = String(fd.get("currency")) as any;
            const status = String(fd.get("status")) as any;
            const type = String(fd.get("type")) as any;

            try {
              await update({
                data: {
                  id: transaction.id,
                  amount,
                  currency,
                  occurred_at: occurredAt,
                  narration,
                  status,
                  type,
                },
              });
              await refresh();
              notify("Transaction updated successfully. Changes reflect in customer history.");
              onClose();
              onSuccess?.();
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to update transaction.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div className="p-3 rounded-lg border border-border/50 bg-muted/30 text-xs flex justify-between items-center">
            <div>
              <span className="text-muted-foreground block text-[11px]">Transaction Reference</span>
              <strong className="font-mono text-sm text-foreground">{transaction.reference}</strong>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block text-[11px]">Customer ID</span>
              <strong className="font-mono text-xs">{transaction.customer_id.slice(0, 12)}…</strong>
            </div>
          </div>

          {/* Date & Time */}
          <div className="field">
            <label htmlFor="edit-tx-occurred-at" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Transaction Date & Time *
            </label>
            <input
              id="edit-tx-occurred-at"
              name="occurred_at"
              type="datetime-local"
              defaultValue={toLocalDateTimeInput(transaction.occurred_at)}
              required
            />
            <span className="text-[11px] text-muted-foreground">
              Adjusting this date and time updates the chronological display in user history.
            </span>
          </div>

          {/* Narration */}
          <div className="field">
            <label htmlFor="edit-tx-narration" className="flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Narration / Description *
            </label>
            <textarea
              id="edit-tx-narration"
              name="narration"
              rows={2}
              defaultValue={transaction.provider_reference}
              required
              maxLength={500}
            />
            <span className="text-[11px] text-muted-foreground">
              Narration displayed on the user's dashboard and transaction receipts.
            </span>
          </div>

          {/* Amount, Currency & Type */}
          <div className="grid grid-cols-3 gap-3">
            <div className="field col-span-1">
              <label htmlFor="edit-tx-amount">Amount *</label>
              <input
                id="edit-tx-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={transaction.amount}
                required
              />
            </div>
            <div className="field col-span-1">
              <label htmlFor="edit-tx-currency">Currency</label>
              <select id="edit-tx-currency" name="currency" defaultValue={transaction.currency}>
                {currencies.map((curr) => (
                  <option key={curr} value={curr}>
                    {curr}
                  </option>
                ))}
              </select>
            </div>
            <div className="field col-span-1">
              <label htmlFor="edit-tx-type">Type</label>
              <select
                id="edit-tx-type"
                name="type"
                defaultValue={
                  transaction.transaction_type === "Deposit"
                    ? "Credit"
                    : transaction.transaction_type === "Withdrawal"
                      ? "Debit"
                      : transaction.transaction_type
                }
              >
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
                <option value="Domestic Transfer">Domestic Transfer</option>
                <option value="International Wire">International Wire</option>
                <option value="Bill Payment">Bill Payment</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div className="field">
            <label htmlFor="edit-tx-status">Transaction Status</label>
            <select id="edit-tx-status" name="status" defaultValue={transaction.status}>
              {transactionStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-form-actions pt-2">
            <Button variant="outline" type="button" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={busy}>
              {busy ? "Saving Changes…" : "Save Transaction Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteTransactionDialog({
  transaction,
  onClose,
  onSuccess,
}: {
  transaction: AdminTransaction | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const { refresh, notify } = useAdmin();
  const remove = useServerFn(deleteCustomerTransaction);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!transaction) return null;

  return (
    <Dialog open={!!transaction} onOpenChange={(v) => !v && !busy && onClose()}>
      <DialogContent className="admin-dialog">
        <DialogTitle className="text-destructive flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Delete Transaction
        </DialogTitle>
        <DialogDescription>
          Are you sure you want to delete transaction <strong>{transaction.reference}</strong> ({transaction.currency} {transaction.amount.toLocaleString()})?
        </DialogDescription>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="admin-form-actions pt-3">
          <Button variant="outline" disabled={busy} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                await remove({ data: { id: transaction.id } });
                await refresh();
                notify("Transaction record removed successfully.");
                onClose();
                onSuccess?.();
              } catch (err) {
                setError(err instanceof Error ? err.message : "Deletion failed.");
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Deleting…" : "Delete Transaction"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
