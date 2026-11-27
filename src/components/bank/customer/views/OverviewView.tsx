import React, { useState } from "react";
import {
  Eye,
  EyeOff,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Send,
  Download,
  Building2,
  Globe,
  Receipt,
  FileText,
  Landmark,
  PiggyBank,
  CreditCard,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import { Button } from "@/components/ui/button";
import type { CustomerTransaction } from "../customer-types";

export function OverviewView({
  onSelectTransaction,
}: {
  onSelectTransaction?: (tx: CustomerTransaction) => void;
} = {}) {
  const {
    profile,
    accounts,
    transactions,
    activeAccount,
    setActiveAccount,
    setActiveSection,
    isBalanceVisible,
    setIsBalanceVisible,
  } = useCustomerBanking();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const savingsAccount = accounts.find((a) => a.type === "Reserve Savings") || accounts[1]!;
  const checkingAccount = accounts.find((a) => a.type === "Premier Checking") || accounts[0]!;

  // Calculate monthly spending from debits
  const monthlySpending = transactions
    .filter((tx) => tx.type !== "Deposit" && tx.status === "Completed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const recentTransactions = transactions.slice(0, 5);

  const quickActions = [
    {
      title: "Send Money",
      desc: "Fast payment to contacts",
      icon: Send,
      action: () => setActiveSection("domestic-transfers"),
      highlight: true,
    },
    {
      title: "Receive Money",
      desc: "View routing & IBAN",
      icon: Download,
      action: () => setActiveSection("accounts"),
    },
    {
      title: "Domestic Transfer",
      desc: "Standard clearing rails",
      icon: Building2,
      action: () => setActiveSection("domestic-transfers"),
    },
    {
      title: "International Wire",
      desc: "SWIFT & global network",
      icon: Globe,
      action: () => setActiveSection("international-wires"),
    },
    {
      title: "Pay Bills",
      desc: "Utilities & scheduled",
      icon: Receipt,
      action: () => setActiveSection("pay-bills"),
    },
    {
      title: "View Statements",
      desc: "Monthly signed records",
      icon: FileText,
      action: () => setActiveSection("statements"),
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <span className="text-[11px] font-semibold tracking-widest text-[#C6A66B] uppercase flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Private Banking Client Workspace
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mt-1">
            Welcome Back, {profile.firstName}.
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Your finances, your priorities, all in one convenient place.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            className="text-xs gap-1.5 border-[#C6A66B]/30 hover:border-[#C6A66B]"
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

      {/* 4 TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CARD 1 - TOTAL ACCOUNT BALANCE */}
        <div className="relative overflow-hidden rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium uppercase tracking-wider text-[10px]">Total Balance</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#C6A66B]/15 text-[#C6A66B]">
              GBP Aggregate
            </span>
          </div>

          <div className="my-2">
            <strong className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-foreground block">
              {isBalanceVisible
                ? `£${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "••••••••••"}
            </strong>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 mt-3">
            <span>Primary: {checkingAccount.maskedAccountNumber}</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3" /> +3.4% this mo.
            </span>
          </div>
        </div>

        {/* CARD 2 - SAVINGS OVERVIEW */}
        <div className="relative overflow-hidden rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium uppercase tracking-wider text-[10px]">Savings Overview</span>
            <PiggyBank className="h-4 w-4 text-[#C6A66B]" />
          </div>

          <div className="my-2">
            <strong className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-foreground block">
              {isBalanceVisible
                ? `£${savingsAccount.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "••••••••••"}
            </strong>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 mt-3">
            <span>{savingsAccount.interestRate || "4.85% APY"} Yield</span>
            <span className="text-[#C6A66B] font-medium">Reserve Tier</span>
          </div>
        </div>

        {/* CARD 3 - RECENT SPENDING */}
        <div className="relative overflow-hidden rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium uppercase tracking-wider text-[10px]">Monthly Outflows</span>
            <CreditCard className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>

          <div className="my-2">
            <strong className="text-2xl md:text-3xl font-serif font-semibold tracking-tight text-foreground block">
              {isBalanceVisible
                ? `£${monthlySpending.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : "••••••••"}
            </strong>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 mt-3">
            <span>6 debit events</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">Within target limit</span>
          </div>
        </div>

        {/* CARD 4 - ACCOUNT STATUS */}
        <div className="relative overflow-hidden rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span className="font-medium uppercase tracking-wider text-[10px]">Account Tier</span>
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div className="my-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" /> Active
              </span>
              <span className="text-xs font-medium text-foreground">Secure & Active</span>
            </div>
            <span className="text-xs text-muted-foreground block mt-1.5 font-medium truncate">
              {profile.accountType}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40 mt-3">
            <span>Customer ID</span>
            <span className="font-mono text-foreground font-medium">{profile.customerId}</span>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS SECTION (6 Clickable Cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground tracking-tight flex items-center gap-2">
            <span>Quick Actions</span>
            <span className="text-xs text-muted-foreground font-normal">· Instant financial services</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((qa) => {
            const Icon = qa.icon;
            return (
              <button
                key={qa.title}
                type="button"
                onClick={qa.action}
                className={`group p-4 rounded-xl text-left border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[110px] ${
                  qa.highlight
                    ? "bg-gradient-to-br from-[#101D32] to-[#172C49] text-white border-[#C6A66B]/40 shadow-sm hover:shadow-md hover:border-[#C6A66B]"
                    : "bg-white/75 dark:bg-slate-900/60 backdrop-blur-md border-white/60 dark:border-slate-800 text-foreground hover:border-[#C6A66B]/50 hover:bg-white/95"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${
                      qa.highlight
                        ? "bg-[#C6A66B] text-[#101D32]"
                        : "bg-[#C6A66B]/15 text-[#C6A66B]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <ArrowUpRight
                    className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      qa.highlight ? "text-[#C6A66B]" : "text-muted-foreground group-hover:text-foreground"
                    }`}
                  />
                </div>

                <div className="mt-3">
                  <strong className="text-xs font-semibold block leading-tight">{qa.title}</strong>
                  <span
                    className={`text-[10px] block mt-0.5 line-clamp-1 ${
                      qa.highlight ? "text-slate-300" : "text-muted-foreground"
                    }`}
                  >
                    {qa.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* DUAL COLUMN: ACCOUNTS SUMMARY + RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Accounts Snapshot */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Accounts Portfolio</h3>
            <button
              onClick={() => setActiveSection("accounts")}
              className="text-xs text-[#C6A66B] hover:underline font-medium"
            >
              Manage ({accounts.length})
            </button>
          </div>

          <div className="space-y-3">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                onClick={() => setActiveAccount(acc)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  activeAccount.id === acc.id
                    ? "border-[#C6A66B] bg-[#C6A66B]/5 shadow-sm"
                    : "border-white/60 bg-white/70 dark:bg-slate-900/60 hover:bg-white/90"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground">{acc.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                    {acc.currency}
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-serif font-semibold text-foreground">
                    {isBalanceVisible
                      ? `${acc.currency === "GBP" ? "£" : acc.currency === "USD" ? "$" : "€"}${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                      : "••••••••"}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {acc.maskedAccountNumber}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Transactions Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Recent Activity</h3>
            <button
              onClick={() => setActiveSection("transactions")}
              className="text-xs text-[#C6A66B] hover:underline font-medium flex items-center gap-1"
            >
              <span>Full History</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border/40 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Transaction Details</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {recentTransactions.map((tx) => {
                    const isCredit = tx.type === "Deposit";
                    return (
                      <tr
                        key={tx.id}
                        onClick={() => onSelectTransaction?.(tx)}
                        className="hover:bg-muted/30 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <strong className="block text-xs text-foreground font-medium">
                            {tx.recipientMerchant}
                          </strong>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {tx.reference}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] text-muted-foreground">{tx.type}</span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-muted-foreground">
                          {tx.date.slice(0, 10)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-semibold font-mono ${
                              isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-foreground"
                            }`}
                          >
                            {isCredit ? "+" : "-"}
                            {tx.currency === "GBP" ? "£" : tx.currency === "USD" ? "$" : "€"}
                            {tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                              tx.status === "Completed"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : tx.status === "Pending"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-rose-500/10 text-rose-600"
                            }`}
                          >
                            <i className="h-1.5 w-1.5 rounded-full bg-current" />
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* PRIVATE WEALTH ADVISORY & CONCIERGE BANNER */}
      <div className="relative overflow-hidden rounded-2xl border border-[#C6A66B]/30 bg-gradient-to-r from-[#101D32] via-[#15253F] to-[#101D32] text-white p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-[#C6A66B]/20 text-[#C6A66B] border border-[#C6A66B]/30">
              <Sparkles className="h-3 w-3" /> Dedicated Wealth Advisory
            </span>
            <h3 className="text-xl font-serif font-bold text-white tracking-tight">
              Auremont Private Concierge & Liquidity Services
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your dedicated private wealth director, <strong>Lord Julian Vance</strong>, is on call for bespoke foreign exchange executions, syndicated asset finance, and private portfolio allocations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setActiveSection("help-support")}
              className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Contact Private Advisor</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveSection("statements")}
              className="border-white/20 text-white hover:bg-white/10 text-xs gap-1.5"
            >
              <FileText className="h-3.5 w-3.5 text-[#C6A66B]" />
              <span>Institutional Reports</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
