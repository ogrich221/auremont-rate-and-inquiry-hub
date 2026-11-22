import React, { useState } from "react";
import {
  FileText,
  Upload,
  CheckCircle2,
  ShieldCheck,
  FileCheck,
  Image as ImageIcon,
  Sparkles,
  Lock,
  Globe,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  countryList,
  identityDocumentTypes,
  type ApplicationFormData,
} from "./types";

interface StepFiveProps {
  data: ApplicationFormData;
  updateData: (fields: Partial<ApplicationFormData>) => void;
  errors: Record<string, string>;
}

export function StepFiveIdentity({ data, updateData, errors }: StepFiveProps) {
  const [analyzingFront, setAnalyzingFront] = useState(false);
  const [analyzingBack, setAnalyzingBack] = useState(false);
  const [analyzingProof, setAnalyzingProof] = useState(false);

  const simulateFrontUpload = (filename = "passport_front_scan.pdf") => {
    setAnalyzingFront(true);
    setTimeout(() => {
      updateData({
        documentFrontUploaded: true,
        documentFrontFilename: filename,
      });
      setAnalyzingFront(false);
    }, 700);
  };

  const simulateBackUpload = (filename = "national_id_back_scan.jpg") => {
    setAnalyzingBack(true);
    setTimeout(() => {
      updateData({
        documentBackUploaded: true,
        documentBackFilename: filename,
      });
      setAnalyzingBack(false);
    }, 700);
  };

  const simulateProofUpload = (filename = "bank_statement_utility.pdf") => {
    setAnalyzingProof(true);
    setTimeout(() => {
      updateData({
        proofOfAddressUploaded: true,
        proofOfAddressFilename: filename,
      });
      setAnalyzingProof(false);
    }, 700);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <FileText className="h-4 w-4" />
          <span>Step 5 of 6 · Identity Verification (KYC / AML)</span>
        </div>
        <h2 className="mt-1 text-2xl font-serif font-medium tracking-tight text-foreground sm:text-3xl">
          Verify Your Official Identity.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          In strict compliance with international banking regulations (FINMA, FATF, and AML standards), please present a clear government-issued photographic identity document and recent residential verification.
        </p>
      </div>

      {/* Document Specification Fields */}
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <FileCheck className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Document Details</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Document Type */}
          <div className="space-y-1.5">
            <Label htmlFor="docType" className="text-xs font-medium text-foreground">
              Government Document Type <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.documentType}
              onValueChange={(val) =>
                updateData({ documentType: val as ApplicationFormData["documentType"] })
              }
            >
              <SelectTrigger id="docType">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {identityDocumentTypes.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Number */}
          <div className="space-y-1.5">
            <Label htmlFor="docNumber" className="text-xs font-medium text-foreground">
              Official Document / Passport Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="docNumber"
              value={data.documentNumber}
              onChange={(e) => updateData({ documentNumber: e.target.value })}
              placeholder="e.g. 548902811"
              className={errors["documentNumber"] ? "border-destructive" : ""}
            />
            {errors["documentNumber"] && (
              <p className="text-xs text-destructive">{errors["documentNumber"]}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Issuing Country */}
          <div className="space-y-1.5">
            <Label htmlFor="issuingCountry" className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>Issuing Jurisdiction <span className="text-destructive">*</span></span>
            </Label>
            <Select
              value={data.issuingCountry}
              onValueChange={(val) => updateData({ issuingCountry: val })}
            >
              <SelectTrigger id="issuingCountry">
                <SelectValue placeholder="Select country of issuance" />
              </SelectTrigger>
              <SelectContent>
                {countryList.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expiry Date */}
          <div className="space-y-1.5">
            <Label htmlFor="expiryDate" className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Document Expiry Date <span className="text-destructive">*</span></span>
            </Label>
            <Input
              id="expiryDate"
              type="date"
              value={data.documentExpiryDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) => updateData({ documentExpiryDate: e.target.value })}
              className={errors["documentExpiryDate"] ? "border-destructive" : ""}
            />
            {errors["documentExpiryDate"] && (
              <p className="text-xs text-destructive">{errors["documentExpiryDate"]}</p>
            )}
          </div>
        </div>
      </div>

      {/* Document Upload Area */}
      <div className="space-y-4">
        <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Photographic Document Scans <span className="text-destructive">*</span>
        </Label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Front of Document */}
          <div className="rounded-xl border border-dashed border-border/80 bg-card p-5 text-center flex flex-col items-center justify-between min-h-[190px] transition-colors hover:border-primary/60">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">
                Document Front Scan / Photo
              </h4>
              <p className="text-[11px] text-muted-foreground max-w-[240px]">
                Ensure your full name, photo, MRZ (machine-readable zone), and date of birth are clearly legible.
              </p>
            </div>

            {data.documentFrontUploaded ? (
              <div className="mt-3 w-full rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-mono truncate max-w-[150px]">
                    {data.documentFrontFilename}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-300">
                  Verified
                </Badge>
              </div>
            ) : (
              <div className="mt-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={analyzingFront}
                  onClick={() => simulateFrontUpload()}
                  className="w-full text-xs gap-1.5 border-primary/40 hover:bg-primary/10"
                >
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  {analyzingFront ? "Simulating AI Document Verification..." : "Upload Document Front"}
                </Button>
              </div>
            )}
          </div>

          {/* Back of Document (Optional if Passport, Required if ID/License) */}
          <div className="rounded-xl border border-dashed border-border/80 bg-card p-5 text-center flex flex-col items-center justify-between min-h-[190px] transition-colors hover:border-primary/60">
            <div className="space-y-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                <ImageIcon className="h-5 w-5" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">
                Document Back Scan {data.documentType === "passport" ? "(Optional)" : "(Required)"}
              </h4>
              <p className="text-[11px] text-muted-foreground max-w-[240px]">
                {data.documentType === "passport"
                  ? "Passport signature page or secondary endorsement page."
                  : "Reverse side showing address, barcodes, or national chip emblem."}
              </p>
            </div>

            {data.documentBackUploaded ? (
              <div className="mt-3 w-full rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-2.5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-mono truncate max-w-[150px]">
                    {data.documentBackFilename}
                  </span>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-300">
                  Verified
                </Badge>
              </div>
            ) : (
              <div className="mt-3 w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={analyzingBack}
                  onClick={() => simulateBackUpload()}
                  className="w-full text-xs gap-1.5 border-primary/40 hover:bg-primary/10"
                >
                  <Upload className="h-3.5 w-3.5 text-primary" />
                  {analyzingBack ? "Simulating AI Document Verification..." : "Upload Document Back"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Proof of Address Section */}
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Proof of Permanent Residence <span className="text-destructive">*</span>
            </h4>
          </div>
          <span className="text-[11px] text-muted-foreground">Issued within last 90 days</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Accepted documents: Certified municipal utility bill (water, gas, electricity), government tax statement, or accredited financial institution statement bearing your matching name and residential address.
        </p>

        {data.proofOfAddressUploaded ? (
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              <span className="font-mono">{data.proofOfAddressFilename}</span>
            </div>
            <Badge variant="outline" className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200 border-emerald-300">
              Address Verified
            </Badge>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={analyzingProof}
            onClick={() => simulateProofUpload()}
            className="w-full sm:w-auto text-xs gap-1.5 border-primary/40 hover:bg-primary/10"
          >
            <Upload className="h-3.5 w-3.5 text-primary" />
            {analyzingProof ? "Validating Address Credentials..." : "Upload Proof of Address Document"}
          </Button>
        )}
      </div>

      {/* Automated Security & AI Inspection Banner */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h5 className="text-xs font-semibold text-foreground flex items-center gap-2">
            <span>Automated Holographic & Cryptographic Quality Assurance</span>
            <Badge variant="outline" className="text-[10px] border-primary/40 text-primary">
              Active
            </Badge>
          </h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All submitted identification media are analyzed through our biometric and document authenticity pipeline to detect tampering, verify micro-print security watermarks, and check global sanction lists. Documents are securely held in encrypted AES-256 cloud isolation.
          </p>
        </div>
      </div>
    </div>
  );
}
