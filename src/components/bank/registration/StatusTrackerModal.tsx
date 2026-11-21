import React, { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  FileText,
  LoaderCircle,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { lookupApplicationStatusFn } from "@/lib/application.functions";

interface StatusTrackerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialReference?: string;
}

export function StatusTrackerModal({
  open,
  onOpenChange,
  initialReference = "",
}: StatusTrackerModalProps) {
  const [refInput, setRefInput] = useState(initialReference);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [record, setRecord] = useState<{
    referenceNumber: string;
    status: string;
    submittedAt: string;
    updatedAt: string;
    applicantName: string;
    accountTypeName: string;
    currency: string;
    auditTrail: Array<{
      timestamp: string;
      actor: string;
      action: string;
      note?: string;
    }>;
  } | null>(null);

  const lookupFn = useServerFn(lookupApplicationStatusFn);

  // Sync initialReference if modal opens with one
  React.useEffect(() => {
    if (initialReference) {
      setRefInput(initialReference);
      void handleSearch(initialReference);
    }
  }, [initialReference]);

  const handleSearch = async (overrideRef?: string) => {
    const targetRef = overrideRef || refInput;
    if (!targetRef.trim()) {
      setError("Please enter a valid reference number.");
      return;
    }
    setLoading(true);
    setError("");
    setRecord(null);

    try {
      const res = await lookupFn({ data: { referenceNumber: targetRef.trim() } });
      setRecord(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Application not found. Please verify your reference number.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-600 text-white flex items-center gap-1 text-xs">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>APPROVED · ACCOUNT ISSUED</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1 text-xs">
            <X className="h-3.5 w-3.5" />
            <span>APPLICATION DECLINED</span>
          </Badge>
        );
      case "ADDITIONAL_INFO_REQUESTED":
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20 text-xs">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            <span>ADDITIONAL DOCUMENTATION REQUESTED</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-primary text-primary bg-primary/10 text-xs flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span>UNDER COMPLIANCE REVIEW</span>
          </Badge>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            <span>Track Application Status</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Enter your official Auremont Trust Bank application reference number to view real-time compliance status and audit notes.
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            value={refInput}
            onChange={(e) => setRefInput(e.target.value.toUpperCase())}
            placeholder="e.g. ATB-2026-X7K9P"
            className="font-mono text-sm uppercase tracking-wider"
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSearch();
            }}
          />
          <Button
            type="button"
            disabled={loading}
            onClick={() => void handleSearch()}
            className="text-xs bg-primary text-primary-foreground gap-1.5 shrink-0"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            <span>Lookup</span>
          </Button>
        </div>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Result Card */}
        {record && (
          <div className="rounded-xl border border-border/80 bg-card p-4 space-y-4 shadow-sm mt-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <span className="text-[11px] text-muted-foreground block">Reference ID</span>
                <span className="font-mono font-bold text-sm text-foreground">
                  {record.referenceNumber}
                </span>
              </div>
              <div>{getStatusBadge(record.status)}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Applicant</span>
                <span className="font-medium text-foreground">{record.applicantName}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Requested Tier</span>
                <span className="font-medium text-foreground">
                  {record.accountTypeName} ({record.currency})
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Submitted</span>
                <span className="font-medium text-foreground">
                  {new Date(record.submittedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Last Updated</span>
                <span className="font-medium text-foreground">
                  {new Date(record.updatedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            {/* Audit Trail Timeline */}
            <div className="border-t border-border/60 pt-3 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Compliance Review Log
              </span>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {record.auditTrail?.map((entry, idx) => (
                  <div key={idx} className="rounded-md border border-border/50 bg-muted/20 p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-semibold text-foreground">{entry.action}</span>
                      <span>{new Date(entry.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    {entry.note && (
                      <p className="text-[11px] text-muted-foreground italic">
                        "{entry.note}"
                      </p>
                    )}
                    <span className="text-[10px] text-muted-foreground/80 block">
                      Auditor: {entry.actor}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
