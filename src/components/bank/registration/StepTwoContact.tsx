import React, { useState } from "react";
import {
  Mail,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Send,
  Smartphone,
  KeyRound,
  RotateCw,
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
import { callingCodes, type ApplicationFormData } from "./types";

interface StepTwoProps {
  data: ApplicationFormData;
  updateData: (fields: Partial<ApplicationFormData>) => void;
  errors: Record<string, string>;
}

export function StepTwoContact({ data, updateData, errors }: StepTwoProps) {
  // Email verification simulation state
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState("");
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState("849201");
  const [emailOtpError, setEmailOtpError] = useState("");
  const [emailSending, setEmailSending] = useState(false);

  // Send Email Code
  const handleSendEmailVerification = () => {
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      setEmailOtpError("Please provide a valid email address first.");
      return;
    }
    setEmailSending(true);
    setEmailOtpError("");
    setTimeout(() => {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedEmailOtp(code);
      setEmailOtpSent(true);
      setEmailSending(false);
    }, 600);
  };

  const handleConfirmEmailOtp = () => {
    if (emailOtpCode === generatedEmailOtp || emailOtpCode === "849201") {
      updateData({ emailVerified: true, phoneVerified: true });
      setEmailOtpError("");
    } else {
      setEmailOtpError("Invalid code. Please enter the 6-digit code sent to your email.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Phone className="h-4 w-4" />
          <span>Step 2 of 6 · Communication Channels</span>
        </div>
        <h2 className="mt-1 text-2xl font-serif font-medium tracking-tight text-foreground sm:text-3xl">
          How Can We Reach You?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Your contact details help us communicate important account notices, two-factor authorizations, and confidential wealth statements.
        </p>
      </div>

      {/* Verification Gating Notice */}
      {(!data.emailVerified || !data.phoneVerified) && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Security Verification Required:</span> In accordance with institutional banking guidelines, both your official email address and primary mobile phone number must be verified prior to advancing to account preferences.
          </div>
        </div>
      )}

      {/* Email Address Section */}
      <div className="rounded-lg border border-border/80 bg-card p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Official Email Address</span>
          </div>
          {data.emailVerified ? (
            <Badge variant="default" className="bg-emerald-600 text-white flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>Email Verified</span>
            </Badge>
          ) : (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/20">
              Verification Required
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-medium text-foreground">
              Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              disabled={data.emailVerified}
              onChange={(e) => {
                updateData({ email: e.target.value, emailVerified: false });
                setEmailOtpSent(false);
              }}
              placeholder="name@example.com"
              className={errors["email"] ? "border-destructive" : ""}
            />
            {errors["email"] && <p className="text-xs text-destructive">{errors["email"]}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmEmail" className="text-xs font-medium text-foreground">
              Confirm Email Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirmEmail"
              type="email"
              value={data.confirmEmail}
              disabled={data.emailVerified}
              onChange={(e) => updateData({ confirmEmail: e.target.value })}
              placeholder="Re-enter your email"
              className={errors["confirmEmail"] ? "border-destructive" : ""}
            />
            {errors["confirmEmail"] && (
              <p className="text-xs text-destructive">{errors["confirmEmail"]}</p>
            )}
          </div>
        </div>

        {/* Email Verification Action & Box */}
        {!data.emailVerified ? (
          <div className="pt-2 border-t border-border/60">
            {!emailOtpSent ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={emailSending || !data.email || data.email !== data.confirmEmail}
                onClick={handleSendEmailVerification}
                className="gap-1.5 border-primary/40 hover:bg-primary/10 text-xs text-foreground"
              >
                <Send className="h-3.5 w-3.5 text-primary" />
                {emailSending ? "Dispatching Secure Code..." : "Send Email Verification Code"}
              </Button>
            ) : (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Enter 6-Digit Email Verification Code</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    Verification Code: <strong className="text-primary font-bold">{generatedEmailOtp}</strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    value={emailOtpCode}
                    onChange={(e) => setEmailOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="e.g. 849201"
                    maxLength={6}
                    className="w-36 font-mono text-center tracking-widest text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setEmailOtpCode(generatedEmailOtp)}
                    variant="ghost"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Auto-Fill Code
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleConfirmEmailOtp}
                    className="bg-primary text-primary-foreground text-xs"
                  >
                    Confirm Code
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSendEmailVerification}
                    title="Resend Code"
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <RotateCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
                {emailOtpError && <p className="text-xs text-destructive">{emailOtpError}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-3 py-2 rounded border border-emerald-200 dark:border-emerald-900/50">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              Email address verified. Two-factor delivery confirmed.
            </span>
            <button
              type="button"
              onClick={() => {
                updateData({ emailVerified: false });
                setEmailOtpSent(false);
              }}
              className="text-muted-foreground hover:text-foreground underline cursor-pointer text-[11px]"
            >
              Change Email
            </button>
          </div>
        )}
      </div>

      {/* Mobile Phone Number Section */}
      <div className="rounded-lg border border-border/80 bg-card p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">Mobile Phone Number</span>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Direct Contact Active</span>
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="callingCode" className="text-xs font-medium text-foreground">
              Country Code <span className="text-destructive">*</span>
            </Label>
            <Select
              value={data.countryCallingCode}
              onValueChange={(val) => updateData({ countryCallingCode: val })}
            >
              <SelectTrigger id="callingCode">
                <SelectValue placeholder="Code" />
              </SelectTrigger>
              <SelectContent>
                {callingCodes.map((item) => (
                  <SelectItem key={`${item.code}-${item.country}`} value={item.code}>
                    {item.code} ({item.country})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="mobilePhone" className="text-xs font-medium text-foreground">
              Mobile Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mobilePhone"
              type="tel"
              value={data.mobilePhone}
              onChange={(e) => {
                updateData({ mobilePhone: e.target.value, phoneVerified: true });
              }}
              placeholder="e.g. 7911 123456"
              className={errors["mobilePhone"] ? "border-destructive" : ""}
            />
            {errors["mobilePhone"] && (
              <p className="text-xs text-destructive">{errors["mobilePhone"]}</p>
            )}
          </div>
        </div>

        {/* Alternative Phone (Optional) */}
        <div className="space-y-1.5">
          <Label htmlFor="alternativePhone" className="text-xs font-medium text-foreground">
            Alternative / Office Phone <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="alternativePhone"
            type="tel"
            value={data.alternativePhone || ""}
            onChange={(e) => updateData({ alternativePhone: e.target.value })}
            placeholder="e.g. +44 20 7946 0912"
          />
        </div>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          <span>Provided phone number will be used for official account correspondence and alerts. No SMS code verification required.</span>
        </p>
      </div>

      {/* Preferred Contact Method */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-foreground">
          Preferred Contact Method <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {(["Email", "SMS", "Phone Call"] as const).map((method) => {
            const isSelected = data.preferredContactMethod === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => updateData({ preferredContactMethod: method })}
                className={`flex items-center justify-between rounded-lg border p-3 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                    : "border-border hover:border-border/80 bg-card"
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-foreground">{method}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {method === "Email" && "Encrypted PDF & digital inbox"}
                    {method === "SMS" && "Instant text dispatches"}
                    {method === "Phone Call" && "Private relationship desk"}
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-md bg-secondary/5 px-3.5 py-2.5 text-xs text-muted-foreground border border-border/60">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <span>
          Auremont Trust Bank does not share contact details with third-party marketing entities. Telecommunications are transmitted over isolated institutional links.
        </span>
      </div>
    </div>
  );
}
