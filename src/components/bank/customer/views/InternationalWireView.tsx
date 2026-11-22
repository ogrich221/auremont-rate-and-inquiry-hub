import React, { useState, useMemo } from "react";
import {
  Globe,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Lock,
  RotateCcw,
  AlertCircle,
  FileText,
  Bookmark,
  LoaderCircle,
  TrendingUp,
  Landmark,
  Calculator,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomerBeneficiary } from "../customer-types";

// Indicative rates for demo wire pricing
const FX_RATES: Record<string, Record<string, number>> = {
  GBP: { USD: 1.284, EUR: 1.172, CHF: 1.135, CAD: 1.742, JPY: 198.5 },
  USD: { GBP: 0.778, EUR: 0.912, CHF: 0.884, CAD: 1.356, JPY: 154.6 },
  EUR: { GBP: 0.853, USD: 1.096, CHF: 0.968, CAD: 1.486, JPY: 169.3 },
};

export function InternationalWireView() {
  const {
    profile,
    accounts,
    activeAccount,
    setActiveAccount,
    beneficiaries,
    executeInternationalWire,
    setActiveSection,
  } = useCustomerBanking();

  const [step, setStep] = useState<"form" | "review" | "success">("form");

  // SECTION A – BENEFICIARY INFORMATION
  const [beneficiaryName, setBeneficiaryName] = useState("");
  const [beneficiaryEmail, setBeneficiaryEmail] = useState("");
  const [beneficiaryPhone, setBeneficiaryPhone] = useState("");
  const [benStreet, setBenStreet] = useState("");
  const [benCity, setBenCity] = useState("");
  const [benState, setBenState] = useState("");
  const [benPostal, setBenPostal] = useState("");
  const [benCountry, setBenCountry] = useState("Switzerland");

  // SECTION B – RECIPIENT BANK INFORMATION
  const [bankName, setBankName] = useState("");
  const [bankAddress, setBankAddress] = useState("");
  const [bankCity, setBankCity] = useState("");
  const [bankCountry, setBankCountry] = useState("Switzerland");
  const [swiftBic, setSwiftBic] = useState("");
  const [ibanOrAccount, setIbanOrAccount] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [intermediaryBank, setIntermediaryBank] = useState("");

  // SECTION C – TRANSFER INFORMATION
  const [amount, setAmount] = useState<string>("");
  const [sendCurrency, setSendCurrency] = useState(activeAccount.currency);
  const [receiveCurrency, setReceiveCurrency] = useState("USD");
  const [purpose, setPurpose] = useState("Private Wealth Management");
  const [reference, setReference] = useState("");
  const [sourceOfFunds, setSourceOfFunds] = useState("Investment Income");

  // Authorization & Processing
  const [authPin, setAuthPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [txResult, setTxResult] = useState<{ reference: string; date: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const wireFee = 25.0; // Institutional locked wire fee

  // Live Exchange Rate Calculation
  const exchangeRate = useMemo(() => {
    if (sendCurrency === receiveCurrency) return 1.0;
    return FX_RATES[sendCurrency]?.[receiveCurrency] || 1.25;
  }, [sendCurrency, receiveCurrency]);

  const convertedAmount = parsedAmount * exchangeRate;
  const totalDebit = parsedAmount + wireFee;

  const handleSelectBeneficiary = (ben: CustomerBeneficiary) => {
    setBeneficiaryName(ben.fullName);
    if (ben.email) setBeneficiaryEmail(ben.email);
    if (ben.phone) setBeneficiaryPhone(ben.phone);
    setBankName(ben.bankName);
    setIbanOrAccount(ben.accountNumber);
    setSwiftBic(ben.routingOrSwift);
    setBankCountry(ben.country);
    if (ben.bankAddress) {
      setBankAddress(ben.bankAddress.street);
      setBankCity(ben.bankAddress.city);
    }
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!beneficiaryName.trim()) return setErrorMessage("Beneficiary Full Name is required.");
    if (!beneficiaryPhone.trim()) return setErrorMessage("Beneficiary Phone Number is required.");
    if (!benStreet.trim() || !benCity.trim()) {
      return setErrorMessage("Complete beneficiary residential address is required for regulatory compliance.");
    }
    if (!bankName.trim()) return setErrorMessage("Recipient Bank Name is required.");
    if (!swiftBic.trim() || swiftBic.length < 8) {
      return setErrorMessage("A valid 8 or 11 character SWIFT/BIC code is required.");
    }
    if (!ibanOrAccount.trim()) return setErrorMessage("IBAN or Recipient Account Number is required.");
    if (parsedAmount <= 0) return setErrorMessage("Please enter an amount greater than 0.");
    if (activeAccount.availableBalance < totalDebit) {
      return setErrorMessage(
        `Insufficient available balance in ${activeAccount.name}. Required: ${sendCurrency} ${totalDebit.toFixed(2)}.`,
      );
    }

    setStep("review");
  };

  const handleAuthorizeAndExecute = async () => {
    if (!authPin || authPin.length < 4) {
      setPinError("Please enter your 6-digit transaction PIN to authorize this wire.");
      return;
    }
    setPinError("");
    setIsSubmitting(true);

    try {
      const res = await executeInternationalWire({
        beneficiaryName,
        beneficiaryEmail,
        beneficiaryPhone,
        beneficiaryAddress: {
          street: benStreet,
          city: benCity,
          state: benState,
          postalCode: benPostal,
          country: benCountry,
        },
        bankName,
        bankAddress,
        bankCity,
        bankCountry,
        swiftBic: swiftBic.toUpperCase(),
        ibanOrAccount,
        routingNumber,
        intermediaryBank,
        amount: parsedAmount,
        sendCurrency,
        receiveCurrency,
        purpose,
        reference: reference || "International Wire",
        sourceOfFunds,
        exchangeRate,
        fee: wireFee,
        convertedAmount,
      });

      if (!res.success) {
        setPinError(res.error || "Wire execution could not be authorized.");
        setIsSubmitting(false);
        return;
      }

      setTxResult({
        reference: res.reference,
        date: new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }),
      });
      setStep("success");
    } catch {
      setPinError("Wire execution error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBeneficiaryName("");
    setBeneficiaryEmail("");
    setBeneficiaryPhone("");
    setBenStreet("");
    setBenCity("");
    setBenState("");
    setBenPostal("");
    setBankName("");
    setBankAddress("");
    setBankCity("");
    setSwiftBic("");
    setIbanOrAccount("");
    setAmount("");
    setReference("");
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
          <Globe className="h-3.5 w-3.5" /> Global SWIFT & Cross-Border Clearing
        </span>
        <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mt-1">
          International Wire Transfer
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Send funds across supported international banking networks with a secure and transparent transfer experience.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-md mx-auto px-4 py-2 bg-white/60 dark:bg-slate-900/40 rounded-xl border border-white/60 text-xs">
        <div
          className={`flex items-center gap-1.5 font-medium ${
            step === "form" ? "text-[#C6A66B] font-semibold" : "text-foreground"
          }`}
        >
          <span className="h-5 w-5 rounded-full flex items-center justify-center bg-[#C6A66B]/15 text-[#C6A66B] text-[10px]">
            1
          </span>
          <span>Wire Details</span>
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
          <span>Review & Pricing</span>
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
          <span>Execution</span>
        </div>
      </div>

      {step === "form" && (
        <form onSubmit={handleReview} className="space-y-6">
          {/* Funding Account Selection */}
          <div className="p-5 rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Funding Account
              </label>
              <span className="text-xs text-muted-foreground">
                Available:{" "}
                <strong className="text-foreground">
                  {activeAccount.currency}{" "}
                  {activeAccount.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => {
                    setActiveAccount(acc);
                    setSendCurrency(acc.currency);
                  }}
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
                      {acc.currency} {acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[11px] text-muted-foreground">{acc.maskedAccountNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Select International Beneficiary */}
          {beneficiaries.some((b) => b.transferType === "International Wire") && (
            <div className="p-4 rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md space-y-2">
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <Bookmark className="h-3.5 w-3.5 text-[#C6A66B]" /> Choose from Saved Wire Beneficiaries
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {beneficiaries
                  .filter((b) => b.transferType === "International Wire")
                  .map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => handleSelectBeneficiary(b)}
                      className="px-3 py-1.5 rounded-lg border border-border/70 hover:border-[#C6A66B] bg-background/80 text-xs text-left shrink-0 transition-colors cursor-pointer"
                    >
                      <strong className="block text-foreground text-[11px] font-medium">{b.fullName}</strong>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {b.bankName} ({b.country})
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* SECTION A – BENEFICIARY INFORMATION */}
          <div className="p-6 rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <Globe className="h-4 w-4 text-[#C6A66B]" />
              <span>Section A – Beneficiary Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-foreground">
                  Beneficiary Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={beneficiaryName}
                  onChange={(e) => setBeneficiaryName(e.target.value)}
                  placeholder="e.g. Geneva Wealth Advisory SA"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Beneficiary Phone Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={beneficiaryPhone}
                  onChange={(e) => setBeneficiaryPhone(e.target.value)}
                  placeholder="+41 22 819 00 00"
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-3">
                <label className="text-xs font-medium text-foreground">
                  Beneficiary Email Address (Optional for wire confirmation)
                </label>
                <Input
                  type="email"
                  value={beneficiaryEmail}
                  onChange={(e) => setBeneficiaryEmail(e.target.value)}
                  placeholder="desk@geneva-wealth.ch"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Beneficiary Residential Address */}
            <div className="pt-2 border-t border-border/30 space-y-2">
              <span className="text-xs font-medium text-muted-foreground block">
                Beneficiary Residential / Corporate Address
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <Input
                    value={benStreet}
                    onChange={(e) => setBenStreet(e.target.value)}
                    placeholder="Street Address (e.g. Route des Acacias 60)"
                    className="text-xs"
                    required
                  />
                </div>
                <Input
                  value={benCity}
                  onChange={(e) => setBenCity(e.target.value)}
                  placeholder="City (e.g. Geneva)"
                  className="text-xs"
                  required
                />
                <Input
                  value={benState}
                  onChange={(e) => setBenState(e.target.value)}
                  placeholder="State / Canton / Province"
                  className="text-xs"
                />
                <Input
                  value={benPostal}
                  onChange={(e) => setBenPostal(e.target.value)}
                  placeholder="Postal Code"
                  className="text-xs font-mono"
                />
                <Input
                  value={benCountry}
                  onChange={(e) => setBenCountry(e.target.value)}
                  placeholder="Country of Residence (e.g. Switzerland)"
                  className="text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* SECTION B – RECIPIENT BANK INFORMATION */}
          <div className="p-6 rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <Landmark className="h-4 w-4 text-[#C6A66B]" />
              <span>Section B – Recipient Bank Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Recipient Bank Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. Pictet & Cie Geneva"
                  className="text-xs"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  SWIFT / BIC Code (8 or 11 characters) <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={swiftBic}
                  onChange={(e) => setSwiftBic(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                  placeholder="e.g. PICTCHGGXXX"
                  maxLength={11}
                  className="text-xs font-mono uppercase"
                  required
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-medium text-foreground">
                  IBAN or International Account Number <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={ibanOrAccount}
                  onChange={(e) => setIbanOrAccount(e.target.value)}
                  placeholder="e.g. CH88 0080 3000 7712 3910 2"
                  className="text-xs font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Recipient Bank Address</label>
                <Input
                  value={bankAddress}
                  onChange={(e) => setBankAddress(e.target.value)}
                  placeholder="e.g. Route des Acacias 60"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Bank City & Country</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={bankCity}
                    onChange={(e) => setBankCity(e.target.value)}
                    placeholder="Geneva"
                    className="text-xs"
                  />
                  <Input
                    value={bankCountry}
                    onChange={(e) => setBankCountry(e.target.value)}
                    placeholder="Switzerland"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  National Routing Number (Optional)
                </label>
                <Input
                  value={routingNumber}
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  placeholder="e.g. ABA/Fedwire"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Intermediary Bank (If required)
                </label>
                <Input
                  value={intermediaryBank}
                  onChange={(e) => setIntermediaryBank(e.target.value)}
                  placeholder="Intermediary SWIFT/BIC"
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION C – TRANSFER INFORMATION & PRICING */}
          <div className="p-6 rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4">
            <h3 className="text-sm font-serif font-semibold text-foreground flex items-center gap-2 border-b border-border/40 pb-2">
              <Calculator className="h-4 w-4 text-[#C6A66B]" />
              <span>Section C – Transfer Information & Pricing</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Sending Currency</label>
                <select
                  value={sendCurrency}
                  onChange={(e) => setSendCurrency(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs outline-none"
                >
                  <option value="GBP">GBP - British Pound</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Receiving Currency</label>
                <select
                  value={receiveCurrency}
                  onChange={(e) => setReceiveCurrency(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs outline-none"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="CHF">CHF - Swiss Franc</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="CAD">CAD - Canadian Dollar</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Transfer Amount ({sendCurrency}) <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="text-sm font-semibold font-mono"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Transfer Purpose</label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs outline-none"
                >
                  <option>Private Wealth Management</option>
                  <option>Capital Asset Acquisition</option>
                  <option>Corporate Contract Settlement</option>
                  <option>Family Trust Remittance</option>
                  <option>Professional Legal Retainer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Payment Reference</label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. INV-2026-CH-994"
                  className="text-xs"
                  maxLength={35}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Source of Funds</label>
                <Input
                  value={sourceOfFunds}
                  onChange={(e) => setSourceOfFunds(e.target.value)}
                  placeholder="e.g. Investment Income"
                  className="text-xs"
                />
              </div>
            </div>

            {/* Real-time Pricing & Fee Calculation Card */}
            {parsedAmount > 0 && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-muted/60 to-muted/30 border border-border/60 space-y-2 mt-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3.5 w-3.5 text-[#C6A66B]" /> Locked Indicative FX Rate:
                  </span>
                  <span className="font-mono font-semibold text-foreground">
                    1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Estimated Conversion Amount:</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {receiveCurrency}{" "}
                    {convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">SWIFT Wire Processing Fee:</span>
                  <span className="font-mono text-muted-foreground">
                    {sendCurrency} {wireFee.toFixed(2)} (Locked)
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm font-semibold pt-2 border-t border-border/40 text-foreground">
                  <span>Total Debit from {activeAccount.name}:</span>
                  <span className="font-mono text-[#C6A66B] text-base">
                    {sendCurrency}{" "}
                    {totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
                  <span>Estimated Delivery Time:</span>
                  <span className="text-emerald-600 font-medium">Same-Day / SWIFT GPI Priority</span>
                </div>
              </div>
            )}
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
              <span>Continue to Final Review</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 2: SECTION D – FINAL REVIEW & AUTHORIZATION */}
      {step === "review" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-serif font-semibold text-foreground">
                  Section D – Final Review & Wire Authorization
                </h3>
                <p className="text-xs text-muted-foreground">
                  International wire instructions cannot be recalled once dispatched onto the SWIFT network.
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
                <span className="text-[11px] text-muted-foreground block">Beneficiary Full Name</span>
                <strong className="text-foreground text-sm font-medium">{beneficiaryName}</strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Beneficiary Country</span>
                <strong className="text-foreground text-sm font-medium">{benCountry}</strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Recipient Bank</span>
                <strong className="text-foreground text-sm font-medium">{bankName}</strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">SWIFT / BIC Code</span>
                <strong className="text-foreground text-sm font-mono">{swiftBic}</strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Recipient IBAN / Account</span>
                <strong className="text-foreground text-sm font-mono">
                  •••• •••• {ibanOrAccount.slice(-4)}
                </strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Transfer Purpose</span>
                <strong className="text-foreground text-sm font-medium">{purpose}</strong>
              </div>

              <div className="md:col-span-2 p-3 rounded-lg bg-muted/40">
                <span className="text-[11px] text-muted-foreground block">Recipient Bank Address</span>
                <span className="text-xs text-foreground font-medium">
                  {[bankAddress, bankCity, bankCountry].filter(Boolean).join(", ")}
                </span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#101D32] to-[#172C49] text-white space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Principal Wire Amount</span>
                <span className="font-mono text-white">
                  {sendCurrency} {parsedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>SWIFT Locked Wire Fee</span>
                <span className="font-mono text-white">{sendCurrency} {wireFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Indicative Exchange Rate</span>
                <span className="font-mono text-[#C6A66B]">
                  1 {sendCurrency} = {exchangeRate.toFixed(4)} {receiveCurrency}
                </span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Recipient Receives (Estimated)</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {receiveCurrency}{" "}
                  {convertedAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/20">
                <span>Total Debit Amount</span>
                <span className="font-mono text-base text-[#C6A66B]">
                  {sendCurrency} {totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Client Authorization */}
            <div className="pt-2 border-t border-border/40 space-y-3">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[#C6A66B]" />
                <span>Transaction Authorization PIN</span>
              </label>
              <p className="text-xs text-muted-foreground">
                Authorize this cross-border transfer instruction using your private client security credential.
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
                  <span>Clearing SWIFT Dispatch…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Authorize & Disburse Wire</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: SUCCESS CONFIRMATION */}
      {step === "success" && txResult && (
        <div className="p-8 rounded-xl border border-white/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-md text-center max-w-lg mx-auto space-y-6">
          <div className="h-16 w-16 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-serif font-semibold text-foreground">
              International Wire Dispatched.
            </h2>
            <p className="text-xs text-muted-foreground">
              Your cross-border wire instruction has been routed onto the SWIFT network under priority clearing.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/40 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Wire Reference:</span>
              <span className="font-mono font-semibold text-foreground">{txResult.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Beneficiary:</span>
              <span className="font-medium text-foreground">{beneficiaryName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient Bank:</span>
              <span className="text-foreground">{bankName} ({bankCountry})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">SWIFT / BIC:</span>
              <span className="font-mono font-semibold text-foreground">{swiftBic}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Debited:</span>
              <span className="font-mono font-semibold text-foreground">
                {sendCurrency} {totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Execution Date:</span>
              <span className="text-foreground">{txResult.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed / Dispatched
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
              <span>Send Another Wire</span>
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
