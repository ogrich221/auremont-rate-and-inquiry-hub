import React, { useState } from "react";
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Shield,
  KeyRound,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  securityQuestionsList,
  evaluatePasswordStrength,
  isSequentialOrRepetitivePin,
  type ApplicationFormData,
} from "./types";

interface StepFourProps {
  data: ApplicationFormData;
  updateData: (fields: Partial<ApplicationFormData>) => void;
  errors: Record<string, string>;
}

export function StepFourSecurity({ data, updateData, errors }: StepFourProps) {
  // Password Visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Security Questions Visibility
  const [showAnswers, setShowAnswers] = useState<[boolean, boolean, boolean]>([false, false, false]);

  // Transfer PIN Visibility
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  // Password strength
  const strength = evaluatePasswordStrength(data.password);

  // PIN validation checks
  const pinCheck = isSequentialOrRepetitivePin(data.transferPin);

  // Helper for question selection - disable already chosen questions in other dropdowns
  const getAvailableQuestions = (questionIndex: number) => {
    const selectedOthers = data.securityQuestions
      .filter((_, idx) => idx !== questionIndex)
      .map((q) => q.question)
      .filter(Boolean);

    return securityQuestionsList.map((q) => ({
      question: q,
      disabled: selectedOthers.includes(q),
    }));
  };

  const updateQuestion = (index: number, question: string) => {
    const next = [...data.securityQuestions] as ApplicationFormData["securityQuestions"];
    next[index] = { ...next[index], question };
    updateData({ securityQuestions: next });
  };

  const updateAnswer = (index: number, answer: string) => {
    const next = [...data.securityQuestions] as ApplicationFormData["securityQuestions"];
    next[index] = { ...next[index], answer };
    updateData({ securityQuestions: next });
  };

  const toggleAnswerVisibility = (index: 0 | 1 | 2) => {
    setShowAnswers((prev) => {
      const copy: [boolean, boolean, boolean] = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  return (
    <div className="space-y-7">
      {/* Step Header */}
      <div className="border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Shield className="h-4 w-4" />
          <span>Step 4 of 6 · Cryptographic Authentication</span>
        </div>
        <h2 className="mt-1 text-2xl font-serif font-medium tracking-tight text-foreground sm:text-3xl">
          Create Your Security Credentials.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Protect your high-value assets and online banking portal by configuring fortified multi-factor authentication credentials.
        </p>
      </div>

      {/* SECTION A: ACCOUNT PASSWORD */}
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Lock className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">A. Primary Account Password</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Create Password */}
          <div className="space-y-1.5">
            <Label htmlFor="reg-password" className="text-xs font-medium text-foreground">
              Create Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                value={data.password}
                onChange={(e) => updateData({ password: e.target.value })}
                placeholder="Minimum 12 characters"
                className={`pr-10 ${errors.password ? "border-destructive" : ""}`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-xs font-medium text-foreground">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={data.confirmPassword}
                onChange={(e) => updateData({ confirmPassword: e.target.value })}
                placeholder="Re-enter password"
                className={`pr-10 ${
                  data.confirmPassword && data.password !== data.confirmPassword
                    ? "border-destructive"
                    : ""
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Real-time Match Indicator */}
        {data.confirmPassword && (
          <div className="text-xs flex items-center gap-1.5">
            {data.password === data.confirmPassword ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Passwords match perfectly.
              </span>
            ) : (
              <span className="text-destructive flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" /> Passwords do not match.
              </span>
            )}
          </div>
        )}

        {/* Password Strength Meter */}
        <div className="space-y-2 rounded-lg bg-muted/30 p-3 border border-border/50">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground font-medium">Password Strength:</span>
            <span className="font-semibold text-foreground" style={{ color: strength.color }}>
              {strength.label}
            </span>
          </div>
          <Progress
            value={(strength.score / 5) * 100}
            className="h-1.5 bg-muted"
          />

          {/* Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 text-[11px]">
            <div className={`flex items-center gap-1.5 ${strength.checks.length ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              {strength.checks.length ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
              <span>At least 12 characters (Recommended: 14+)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${strength.checks.uppercase ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              {strength.checks.uppercase ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
              <span>One uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${strength.checks.lowercase ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              {strength.checks.lowercase ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
              <span>One lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${strength.checks.number ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              {strength.checks.number ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
              <span>At least one number (0-9)</span>
            </div>
            <div className={`flex items-center gap-1.5 ${strength.checks.special ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
              {strength.checks.special ? <CheckCircle2 className="h-3 w-3 shrink-0" /> : <XCircle className="h-3 w-3 shrink-0" />}
              <span>At least one symbol (!@#$%^&*)</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION B: SECURITY QUESTIONS */}
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">B. Institutional Security Questions</h3>
          </div>
          <span className="text-[11px] text-muted-foreground">3 unique questions required</span>
        </div>

        <p className="text-xs text-muted-foreground">
          Select three distinct verification questions. Answers are masked and encrypted with a salted cryptographic hash; administrators cannot view raw answers.
        </p>

        <div className="space-y-4">
          {[0, 1, 2].map((idx) => {
            const availableQuestions = getAvailableQuestions(idx);
            const currentItem = data.securityQuestions[idx];
            const isVisible = showAnswers[idx as 0 | 1 | 2];

            return (
              <div key={idx} className="rounded-lg border border-border/60 bg-muted/20 p-3.5 space-y-2.5">
                <div className="text-xs font-semibold text-foreground">
                  Security Question #{idx + 1} <span className="text-destructive">*</span>
                </div>

                <Select
                  value={currentItem.question}
                  onValueChange={(val) => updateQuestion(idx, val)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue placeholder={`Select question #${idx + 1}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableQuestions.map(({ question, disabled }) => (
                      <SelectItem
                        key={question}
                        value={question}
                        disabled={disabled}
                        className={disabled ? "opacity-40" : ""}
                      >
                        {question} {disabled && "(Already selected)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="space-y-1">
                  <div className="relative">
                    <Input
                      type={isVisible ? "text" : "password"}
                      value={currentItem.answer}
                      onChange={(e) => updateAnswer(idx, e.target.value)}
                      placeholder={`Enter private answer for question #${idx + 1}`}
                      className="pr-10 text-xs"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => toggleAnswerVisibility(idx as 0 | 1 | 2)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      aria-label={isVisible ? "Mask answer" : "Show answer"}
                    >
                      {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Masked for privacy. Stored via salted SHA-256 hash.
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION C: 6-DIGIT TRANSFER PIN CREATION */}
      <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <KeyRound className="h-4 w-4 text-primary" />
          <div>
            <h3 className="text-sm font-semibold text-foreground">C. Create Transaction Authorization PIN</h3>
            <p className="text-[11px] text-muted-foreground">
              Your transaction PIN adds an additional layer of protection when authorizing eligible financial transactions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Create PIN */}
          <div className="space-y-1.5">
            <Label htmlFor="transferPin" className="text-xs font-medium text-foreground">
              Create 6-Digit Transfer PIN <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="transferPin"
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={data.transferPin}
                onChange={(e) =>
                  updateData({ transferPin: e.target.value.replace(/\D/g, "").slice(0, 6) })
                }
                placeholder="• • • • • •"
                className={`font-mono text-center tracking-widest text-base pr-10 ${
                  data.transferPin.length === 6 && pinCheck.invalid ? "border-destructive" : ""
                }`}
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showPin ? "Hide PIN" : "Show PIN"}
              >
                {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Must be exactly 6 digits.
            </span>
          </div>

          {/* Confirm PIN */}
          <div className="space-y-1.5">
            <Label htmlFor="confirmTransferPin" className="text-xs font-medium text-foreground">
              Confirm 6-Digit Transfer PIN <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmTransferPin"
                type={showConfirmPin ? "text" : "password"}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={data.confirmTransferPin}
                onChange={(e) =>
                  updateData({ confirmTransferPin: e.target.value.replace(/\D/g, "").slice(0, 6) })
                }
                placeholder="• • • • • •"
                className="font-mono text-center tracking-widest text-base pr-10"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label={showConfirmPin ? "Hide confirm PIN" : "Show confirm PIN"}
              >
                {showConfirmPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Re-enter 6 digits to verify.
            </span>
          </div>
        </div>

        {/* PIN Security Feedback */}
        {data.transferPin.length === 6 && (
          <div className="space-y-1">
            {pinCheck.invalid ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{pinCheck.reason}</span>
              </div>
            ) : (
              <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <span>PIN complexity approved. No sequential or repetitive pattern detected.</span>
              </div>
            )}

            {data.confirmTransferPin && data.transferPin === data.confirmTransferPin && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Transfer PINs match.
              </p>
            )}
            {data.confirmTransferPin && data.transferPin !== data.confirmTransferPin && (
              <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <XCircle className="h-3.5 w-3.5" /> Transfer PINs do not match.
              </p>
            )}
          </div>
        )}

        {/* Mandatory Transaction PIN Regulatory Disclaimer */}
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 flex items-start gap-2.5">
          <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong className="font-semibold">Important Security Notice:</strong> This PIN is a separate transaction authorization credential. It is never stored in plain text and does not act as a substitute for primary bank authentication, regulatory KYC verification, or statutory clearance of actual monetary transfers.
          </p>
        </div>
      </div>
    </div>
  );
}
