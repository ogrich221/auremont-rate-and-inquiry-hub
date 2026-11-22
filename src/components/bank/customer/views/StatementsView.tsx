import React, { useState } from "react";
import {
  FileText,
  Download,
  Calendar,
  Eye,
  FileCheck,
  CheckCircle2,
  X,
  Search,
  Sparkles,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import { Button } from "@/components/ui/button";
import type { CustomerStatement } from "../customer-types";

export function StatementsView() {
  const { statements, accounts, activeAccount, profile } = useCustomerBanking();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [previewStatement, setPreviewStatement] = useState<CustomerStatement | null>(null);

  const filteredStatements = statements.filter((s) => {
    return selectedAccountId === "all" || s.accountId === selectedAccountId;
  });

  const handleDownload = (stmt: CustomerStatement) => {
    alert(`Downloading official certified bank statement: ${stmt.documentName}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="text-[11px] font-semibold tracking-widest text-[#C6A66B] uppercase flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5" /> Certified Institutional Documentation
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mt-1">
            Statements & Financial Records
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Access, view, and securely download digitally signed account statements and tax certificates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs outline-none"
          >
            <option value="all">All Accounts ({statements.length})</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Account Opening Documents Reassurance Banner */}
      <div className="p-5 rounded-xl border border-[#C6A66B]/30 bg-[#C6A66B]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-3">
          <FileCheck className="h-5 w-5 text-[#C6A66B] shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground text-sm font-serif block">
              Auremont Master Client Agreement & Account Charter
            </strong>
            <span className="text-muted-foreground">
              Digitally sealed upon verification of Client ID {profile.customerId}. Retained under regulatory compliance.
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => alert("Downloading signed master client agreement (PDF).")}
          className="text-xs shrink-0 border-[#C6A66B]/40 hover:border-[#C6A66B]"
        >
          <Download className="h-3.5 w-3.5 text-[#C6A66B]" />
          <span>Download Master Agreement</span>
        </Button>
      </div>

      {/* Statement Records List */}
      <div className="rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border/40 text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="py-3 px-4">Document Title</th>
                <th className="py-3 px-4">Account Facility</th>
                <th className="py-3 px-4">Statement Period</th>
                <th className="py-3 px-4">Generated Date</th>
                <th className="py-3 px-4">File Size</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredStatements.map((stmt) => (
                <tr key={stmt.id} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <FileText className="h-4 w-4 text-[#C6A66B] shrink-0" />
                      <div>
                        <strong className="block text-foreground font-medium font-mono text-xs">
                          {stmt.documentName}
                        </strong>
                        <span className="text-[10px] text-muted-foreground">
                          Digitally Authenticated PDF
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-foreground">{stmt.accountName}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{stmt.period}</td>
                  <td className="py-3.5 px-4 text-muted-foreground">{stmt.dateGenerated}</td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">{stmt.size}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewStatement(stmt)}
                        className="h-7 text-xs text-[#C6A66B] hover:text-[#b5955a] gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(stmt)}
                        className="h-7 text-xs gap-1 border-border/70 hover:border-[#C6A66B]"
                      >
                        <Download className="h-3 w-3 text-[#C6A66B]" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STATEMENT PREVIEW MODAL */}
      {previewStatement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-background border border-border/80 rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#C6A66B]" />
                <h3 className="text-base font-serif font-bold text-foreground">
                  Statement Preview: {previewStatement.period}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewStatement(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Document Header Representation */}
            <div className="border border-border p-6 rounded-lg bg-card space-y-4 text-xs font-mono">
              <div className="flex justify-between items-start border-b border-border/40 pb-3">
                <div>
                  <h4 className="text-sm font-serif font-bold text-foreground">AUREMONT TRUST BANK PLC</h4>
                  <span className="text-[10px] text-muted-foreground block">
                    Institutional Wealth Charter No. 1894-ATB
                  </span>
                  <span className="text-[10px] text-muted-foreground block">London & Geneva</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted-foreground block">STATEMENT PERIOD</span>
                  <strong className="text-xs text-foreground">{previewStatement.period}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[11px]">
                <div>
                  <span className="text-muted-foreground block">CLIENT NAME</span>
                  <strong className="text-foreground">
                    {profile.firstName} {profile.lastName}
                  </strong>
                  <span className="text-muted-foreground block text-[10px]">
                    {profile.residentialAddress.street}, {profile.residentialAddress.city}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">FACILITY</span>
                  <strong className="text-foreground">{previewStatement.accountName}</strong>
                  <span className="text-muted-foreground block text-[10px]">
                    Client ID: {profile.customerId}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded bg-muted/40 text-[10px] text-center text-muted-foreground">
                [Certified Electronic Statement Record — 100% Tax & Audit Compliant]
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border/40">
              <span className="text-xs text-muted-foreground">Digital Signature: SHA-256 Validated</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewStatement(null)}
                >
                  Close
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleDownload(previewStatement)}
                  className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
