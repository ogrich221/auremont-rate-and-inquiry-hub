import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Clock,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Emblem } from "@/components/bank/shell";

interface RegistrationSuccessProps {
  referenceNumber: string;
  submittedAt: string;
  onOpenStatusTracker: (ref: string) => void;
}

export function RegistrationSuccess({
  referenceNumber,
  submittedAt,
  onOpenStatusTracker,
}: RegistrationSuccessProps) {
  const [copied, setCopied] = useState(false);

  const formattedDate = new Date(submittedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  const copyReference = () => {
    navigator.clipboard.writeText(referenceNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-2xl py-6 space-y-8 text-center sm:text-left">
      {/* Header Emblem & Status Badge */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border/70 pb-6">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 text-primary flex items-center justify-center">
            <Emblem />
          </div>
          <div className="text-left">
            <span className="text-[10px] font-bold tracking-widest uppercase text-primary block">
              AUREMONT TRUST BANK
            </span>
            <span className="text-xs text-muted-foreground">Private & Commercial Onboarding</span>
          </div>
        </div>
        <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-3 py-1 text-xs font-semibold flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 animate-pulse" />
          <span>PENDING COMPLIANCE REVIEW</span>
        </Badge>
      </div>

      {/* Main Announcement */}
      <div className="space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight text-foreground">
          Your Application Has Been Received!
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Thank you for choosing Auremont Trust Bank. Your application has been securely submitted for review. We will communicate the next steps through your verified contact information.
        </p>
      </div>

      {/* Reference Number Card */}
      <div className="rounded-xl border border-primary/30 bg-card p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
              Application Reference Number
            </span>
            <span className="text-2xl font-mono font-bold tracking-wide text-foreground mt-0.5 block">
              {referenceNumber}
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyReference}
            className="text-xs gap-1.5 border-primary/40 hover:bg-primary/10 self-start sm:self-auto"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? "Copied to Clipboard" : "Copy Reference"}</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div>
            <span className="text-muted-foreground block">Submission Timestamp</span>
            <span className="font-medium text-foreground">{formattedDate}</span>
          </div>
          <div>
            <span className="text-muted-foreground block">Institutional Gateway</span>
            <span className="font-medium text-foreground">Zurich Core Gateway (Encrypted)</span>
          </div>
        </div>
      </div>

      {/* Application Lifecycle Progression */}
      <div className="rounded-xl border border-border/80 bg-muted/20 p-5 space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Next Steps in Your Onboarding Lifecycle
        </h4>

        <div className="space-y-4">
          {/* Step A */}
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0 mt-0.5">
              ✓
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">1. Application & KYC Intake Received</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Your dossier and encrypted identity proofs have been ingested into our secure regulatory queue.
              </p>
            </div>
          </div>

          {/* Step B */}
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0 mt-0.5">
              2
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">2. Compliance & Anti-Money Laundering Review</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Our compliance officers examine credentials against international standards. Typical turnaround is 1 to 2 business days.
              </p>
            </div>
          </div>

          {/* Step C */}
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground text-xs font-bold shrink-0 mt-0.5">
              3
            </span>
            <div>
              <div className="text-xs font-semibold text-foreground">3. Account Activation & Private Key Delivery</div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Upon compliance clearance, your account details, welcome package, and digital tokens will be dispatched to your verified channels.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statutory Clarity Disclaimer */}
      <div className="rounded-lg border border-border/70 bg-card p-4 text-xs text-muted-foreground flex items-start gap-3">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-foreground font-semibold">Important Regulatory Note:</strong> Submission of this registration does not constitute approval or account creation. A full deposit-taking account is only established once identity verification, AML underwriting, and regulatory checks are approved by our compliance committee.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <Button
          type="button"
          onClick={() => onOpenStatusTracker(referenceNumber)}
          className="w-full sm:w-auto bg-primary text-primary-foreground text-xs font-semibold h-10 px-5 gap-2"
        >
          <Search className="h-3.5 w-3.5" />
          <span>Track Application Status</span>
        </Button>

        <Button
          variant="outline"
          asChild
          className="w-full sm:w-auto text-xs h-10 px-5 gap-2 border-border"
        >
          <Link to="/">
            <span>Return to Homepage</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
