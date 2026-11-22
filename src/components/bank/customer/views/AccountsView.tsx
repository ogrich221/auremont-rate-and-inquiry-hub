import React, { useState } from "react";
import {
  Landmark,
  ShieldCheck,
  Download,
  Send,
  Eye,
  EyeOff,
  History,
  FileText,
  CreditCard,
  Copy,
  Check,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import { Button } from "@/components/ui/button";
import type { CustomerAccount } from "../customer-types";

export function AccountsView() {
  const {
    accounts,
    activeAccount,
    setActiveAccount,
    setActiveSection,
    isBalanceVisible,
    setIsBalanceVisible,
  } = useCustomerBanking();

  const [selectedAccDetails, setSelectedAccDetails] = useState<CustomerAccount | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="text-[11px] font-semibold tracking-widest text-[#C6A66B] uppercase flex items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5" /> Private Account Portfolio
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mt-1">
            My Accounts
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Comprehensive control and routing parameters for your checking, high-yield reserve, and multi-currency facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="text-xs gap-1.5"
          >
            {isBalanceVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span>{isBalanceVisible ? "Hide Balances" : "Show Balances"}</span>
          </Button>
          <Button
            size="sm"
            onClick={() => setActiveSection("domestic-transfers")}
            className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs gap-1.5"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Transfer Funds</span>
          </Button>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map((acc) => {
          const isSelected = activeAccount.id === acc.id;
          return (
            <div
              key={acc.id}
              className={`p-6 rounded-2xl border transition-all duration-300 relative flex flex-col justify-between space-y-5 ${
                isSelected
                  ? "bg-gradient-to-br from-[#101D32] to-[#172C49] text-white border-[#C6A66B] shadow-lg"
                  : "bg-white/75 dark:bg-slate-900/60 backdrop-blur-md border-white/60 dark:border-slate-800 text-foreground shadow-sm hover:shadow-md hover:border-[#C6A66B]/50"
              }`}
            >
              {/* Top row */}
              <div className="flex items-start justify-between">
                <div>
                  <span
                    className={`text-[10px] uppercase font-semibold tracking-wider block ${
                      isSelected ? "text-[#C6A66B]" : "text-muted-foreground"
                    }`}
                  >
                    {acc.type}
                  </span>
                  <h3
                    className={`text-lg font-serif font-bold ${
                      isSelected ? "text-white" : "text-foreground"
                    }`}
                  >
                    {acc.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-flex items-center gap-1 ${
                      isSelected
                        ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                        : "bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{acc.status}</span>
                  </span>
                  {isSelected && (
                    <span className="text-[10px] bg-[#C6A66B] text-[#101D32] font-semibold px-2 py-0.5 rounded">
                      Active Default
                    </span>
                  )}
                </div>
              </div>

              {/* Middle row: Balances */}
              <div className="space-y-1">
                <span
                  className={`text-xs block ${
                    isSelected ? "text-slate-300" : "text-muted-foreground"
                  }`}
                >
                  Available Balance
                </span>
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-3xl font-serif font-bold tracking-tight ${
                      isSelected ? "text-white" : "text-foreground"
                    }`}
                  >
                    {isBalanceVisible
                      ? `${acc.currency === "GBP" ? "£" : acc.currency === "USD" ? "$" : "€"}${acc.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                      : "••••••••••"}
                  </span>
                  <span
                    className={`text-xs font-mono font-medium ${
                      isSelected ? "text-[#C6A66B]" : "text-muted-foreground"
                    }`}
                  >
                    {acc.currency}
                  </span>
                </div>
                {acc.interestRate && (
                  <span className="text-xs text-[#C6A66B] font-medium block pt-1">
                    Yield Rate: {acc.interestRate}
                  </span>
                )}
              </div>

              {/* Bottom row: Account number & actions */}
              <div
                className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                  isSelected ? "border-white/15" : "border-border/40"
                }`}
              >
                <div>
                  <span
                    className={`text-[10px] block ${
                      isSelected ? "text-slate-300" : "text-muted-foreground"
                    }`}
                  >
                    Account Number
                  </span>
                  <span
                    className={`font-mono font-medium ${
                      isSelected ? "text-white" : "text-foreground"
                    }`}
                  >
                    {acc.maskedAccountNumber}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setSelectedAccDetails(acc)}
                    className="h-7 text-xs px-2.5"
                  >
                    View Details
                  </Button>
                  <Button
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => {
                      setActiveAccount(acc);
                      setActiveSection("transactions");
                    }}
                    className="h-7 text-xs px-2.5"
                  >
                    Transactions
                  </Button>
                  <Button
                    variant={isSelected ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setActiveSection("statements")}
                    className="h-7 text-xs px-2.5"
                    title="Download Statement"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ACCOUNT DETAILS MODAL */}
      {selectedAccDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-background border border-border/80 rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="h-5 w-5 text-[#C6A66B]" />
                <h3 className="text-base font-serif font-bold text-foreground">
                  {selectedAccDetails.name} Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAccDetails(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-lg bg-muted/40 space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Status:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> {selectedAccDetails.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Opening Date:</span>
                  <span className="font-medium text-foreground">{selectedAccDetails.openingDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Account Currency:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {selectedAccDetails.currency}
                  </span>
                </div>
              </div>

              {/* Routing Codes */}
              <div className="space-y-2 pt-2 border-t border-border/40">
                <div className="flex justify-between items-center p-2 rounded hover:bg-muted/30">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Full Account Number</span>
                    <span className="font-mono font-semibold text-foreground">
                      {selectedAccDetails.accountNumber}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedAccDetails.accountNumber, "acc")}
                    className="h-7 text-xs gap-1"
                  >
                    {copiedField === "acc" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedField === "acc" ? "Copied" : "Copy"}</span>
                  </Button>
                </div>

                <div className="flex justify-between items-center p-2 rounded hover:bg-muted/30">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Sort Code / Routing</span>
                    <span className="font-mono font-semibold text-foreground">
                      {selectedAccDetails.routingNumber}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(selectedAccDetails.routingNumber, "route")}
                    className="h-7 text-xs gap-1"
                  >
                    {copiedField === "route" ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedField === "route" ? "Copied" : "Copy"}</span>
                  </Button>
                </div>

                {selectedAccDetails.iban && (
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/30">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">IBAN Number</span>
                      <span className="font-mono font-semibold text-foreground">
                        {selectedAccDetails.iban}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(selectedAccDetails.iban || "", "iban")}
                      className="h-7 text-xs gap-1"
                    >
                      {copiedField === "iban" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedField === "iban" ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                )}

                {selectedAccDetails.swiftBic && (
                  <div className="flex justify-between items-center p-2 rounded hover:bg-muted/30">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">SWIFT / BIC Code</span>
                      <span className="font-mono font-semibold text-foreground">
                        {selectedAccDetails.swiftBic}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(selectedAccDetails.swiftBic || "", "swift")}
                      className="h-7 text-xs gap-1"
                    >
                      {copiedField === "swift" ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                      <span>{copiedField === "swift" ? "Copied" : "Copy"}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border/40">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveAccount(selectedAccDetails);
                  setSelectedAccDetails(null);
                }}
                className="text-xs"
              >
                Set as Primary Funding Account
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setSelectedAccDetails(null)}
                className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
