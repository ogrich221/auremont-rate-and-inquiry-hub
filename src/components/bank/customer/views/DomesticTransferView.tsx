import React, { useState } from "react";
import {
  Building2,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  UserCheck,
  Send,
  RotateCcw,
  AlertCircle,
  FileText,
  Bookmark,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { BankAddress, CustomerBeneficiary } from "../customer-types";

export function DomesticTransferView() {
  const {
    profile,
    accounts,
    activeAccount,
    setActiveAccount,
    beneficiaries,
    executeDomesticTransfer,
    setActiveSection,
  } = useCustomerBanking();

  // Multi-step: "form" -> "review" -> "authorizing" -> "success"
  const [step, setStep] = useState<"form" | "review" | "authorizing" | "success">("form");

  // Form Fields
  const [recipientName, setRecipientName] = useState("");
  const [bankName, setBankName] = useState("");
  const [branch, setBranch] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateProvince, setStateProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountType, setAccountType] = useState("Current / Checking");
  const [routingNumber, setRoutingNumber] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [currency, setCurrency] = useState("GBP");
  const [description, setDescription] = useState("");
  const [saveBeneficiary, setSaveBeneficiary] = useState(false);

  // Authorization PIN simulation
  const [authPin, setAuthPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [txResult, setTxResult] = useState<{ reference: string; date: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const domesticFee = 0.0;
  const totalDebit = parsedAmount + domesticFee;

  // Beneficiary Quick-Select
  const handleSelectBeneficiary = (ben: CustomerBeneficiary) => {
    setRecipientName(ben.fullName);
    setBankName(ben.bankName);
    setAccountNumber(ben.accountNumber);
    setRoutingNumber(ben.routingOrSwift);
    if (ben.bankAddress) {
      setStreet(ben.bankAddress.street);
      setCity(ben.bankAddress.city);
      setStateProvince(ben.bankAddress.state);
      setPostalCode(ben.bankAddress.postalCode);
      setCountry(ben.bankAddress.country);
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!recipientName.trim()) return setErrorMessage("Recipient Full Name is required.");
    if (!bankName.trim()) return setErrorMessage("Recipient Bank Name is required.");
    if (!accountNumber.trim()) return setErrorMessage("Recipient Account Number is required.");
    if (!routingNumber.trim()) return setErrorMessage("Sort code or routing number is required.");
    if (parsedAmount <= 0) return setErrorMessage("Please enter a valid transfer amount greater than 0.");
    if (activeAccount.availableBalance < totalDebit) {
      return setErrorMessage(
        `Insufficient available balance in ${activeAccount.name} (£${activeAccount.availableBalance.toLocaleString()}).`,
      );
    }

    setStep("review");
  };

  const handleAuthorizeAndExecute = async () => {
    if (!authPin || authPin.length < 4) {
      setPinError("Please enter your 6-digit transaction PIN to authorize.");
      return;
    }
    setPinError("");
    setIsSubmitting(true);

    try {
      const res = await executeDomesticTransfer({
        recipientName,
        bankName,
        branch,
        bankAddress: {
          street,
          city,
          state: stateProvince,
          postalCode,
          country,
        },
        accountNumber,
        accountType,
        routingNumber,
        amount: parsedAmount,
        currency,
        description: description || "Domestic Transfer",
        saveBeneficiary,
      });

      if (!res.success) {
        setPinError(res.error || "Transfer rejected by banking risk engine.");
        setIsSubmitting(false);
        return;
      }

      setTxResult({
        reference: res.reference,
        date: new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }),
      });
      setStep("success");
    } catch (err) {
      setPinError("Transfer execution error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRecipientName("");
    setBankName("");
    setBranch("");
    setStreet("");
    setCity("");
    setStateProvince("");
    setPostalCode("");
    setAccountNumber("");
    setRoutingNumber("");
    setAmount("");
    setDescription("");
    setAuthPin("");
    setPinError("");
    setErrorMessage("");
    setStep("form");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <span className="text-[11px] font-semibold tracking-widest text-[#C6A66B] uppercase flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5" /> Domestic Clearing Network
        </span>
        <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mt-1">
          Domestic Money Transfer
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Send money securely to eligible bank accounts within your supported domestic banking network.
        </p>
      </div>

      {/* Progress Steps Indicator */}
      <div className="flex items-center justify-between max-w-md mx-auto px-4 py-2 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-white/60 text-xs">
        <div
          className={`flex items-center gap-1.5 font-medium ${
            step === "form" ? "text-[#C6A66B] font-semibold" : "text-foreground"
          }`}
        >
          <span className="h-5 w-5 rounded-full flex items-center justify-center bg-[#C6A66B]/15 text-[#C6A66B] text-[10px]">
            1
          </span>
          <span>Details</span>
        </div>
        <div className="h-0.5 w-8 bg-border/60" />
        <div
          className={`flex items-center gap-1.5 font-medium ${
            step === "review" ? "text-[#C6A66B] font-semibold" : "text-muted-foreground"
          }`}
        >
          <span className="h-5 w-5 rounded-full flex items-center justify-center bg-muted text-[10px]">
            2
          </span>
          <span>Review</span>
        </div>
        <div className="h-0.5 w-8 bg-border/60" />
        <div
          className={`flex items-center gap-1.5 font-medium ${
            step === "success" ? "text-emerald-600 font-semibold" : "text-muted-foreground"
          }`}
        >
          <span className="h-5 w-5 rounded-full flex items-center justify-center bg-muted text-[10px]">
            3
          </span>
          <span>Confirmation</span>
        </div>
      </div>

      {/* STEP 1: FORM */}
      {step === "form" && (
        <form onSubmit={handleReview} className="space-y-6">
          {/* Source Account Selector */}
          <div className="p-5 rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Funding Account
              </label>
              <span className="text-xs text-muted-foreground">
                Available:{" "}
                <strong className="text-foreground">
                  £{activeAccount.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => setActiveAccount(acc)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all ${
                    activeAccount.id === acc.id
                      ? "border-[#C6A66B] bg-[#C6A66B]/10 shadow-sm"
                      : "border-border/60 hover:bg-muted/40"
                  }`}
                >
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-semibold text-foreground">{acc.name}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{acc.currency}</span>
                  </div>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-sm font-serif font-bold text-foreground">
                      £{acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{acc.maskedAccountNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Select Beneficiary */}
          {beneficiaries.length > 0 && (
            <div className="p-4 rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-[#C6A66B]" /> Choose from Saved Beneficiaries
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {beneficiaries
                  .filter((b) => b.transferType === "Domestic Transfer")
                  .map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBeneficiary(b)}
                      className="px-3 py-1.5 rounded-lg border border-border/70 hover:border-[#C6A66B] bg-background/80 text-xs text-left shrink-0 transition-colors cursor-pointer"
                    >
                      <strong className="block text-foreground text-[11px] font-medium">{b.fullName}</strong>
                      <span className="text-[10px] text-muted-foreground font-mono">{b.maskedAccountNumber}</span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION A – RECIPIENT DETAILS */}
          <div className="p-6 rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-5">
            <h3 className="text-sm font-serif font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <UserCheck className="h-4 w-4 text-[#C6A66B]" />
              <span>Section A – Recipient Details</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Recipient Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. Lord James Harrington"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Recipient Bank Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Barclays Bank UK PLC"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Recipient Bank Branch (Optional)
                </label>
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Mayfair Commercial Branch"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Recipient Account Type
                </label>
                <select
                  value={accountType}
                  onChange={(e) => setAccountType(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs outline-none"
                >
                  <option>Current / Checking</option>
                  <option>Personal Savings</option>
                  <option>Corporate Treasury</option>
                  <option>Private Wealth Trust</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Recipient Account Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="8-digit account number"
                  maxLength={12}
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Sort Code / Domestic Identifier <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder="e.g. 20-00-00"
                  maxLength={10}
                  className="text-xs font-mono"
                  required
                />
              </div>
            </div>

            {/* RECIPIENT BANK ADDRESS (Clearly Labelled) */}
            <div className="pt-3 border-t border-border/40 space-y-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-[#C6A66B]" /> Recipient Bank Address
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <span className="text-[11px] text-muted-foreground">Street Address</span>
                  <Input
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="e.g. 1 Churchill Place, Canary Wharf"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">City</span>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="London"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">State / Province</span>
                  <Input
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="Greater London"
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Postal Code</span>
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="E14 5HP"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-muted-foreground">Country</span>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United Kingdom"
                    className="text-xs"
                  />
                </div>
              </div>
            </div>

            {/* AMOUNT AND REFERENCE */}
            <div className="pt-3 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Transfer Amount ({currency}) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-serif">
                    £
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 text-sm font-semibold font-mono"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Payment Reference</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Invoice settlement or Retainer"
                  className="text-xs"
                  maxLength={35}
                />
              </div>
            </div>

            {/* Save Beneficiary Checkbox */}
            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="saveBen"
                checked={saveBeneficiary}
                onChange={(e) => setSaveBeneficiary(e.target.checked)}
                className="rounded border-border text-[#C6A66B] focus:ring-[#C6A66B]"
              />
              <label htmlFor="saveBen" className="text-xs text-foreground cursor-pointer select-none">
                Save this recipient as a trusted beneficiary for future payments
              </label>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setActiveSection("overview")}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs gap-1.5 px-6"
            >
              <span>Continue to Review</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: SECTION B – TRANSFER REVIEW */}
      {step === "review" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-serif font-semibold text-foreground">
                  Section B – Transfer Review
                </h3>
                <p className="text-xs text-muted-foreground">
                  Carefully verify all transaction parameters before final authorization.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep("form")}
                className="text-xs gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Edit Details</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Sender Name</span>
                <strong className="text-foreground text-sm font-medium">
                  {profile.firstName} {profile.lastName}
                </strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Funding Account</span>
                <strong className="text-foreground text-sm font-medium">
                  {activeAccount.name} ({activeAccount.maskedAccountNumber})
                </strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Recipient Name</span>
                <strong className="text-foreground text-sm font-medium">{recipientName}</strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Recipient Bank</span>
                <strong className="text-foreground text-sm font-medium">{bankName}</strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Recipient Account Number</span>
                <strong className="text-foreground text-sm font-mono">
                  •••• •••• {accountNumber.slice(-4)}
                </strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Sort Code / Routing</span>
                <strong className="text-foreground text-sm font-mono">{routingNumber}</strong>
              </div>

              <div className="md:col-span-2 p-3 rounded-lg bg-muted/40">
                <span className="text-[11px] text-muted-foreground block">Recipient Bank Address</span>
                <span className="text-xs text-foreground font-medium">
                  {[street, city, stateProvince, postalCode, country].filter(Boolean).join(", ") ||
                    "Standard domestic clearing point"}
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-4 border-t border-border/40 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Transfer Amount</span>
                <span className="font-mono text-foreground font-medium">
                  £{parsedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Applicable Domestic Fee</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  £0.00 (Premier Inclusive)
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-foreground pt-2 border-t border-border/40">
                <span>Total Debit Amount</span>
                <span className="font-mono text-base text-[#C6A66B]">
                  £{totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Estimated Processing Time</span>
                <span className="text-emerald-600 font-medium">Instant · Faster Payments Service</span>
              </div>
            </div>

            {/* SECTION C – AUTHORIZATION */}
            <div className="pt-4 border-t border-border/40 space-y-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#C6A66B]" />
                <span>Section C – Client Authorization</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Enter your 6-digit transaction PIN to sign and submit this domestic payment.
              </p>

              <div className="max-w-xs space-y-1.5">
                <Input
                  type="password"
                  maxLength={6}
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter 6-digit PIN"
                  className="text-center font-mono tracking-widest text-sm"
                  autoComplete="one-time-code"
                />
                {pinError && <p className="text-[11px] text-rose-500 font-medium">{pinError}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("form")}
              className="text-xs gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Form</span>
            </Button>

            <Button
              type="button"
              onClick={handleAuthorizeAndExecute}
              disabled={isSubmitting}
              className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs gap-1.5 px-6"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  <span>Authorizing Payment…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Authorize & Process Transfer</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION */}
      {step === "success" && txResult && (
        <div className="p-8 rounded-xl border border-white/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-md text-center max-w-lg mx-auto space-y-6">
          <div className="h-16 w-16 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
            <Clock className="h-9 w-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-serif font-semibold text-foreground">
              Transfer Submitted for Administrative Approval
            </h2>
            <p className="text-xs text-muted-foreground">
              Your domestic payment instruction has been placed on hold and is awaiting primary administrator approval before final settlement.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/40 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction Reference:</span>
              <span className="font-mono font-semibold text-foreground">{txResult.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient:</span>
              <span className="font-medium text-foreground">{recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-mono font-semibold text-foreground">
                £{parsedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Execution Date:</span>
              <span className="text-foreground">{txResult.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Settlement Status:</span>
              <span className="text-amber-600 font-semibold flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Pending Admin Approval
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Make Another Transfer</span>
            </Button>
            <Button
              type="button"
              onClick={() => setActiveSection("overview")}
              className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs"
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
