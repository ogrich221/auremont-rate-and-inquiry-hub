import React, { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  FileText,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  Eye,
  Shield,
  Lock,
  User,
  Phone,
  Coins,
  Send,
  LoaderCircle,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdminApplicationsListFn,
  updateApplicationDecisionFn,
} from "@/lib/application.functions";
import type { ApplicationRecord, ApplicationStatus } from "@/components/bank/registration/types";

export function AdminApplicationsTab() {
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  // Decision formulation
  const [decisionStatus, setDecisionStatus] = useState<ApplicationStatus>("APPROVED");
  const [decisionNote, setDecisionNote] = useState("");
  const [decisionOfficer, setDecisionOfficer] = useState("Chief Compliance Officer");
  const [decisionBusy, setDecisionBusy] = useState(false);
  const [decisionSuccess, setDecisionSuccess] = useState("");
  const [decisionError, setDecisionError] = useState("");

  const fetchApps = useServerFn(getAdminApplicationsListFn);
  const updateDecision = useServerFn(updateApplicationDecisionFn);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApps();
      setApplications(res.applications || []);
    } catch (err) {
      console.warn("Failed to load applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleOpenReview = (app: ApplicationRecord) => {
    setSelectedApp(app);
    setDecisionStatus(app.status);
    setDecisionNote("");
    setDecisionSuccess("");
    setDecisionError("");
  };

  const handleSaveDecision = async () => {
    if (!selectedApp) return;
    if (!decisionNote.trim()) {
      setDecisionError("Please provide an audit note explaining the decision.");
      return;
    }
    setDecisionBusy(true);
    setDecisionError("");
    setDecisionSuccess("");

    try {
      const res = await updateDecision({
        data: {
          referenceNumber: selectedApp.referenceNumber,
          newStatus: decisionStatus,
          decisionNote: decisionNote.trim(),
          actor: decisionOfficer,
        },
      });

      if (res.success && res.application) {
        setSelectedApp(res.application);
        setApplications((prev) =>
          prev.map((a) => (a.referenceNumber === res.application.referenceNumber ? res.application : a)),
        );
        setDecisionSuccess("Administrative decision recorded in audit trail.");
        setDecisionNote("");
      }
    } catch (err) {
      setDecisionError(
        err instanceof Error ? err.message : "Unable to save administrative decision.",
      );
    } finally {
      setDecisionBusy(false);
    }
  };

  const filtered = applications.filter((app) => {
    const matchesFilter = filterStatus === "ALL" || app.status === filterStatus;
    const matchesSearch =
      !searchQuery.trim() ||
      app.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-600 text-white text-[10px] font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>APPROVED</span>
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="text-[10px] font-semibold flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            <span>REJECTED</span>
          </Badge>
        );
      case "ADDITIONAL_INFO_REQUESTED":
        return (
          <Badge variant="outline" className="text-[10px] font-semibold border-amber-500 text-amber-700 bg-amber-50 dark:bg-amber-950/20">
            INFO REQUESTED
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] font-semibold border-primary text-primary bg-primary/10 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>UNDER REVIEW</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/70 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Account Onboarding Applications ({applications.length})</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Institutional review portal for compliance intake, KYC validation, and account provisioning decisions.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadData}
          disabled={loading}
          className="text-xs gap-1.5 self-start sm:self-auto"
        >
          {loading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
          <span>Refresh Queue</span>
        </Button>
      </div>

      {/* Security Reassurance Callout */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
        <Lock className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-foreground">Strict Privacy Architecture:</strong> Administrative roles can inspect applicant personal data, KYC metadata, and preferences. Customer passwords, 6-digit transaction PINs, and raw security question answers are cryptographically masked and inaccessible.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reference ID, Applicant Name, or Email..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(
            [
              ["ALL", "All"],
              ["UNDER_COMPLIANCE_REVIEW", "Under Review"],
              ["ADDITIONAL_INFO_REQUESTED", "Info Requested"],
              ["APPROVED", "Approved"],
              ["REJECTED", "Rejected"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setFilterStatus(val)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterStatus === val
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List View */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
          <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          <span>Loading submitted applications queue...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center space-y-2">
          <FileText className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-sm font-semibold text-foreground">No applications found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {searchQuery || filterStatus !== "ALL"
              ? "No records matched your current query or filter criteria."
              : "No customer account applications have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border/70 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Requested Tier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map((app) => (
                  <tr key={app.referenceNumber} className="hover:bg-muted/10 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {app.referenceNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{app.applicant.fullName}</div>
                      <div className="text-[11px] text-muted-foreground">{app.applicant.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{app.preferences.accountTypeName}</div>
                      <div className="text-[11px] text-muted-foreground">Currency: {app.preferences.currency}</div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(app.status)}</td>
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {new Date(app.submittedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenReview(app)}
                        className="text-xs gap-1 border-primary/40 hover:bg-primary/10 h-7 text-foreground"
                      >
                        <Eye className="h-3 w-3 text-primary" />
                        <span>Review</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Review Modal */}
      {selectedApp && (
        <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div>
                  <DialogTitle className="text-xl font-serif font-medium text-foreground flex items-center gap-2">
                    <span>Application Dossier ·</span>
                    <span className="font-mono text-primary font-bold">{selectedApp.referenceNumber}</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Submitted on {new Date(selectedApp.submittedAt).toLocaleString("en-GB")}
                  </DialogDescription>
                </div>
                <div>{getStatusBadge(selectedApp.status)}</div>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Applicant Profile */}
              <div className="rounded-lg border border-border/70 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <User className="h-4 w-4" />
                  <span>Applicant Information</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Full Name</span>
                    <span className="font-medium text-foreground">{selectedApp.applicant.fullName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Date of Birth</span>
                    <span className="font-medium text-foreground">{selectedApp.applicant.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Nationality</span>
                    <span className="font-medium text-foreground">{selectedApp.applicant.nationality}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Residence Country</span>
                    <span className="font-medium text-foreground">{selectedApp.applicant.countryOfResidence}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Legal Address</span>
                    <span className="font-medium text-foreground">
                      {selectedApp.applicant.residentialAddress}, {selectedApp.applicant.city},{" "}
                      {selectedApp.applicant.stateProvince} {selectedApp.applicant.postalCode}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Channels */}
              <div className="rounded-lg border border-border/70 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Phone className="h-4 w-4" />
                  <span>Verified Contact Channels</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Email Address</span>
                    <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                      {selectedApp.applicant.email}
                      <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-300">
                        Verified ✓
                      </Badge>
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mobile Phone</span>
                    <span className="font-medium text-foreground flex items-center gap-1.5 mt-0.5">
                      {selectedApp.applicant.phone}
                      <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-300">
                        OTP Verified ✓
                      </Badge>
                    </span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="rounded-lg border border-border/70 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <Coins className="h-4 w-4" />
                  <span>Requested Account Structure</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Account Type</span>
                    <span className="font-semibold text-foreground">{selectedApp.preferences.accountTypeName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Base Currency</span>
                    <span className="font-medium text-foreground">{selectedApp.preferences.currency}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Occupation</span>
                    <span className="font-medium text-foreground">{selectedApp.preferences.occupation}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Source of Wealth</span>
                    <span className="font-medium text-foreground">{selectedApp.preferences.sourceOfFunds}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Expected Monthly Volume</span>
                    <span className="font-medium text-foreground">{selectedApp.preferences.expectedActivity}</span>
                  </div>
                </div>
              </div>

              {/* Identity & Verification Documents */}
              <div className="rounded-lg border border-border/70 bg-card p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
                  <FileText className="h-4 w-4" />
                  <span>KYC Identity Documents</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Document Type</span>
                    <span className="font-medium text-foreground uppercase">
                      {selectedApp.identity.documentType.replace("_", " ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Masked ID Number</span>
                    <span className="font-mono text-foreground">{selectedApp.identity.documentNumberMasked}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Issuing Country</span>
                    <span className="font-medium text-foreground">{selectedApp.identity.issuingCountry}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Expiry Date</span>
                    <span className="font-medium text-foreground">{selectedApp.identity.expiryDate}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Front File</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-300">
                      {selectedApp.identity.frontDocumentFilename}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Address Verification</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-300">
                      {selectedApp.identity.proofOfAddressFilename}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Credentials Protected Notice */}
              <div className="rounded-lg bg-muted/30 border border-border/60 p-3 text-xs flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span>Credentials Status: Password Hashed · 6-Digit Transfer PIN Encrypted (••••••)</span>
                </div>
                <Badge variant="outline" className="text-[10px] text-emerald-700 border-emerald-300">
                  Secured
                </Badge>
              </div>

              {/* Administrative Decision Formulation */}
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-4">
                <div className="flex items-center justify-between border-b border-primary/20 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                    Record Compliance Committee Decision
                  </span>
                  <span className="text-[11px] text-muted-foreground">Immutable Audit Action</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Decision Action</label>
                    <Select
                      value={decisionStatus}
                      onValueChange={(val) => setDecisionStatus(val as ApplicationStatus)}
                    >
                      <SelectTrigger className="text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPROVED">Approve & Issue Account</SelectItem>
                        <SelectItem value="UNDER_COMPLIANCE_REVIEW">Set Under Compliance Review</SelectItem>
                        <SelectItem value="ADDITIONAL_INFO_REQUESTED">Request Additional Information</SelectItem>
                        <SelectItem value="REJECTED">Decline Application</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">Reviewing Officer</label>
                    <Input
                      value={decisionOfficer}
                      onChange={(e) => setDecisionOfficer(e.target.value)}
                      className="text-xs bg-background"
                      placeholder="e.g. Chief Compliance Officer"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Compliance Audit Note / Reason <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    value={decisionNote}
                    onChange={(e) => setDecisionNote(e.target.value)}
                    rows={2}
                    placeholder="e.g. Identity and residential documents validated against FATF guidelines. No sanctions flags."
                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>

                {decisionSuccess && (
                  <div className="rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 p-2 text-xs flex items-center gap-1.5 border border-emerald-200">
                    <Check className="h-3.5 w-3.5" />
                    <span>{decisionSuccess}</span>
                  </div>
                )}
                {decisionError && (
                  <div className="rounded-md bg-destructive/10 text-destructive p-2 text-xs flex items-center gap-1.5 border border-destructive/20">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{decisionError}</span>
                  </div>
                )}

                <Button
                  type="button"
                  disabled={decisionBusy || !decisionNote.trim()}
                  onClick={handleSaveDecision}
                  className="w-full sm:w-auto text-xs bg-primary text-primary-foreground font-semibold gap-1.5"
                >
                  {decisionBusy ? (
                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  <span>Commit Administrative Decision</span>
                </Button>
              </div>

              {/* Audit History Log */}
              <div className="space-y-2 border-t border-border/60 pt-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Application Audit Trail ({selectedApp.auditTrail?.length || 0})
                </span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedApp.auditTrail?.map((entry, idx) => (
                    <div key={idx} className="rounded-md border border-border/50 bg-muted/20 p-2.5 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{entry.action}</span>
                        <span>{new Date(entry.timestamp).toLocaleString("en-GB")}</span>
                      </div>
                      {entry.note && (
                        <p className="text-[11px] text-muted-foreground italic">
                          "{entry.note}"
                        </p>
                      )}
                      <span className="text-[10px] text-muted-foreground/80 block">
                        Actor: {entry.actor}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
