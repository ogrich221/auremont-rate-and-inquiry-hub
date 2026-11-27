import React, { useState, useMemo } from "react";
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Printer,
  X,
  Building2,
  Globe,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomerTransaction, TransactionType, TransactionStatus } from "../customer-types";

export function TransactionHistoryView({
  selectedTx,
  onSelectTx,
}: {
  selectedTx: CustomerTransaction | null;
  onSelectTx: (tx: CustomerTransaction | null) => void;
}) {
  const { transactions, refreshTransactions } = useCustomerBanking();

  React.useEffect(() => {
    void refreshTransactions();
  }, [refreshTransactions]);

  const [activeFilter, setActiveFilter] = useState<"ALL" | TransactionType>("ALL");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filters: ("ALL" | TransactionType)[] = [
    "ALL",
    "Credit",
    "Debit",
    "Deposit",
    "Withdrawal",
    "Domestic Transfer",
    "International Wire",
    "Bill Payment",
  ];

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = activeFilter === "ALL" || tx.type === activeFilter;
      const matchesSearch =
        !search.trim() ||
        tx.reference.toLowerCase().includes(search.toLowerCase()) ||
        tx.recipientMerchant.toLowerCase().includes(search.toLowerCase()) ||
        tx.description.toLowerCase().includes(search.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [transactions, activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedTransactions = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span>Completed</span>
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            <span>Pending</span>
          </span>
        );
      case "Failed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600">
            <XCircle className="h-3 w-3" />
            <span>Failed</span>
          </span>
        );
      case "Reversed":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-500/10 text-slate-600">
            <RotateCcw className="h-3 w-3" />
            <span>Reversed</span>
          </span>
        );
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="text-[11px] font-semibold tracking-widest text-[#C6A66B] uppercase flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" /> Immutable Clearing Ledger
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mt-1">
            Transaction History
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Comprehensive audit journal of institutional inflows, debits, wire dispatches, and utility settlements.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            alert("Exporting official CSV ledger for customer tax and accounting records.");
          }}
          className="text-xs gap-1.5 self-start sm:self-auto border-border hover:border-[#C6A66B]"
        >
          <Download className="h-3.5 w-3.5 text-[#C6A66B]" />
          <span>Export Ledger CSV</span>
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="space-y-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {filters.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => {
                setActiveFilter(f);
                setPage(1);
              }}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                activeFilter === f
                  ? "bg-[#C6A66B] text-[#101D32] font-semibold shadow-xs"
                  : "bg-white/60 dark:bg-slate-900/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "ALL" ? "All Transactions" : f}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Filter by Reference, Counterparty, Merchant, or Memo..."
              className="pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs outline-none"
            >
              <option value="all">All Dates</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last Quarter (90 Days)</option>
              <option value="year">Current Financial Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/40 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Transaction Ref</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Recipient / Counterparty</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-right">Status</th>
                <th className="py-3.5 px-4 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Receipt className="h-8 w-8 mx-auto opacity-40 mb-2" />
                    <p className="text-sm font-medium">No transactions found</p>
                    <span className="text-xs">Adjust your search criteria or filter options.</span>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((tx) => {
                  const isCredit = tx.type === "Deposit" || tx.type === "Credit";
                  return (
                    <tr
                      key={tx.id}
                      onClick={() => onSelectTx(tx)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">
                        {tx.reference}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          {tx.type === "International Wire" ? (
                            <Globe className="h-3 w-3 text-purple-500" />
                          ) : tx.type === "Domestic Transfer" ? (
                            <Building2 className="h-3 w-3 text-sky-500" />
                          ) : (
                            <Receipt className="h-3 w-3 text-[#C6A66B]" />
                          )}
                          <span>{tx.type}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="block text-foreground font-medium">
                          {tx.recipientMerchant}
                        </strong>
                        <span className="text-[10px] text-muted-foreground line-clamp-1">
                          {tx.description}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{tx.date}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-semibold font-mono text-sm ${
                            isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                          }`}
                        >
                          {isCredit ? "+" : "-"}
                          {tx.currency === "GBP" ? "£" : tx.currency === "USD" ? "$" : "€"}
                          {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">{getStatusBadge(tx.status)}</td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTx(tx);
                          }}
                          className="h-7 text-xs text-[#C6A66B] hover:text-[#b5955a]"
                        >
                          View Receipt
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredTransactions.length)} of{" "}
              {filteredTransactions.length} records
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 text-xs gap-1"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </Button>
              <span className="font-medium text-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="h-7 text-xs gap-1"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* TRANSACTION RECEIPT MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-background border border-border/80 rounded-xl shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-[#C6A66B]" />
                <h3 className="text-base font-serif font-bold text-foreground">
                  Official Transaction Voucher
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onSelectTx(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="text-center py-3 border-b border-border/40">
                <span className="text-[11px] text-muted-foreground block">Cleared Amount</span>
                <span className="text-2xl font-serif font-bold text-foreground">
                  {selectedTx.type === "Deposit" ? "+" : "-"}
                  {selectedTx.currency === "GBP" ? "£" : selectedTx.currency === "USD" ? "$" : "€"}
                  {selectedTx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">
                  ● Verified Institutional Settlement
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference Number:</span>
                  <span className="font-mono font-semibold text-foreground">{selectedTx.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Type:</span>
                  <span className="font-medium text-foreground">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Recipient / Merchant:</span>
                  <span className="font-medium text-foreground">{selectedTx.recipientMerchant}</span>
                </div>
                {selectedTx.recipientBank && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Recipient Bank:</span>
                    <span className="text-foreground">{selectedTx.recipientBank}</span>
                  </div>
                )}
                {selectedTx.recipientAccountMasked && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beneficiary Account:</span>
                    <span className="font-mono text-foreground">
                      {selectedTx.recipientAccountMasked}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Execution Date:</span>
                  <span className="text-foreground">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Applicable Fee:</span>
                  <span className="text-foreground">
                    {selectedTx.fee === 0 ? "£0.00 (Inclusive)" : `£${selectedTx.fee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Description / Purpose:</span>
                  <span className="text-foreground font-medium">{selectedTx.description}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 text-[10px] text-muted-foreground space-y-1">
                <span>Charter Clearing: Auremont Trust Bank PLC · Geneva & London</span>
                <span className="block font-mono">FIPS-140-3 Cryptographic Integrity Stamp</span>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrintReceipt}
                className="text-xs gap-1.5"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Voucher</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => onSelectTx(null)}
                className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs"
              >
                Close Receipt
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
