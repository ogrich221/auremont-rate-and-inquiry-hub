import React from "react";
import {
  FileCheck,
  Edit2,
  User,
  Phone,
  Coins,
  Shield,
  FileText,
  Lock,
  ArrowRight,
  LoaderCircle,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  accountTypes,
  type ApplicationFormData,
  type StepNumber,
} from "./types";

interface StepSixProps {
  data: ApplicationFormData;
  updateData: (fields: Partial<ApplicationFormData>) => void;
  onGoToStep: (step: StepNumber) => void;
  onSubmit: () => void;
  submitting: boolean;
  submitError: string;
}

export function StepSixReview({
  data,
  updateData,
  onGoToStep,
  onSubmit,
  submitting,
  submitError,
}: StepSixProps) {
  const selectedAccountInfo = accountTypes.find(
    (t) => t.id === data.preferredAccountType,
  );

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <FileCheck className="h-4 w-4" />
          <span>Step 6 of 6 · Application Review & Execution</span>
        </div>
        <h2 className="mt-1 text-2xl font-serif font-medium tracking-tight text-foreground sm:text-3xl">
          Review Your Application.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Please review the summary of your application below. You may edit any section before authorizing submission for compliance review.
        </p>
      </div>

      {/* Accordion Review Sections */}
      <Accordion
        type="multiple"
        defaultValue={["item-1", "item-2", "item-3", "item-4", "item-5"]}
        className="w-full space-y-3"
      >
        {/* Section 1: Personal Information */}
        <AccordionItem
          value="item-1"
          className="rounded-xl border border-border/80 bg-card px-4 py-1 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                <User className="h-4 w-4 text-primary" />
                <span>Personal Information</span>
              </div>
            </AccordionTrigger>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(1)}
              className="h-8 gap-1 text-xs text-primary hover:text-primary/80 font-medium"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>
          <AccordionContent className="pt-2 pb-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 rounded-lg bg-muted/20 p-3.5 border border-border/50">
              <div>
                <span className="text-muted-foreground block text-[11px]">Full Legal Name</span>
                <span className="font-medium text-foreground">
                  {data.firstName} {data.middleName ? `${data.middleName} ` : ""}{data.lastName}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Date of Birth</span>
                <span className="font-medium text-foreground">{data.dateOfBirth || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Gender</span>
                <span className="font-medium text-foreground">{data.gender || "Not specified"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Nationality</span>
                <span className="font-medium text-foreground">{data.nationality || "—"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Country of Residence</span>
                <span className="font-medium text-foreground">{data.countryOfResidence || "—"}</span>
              </div>
              <div className="sm:col-span-2 md:col-span-3">
                <span className="text-muted-foreground block text-[11px]">Residential Address</span>
                <span className="font-medium text-foreground">
                  {data.residentialAddress}, {data.city}, {data.stateProvince} {data.postalCode}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 2: Contact Information */}
        <AccordionItem
          value="item-2"
          className="rounded-xl border border-border/80 bg-card px-4 py-1 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>Contact Channels & Verification</span>
              </div>
            </AccordionTrigger>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(2)}
              className="h-8 gap-1 text-xs text-primary hover:text-primary/80 font-medium"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>
          <AccordionContent className="pt-2 pb-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 rounded-lg bg-muted/20 p-3.5 border border-border/50">
              <div>
                <span className="text-muted-foreground block text-[11px]">Email Address</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-medium text-foreground">{data.email}</span>
                  {data.emailVerified && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                      Verified ✓
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Mobile Phone</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-medium text-foreground">
                    {data.countryCallingCode} {data.mobilePhone}
                  </span>
                  {data.phoneVerified && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-300">
                      Verified ✓
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Preferred Channel</span>
                <span className="font-medium text-foreground">{data.preferredContactMethod}</span>
              </div>
              {data.alternativePhone && (
                <div>
                  <span className="text-muted-foreground block text-[11px]">Alternative Phone</span>
                  <span className="font-medium text-foreground">{data.alternativePhone}</span>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 3: Account Preferences */}
        <AccordionItem
          value="item-3"
          className="rounded-xl border border-border/80 bg-card px-4 py-1 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                <Coins className="h-4 w-4 text-primary" />
                <span>Account Structure & Preferences</span>
              </div>
            </AccordionTrigger>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(3)}
              className="h-8 gap-1 text-xs text-primary hover:text-primary/80 font-medium"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>
          <AccordionContent className="pt-2 pb-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 rounded-lg bg-muted/20 p-3.5 border border-border/50">
              <div className="sm:col-span-2">
                <span className="text-muted-foreground block text-[11px]">Selected Account Tier</span>
                <span className="font-semibold text-foreground">
                  {selectedAccountInfo?.name || data.preferredAccountType}
                </span>
                <span className="text-muted-foreground block text-[11px] mt-0.5">
                  {selectedAccountInfo?.tagline}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Base Currency</span>
                <Badge variant="outline" className="font-semibold text-primary border-primary/40 mt-1">
                  {data.preferredCurrency}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Employment Status</span>
                <span className="font-medium text-foreground">{data.employmentStatus}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Occupation</span>
                <span className="font-medium text-foreground">{data.occupation}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Source of Wealth</span>
                <span className="font-medium text-foreground">{data.sourceOfFunds}</span>
              </div>
              <div className="sm:col-span-3">
                <span className="text-muted-foreground block text-[11px]">Expected Monthly Turnover</span>
                <span className="font-medium text-foreground">{data.expectedActivity}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 4: Security Setup */}
        <AccordionItem
          value="item-4"
          className="rounded-xl border border-border/80 bg-card px-4 py-1 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                <span>Security & Authorization Credentials</span>
              </div>
            </AccordionTrigger>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(4)}
              className="h-8 gap-1 text-xs text-primary hover:text-primary/80 font-medium"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>
          <AccordionContent className="pt-2 pb-4 text-xs">
            <div className="space-y-3 rounded-lg bg-muted/20 p-3.5 border border-border/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Account Password</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-muted-foreground">••••••••••••</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-300">
                      High Entropy Set
                    </Badge>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">6-Digit Transfer PIN</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono tracking-widest text-muted-foreground">••••••</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50 border-emerald-300">
                      Non-Sequential Approved
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border-t border-border/40 pt-2.5">
                <span className="text-muted-foreground block text-[11px] mb-1">Configured Security Questions:</span>
                <ul className="space-y-1">
                  {data.securityQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-foreground">
                        #{idx + 1}: {q.question || "Question unselected"}
                      </span>
                      <span className="font-mono text-muted-foreground">Answer masked [SHA-256]</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Section 5: Identity Verification */}
        <AccordionItem
          value="item-5"
          className="rounded-xl border border-border/80 bg-card px-4 py-1 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" />
                <span>Identity Verification Documents</span>
              </div>
            </AccordionTrigger>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(5)}
              className="h-8 gap-1 text-xs text-primary hover:text-primary/80 font-medium"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>
          <AccordionContent className="pt-2 pb-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 rounded-lg bg-muted/20 p-3.5 border border-border/50">
              <div>
                <span className="text-muted-foreground block text-[11px]">Document Type</span>
                <span className="font-medium text-foreground uppercase">{data.documentType.replace("_", " ")}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Document Number</span>
                <span className="font-mono text-foreground">
                  {data.documentNumber ? `•••• ${data.documentNumber.slice(-4)}` : "—"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Issuing Country</span>
                <span className="font-medium text-foreground">{data.issuingCountry}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Expiry Date</span>
                <span className="font-medium text-foreground">{data.documentExpiryDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Front Scan</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                  {data.documentFrontFilename || "Uploaded"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Address Verification</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400">
                  {data.proofOfAddressFilename || "Uploaded"}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Mandatory Regulatory & Legal Agreements */}
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
          <Lock className="h-3.5 w-3.5 text-primary" />
          <span>Statutory Consents & Mandatory Declarations</span>
        </h4>

        <div className="space-y-3">
          {/* Checkbox 1: Terms */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="acceptedTerms"
              checked={data.acceptedTerms}
              onCheckedChange={(checked) => updateData({ acceptedTerms: !!checked })}
              className="mt-0.5"
            />
            <label htmlFor="acceptedTerms" className="text-xs text-foreground/90 leading-relaxed cursor-pointer">
              I accept the applicable{" "}
              <Link to="/terms" target="_blank" className="text-primary underline font-medium inline-flex items-center gap-0.5">
                General Banking Terms & Conditions <ExternalLink className="h-2.5 w-2.5" />
              </Link>
              , schedule of fees, and institutional electronic banking policies. <span className="text-destructive">*</span>
            </label>
          </div>

          {/* Checkbox 2: Privacy */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="acknowledgedPrivacy"
              checked={data.acknowledgedPrivacy}
              onCheckedChange={(checked) => updateData({ acknowledgedPrivacy: !!checked })}
              className="mt-0.5"
            />
            <label htmlFor="acknowledgedPrivacy" className="text-xs text-foreground/90 leading-relaxed cursor-pointer">
              I acknowledge the{" "}
              <Link to="/privacy" target="_blank" className="text-primary underline font-medium inline-flex items-center gap-0.5">
                Auremont Trust Bank Privacy Notice <ExternalLink className="h-2.5 w-2.5" />
              </Link>{" "}
              and consent to the lawful processing of my personal and financial records. <span className="text-destructive">*</span>
            </label>
          </div>

          {/* Checkbox 3: KYC Consent */}
          <div className="flex items-start gap-3">
            <Checkbox
              id="consentedIdentityCheck"
              checked={data.consentedIdentityCheck}
              onCheckedChange={(checked) => updateData({ consentedIdentityCheck: !!checked })}
              className="mt-0.5"
            />
            <label htmlFor="consentedIdentityCheck" className="text-xs text-foreground/90 leading-relaxed cursor-pointer">
              I certify that all information provided is accurate and authentic, and I give consent to Auremont Trust Bank to conduct required identity verification, sanction list screening, and AML compliance audits. <span className="text-destructive">*</span>
            </label>
          </div>

          {/* Checkbox 4: Optional Marketing */}
          <div className="flex items-start gap-3 pt-2 border-t border-border/60">
            <Checkbox
              id="marketingConsent"
              checked={data.marketingConsent}
              onCheckedChange={(checked) => updateData({ marketingConsent: !!checked })}
              className="mt-0.5"
            />
            <label htmlFor="marketingConsent" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
              <span className="text-foreground font-medium">(Optional)</span> I would like to receive curated macroeconomic briefings, wealth management publications, and institutional invitations from Auremont Trust Bank.
            </label>
          </div>
        </div>
      </div>

      {/* Submission Error Banner */}
      {submitError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
          {submitError}
        </div>
      )}

      {/* Submission Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <p className="text-[11px] text-muted-foreground">
          Submission transfers your encrypted dossier to our Zurich and London compliance desks.
        </p>

        <Button
          type="button"
          size="lg"
          disabled={
            submitting ||
            !data.acceptedTerms ||
            !data.acknowledgedPrivacy ||
            !data.consentedIdentityCheck
          }
          onClick={onSubmit}
          className="w-full sm:w-auto bg-primary text-primary-foreground font-semibold px-8 h-11 gap-2 shadow-md hover:bg-primary/90"
        >
          {submitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              <span>Transmitting Secure Application...</span>
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              <span>Submit Account Application</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
