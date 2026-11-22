import React, { useState } from "react";
import {
  Zap,
  Droplet,
  Wifi,
  Tv,
  PhoneCall,
  Smartphone,
  Layers,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Receipt,
  AlertCircle,
  LoaderCircle,
  Search,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UtilityCategory } from "../customer-types";

interface ProviderOption {
  id: string;
  name: string;
  packages?: { name: string; price: number }[];
}

const CATEGORY_DATA: Record<UtilityCategory, { icon: React.ElementType; providers: ProviderOption[] }> = {
  Electricity: {
    icon: Zap,
    providers: [
      { id: "uk-power", name: "British Gas & Electricity" },
      { id: "edf", name: "EDF Energy Private Reserving" },
      { id: "eon", name: "E.ON Next Domestic Power" },
      { id: "octopus", name: "Octopus Energy Green Grid" },
    ],
  },
  Water: {
    icon: Droplet,
    providers: [
      { id: "thames", name: "Thames Water Utilities" },
      { id: "severn", name: "Severn Trent Water" },
      { id: "affinity", name: "Affinity Water Central" },
    ],
  },
  Internet: {
    icon: Wifi,
    providers: [
      {
        id: "bt",
        name: "BT Business & Residential Fibre",
        packages: [
          { name: "Full Fibre 500 (500 Mbps)", price: 54.99 },
          { name: "Gigabit Halo Enterprise (1 Gbps)", price: 89.99 },
          { name: "Sovereign Dedicated Leased Line", price: 245.00 },
        ],
      },
      {
        id: "virgin",
        name: "Virgin Media O2 Gig1",
        packages: [
          { name: "M350 Fibre", price: 42.00 },
          { name: "Gig1 Ultimate Volt", price: 79.00 },
        ],
      },
      {
        id: "starlink",
        name: "Starlink Global Satellite",
        packages: [{ name: "High-Performance Priority Tier", price: 180.00 }],
      },
    ],
  },
  "Cable Television": {
    icon: Tv,
    providers: [
      {
        id: "sky",
        name: "Sky Q & Sky Glass Ultimate",
        packages: [
          { name: "Sky Signature & Cinema HD", price: 48.00 },
          { name: "Sky Sports & Ultra HD VIP", price: 72.00 },
          { name: "Sky Premier Complete Suite", price: 110.00 },
        ],
      },
      {
        id: "canal",
        name: "Canal+ International Prestige",
        packages: [{ name: "Grand Panoramique Europe", price: 65.00 }],
      },
    ],
  },
  "Mobile Airtime": {
    icon: PhoneCall,
    providers: [
      { id: "ee", name: "EE Global Mobile Network" },
      { id: "vodafone", name: "Vodafone Premier UK" },
      { id: "o2", name: "O2 Priority Mobile" },
    ],
  },
  "Mobile Data": {
    icon: Smartphone,
    providers: [
      {
        id: "ee-data",
        name: "EE Unlimited 5G Data",
        packages: [
          { name: "50GB Roaming Flex", price: 25.00 },
          { name: "Unlimited VIP Max 5G", price: 45.00 },
        ],
      },
      {
        id: "vodafone-data",
        name: "Vodafone Red Global Roam",
        packages: [
          { name: "100GB Global Roaming Plan", price: 40.00 },
          { name: "Infinite Worldwide Unlimited", price: 65.00 },
        ],
      },
    ],
  },
  "Other Supported Utilities": {
    icon: Layers,
    providers: [
      { id: "council", name: "Westminster & Kensington Council Tax" },
      { id: "refuse", name: "Private Municipal Estate Refuse Management" },
    ],
  },
};

export function PayBillsView() {
  const { accounts, activeAccount, setActiveAccount, executeUtilityPayment, setActiveSection } =
    useCustomerBanking();

  const [selectedCategory, setSelectedCategory] = useState<UtilityCategory | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [identifier, setIdentifier] = useState("");
  const [meterType, setMeterType] = useState("Smart Meter (Direct Feed)");
  const [subscriptionPackage, setSubscriptionPackage] = useState("");
  const [amount, setAmount] = useState("");
  const [customerVerifiedName, setCustomerVerifiedName] = useState("");
  const [reference, setReference] = useState("");

  const [step, setStep] = useState<"categories" | "form" | "review" | "success">("categories");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [txResult, setTxResult] = useState<{ reference: string; date: string } | null>(null);

  const categories: UtilityCategory[] = [
    "Electricity",
    "Water",
    "Internet",
    "Cable Television",
    "Mobile Airtime",
    "Mobile Data",
    "Other Supported Utilities",
  ];

  const handleSelectCategory = (cat: UtilityCategory) => {
    setSelectedCategory(cat);
    const providers = CATEGORY_DATA[cat]?.providers || [];
    setSelectedProvider(providers[0]?.name || "");
    setIdentifier("");
    setAmount("");
    setCustomerVerifiedName("");
    setReference("");
    setErrorMsg("");
    setStep("form");
  };

  const handleSimulateVerify = () => {
    if (!identifier.trim()) {
      setErrorMsg("Please enter an account, meter, or phone number first.");
      return;
    }
    setErrorMsg("");
    setIsVerifying(true);
    setTimeout(() => {
      setCustomerVerifiedName("Arthur M. Sterling (Verified Account)");
      setIsVerifying(false);
    }, 700);
  };

  const handleReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    const parsedAmount = parseFloat(amount) || 0;

    if (!selectedProvider) return setErrorMsg("Please choose a utility provider.");
    if (!identifier.trim()) return setErrorMsg("Account or meter identifier is required.");
    if (parsedAmount <= 0) return setErrorMsg("Payment amount must be greater than 0.");
    if (activeAccount.availableBalance < parsedAmount) {
      return setErrorMsg(
        `Insufficient available balance in ${activeAccount.name} (£${activeAccount.availableBalance.toLocaleString()}).`,
      );
    }

    setStep("review");
  };

  const handleConfirmPayment = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const parsedAmount = parseFloat(amount) || 0;
      const res = await executeUtilityPayment({
        category: selectedCategory || "Utility",
        provider: selectedProvider,
        customerIdentifier: identifier,
        meterOrAccountType: meterType,
        customerName: customerVerifiedName || "Verified Account",
        amount: parsedAmount,
        reference: reference || `${selectedCategory} Payment`,
      });

      if (!res.success) {
        setErrorMsg(res.error || "Payment processing failed.");
        setIsSubmitting(false);
        return;
      }

      setTxResult({
        reference: res.reference,
        date: new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }),
      });
      setStep("success");
    } catch {
      setErrorMsg("Utility processing exception. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetAll = () => {
    setSelectedCategory(null);
    setSelectedProvider("");
    setIdentifier("");
    setAmount("");
    setCustomerVerifiedName("");
    setReference("");
    setStep("categories");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <span className="text-[11px] font-semibold tracking-widest text-[#C6A66B] uppercase flex items-center gap-1.5">
          <Receipt className="h-3.5 w-3.5" /> Institutional Bill Payment Portal
        </span>
        <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mt-1">
          Pay Your Bills Without the Hassle.
        </h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
          Manage eligible household and everyday payments conveniently from your Auremont Trust Bank account.
        </p>
      </div>

      {/* STEP 1: CATEGORY SELECTION */}
      {step === "categories" && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-foreground">Select a Utility Service Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = CATEGORY_DATA[cat]?.icon || Receipt;
              return (
                <div
                  key={cat}
                  onClick={() => handleSelectCategory(cat)}
                  className="p-5 rounded-xl border border-white/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md shadow-sm hover:shadow-md hover:border-[#C6A66B] transition-all cursor-pointer group flex items-start gap-4"
                >
                  <div className="p-3 rounded-lg bg-[#C6A66B]/15 text-[#C6A66B] group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <strong className="text-sm font-semibold text-foreground block group-hover:text-[#C6A66B] transition-colors">
                      {cat}
                    </strong>
                    <span className="text-xs text-muted-foreground block">
                      {CATEGORY_DATA[cat]?.providers.length} registered providers
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: DEDICATED PAYMENT FORM */}
      {step === "form" && selectedCategory && (
        <form onSubmit={handleReview} className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setStep("categories")}
              className="text-xs gap-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Categories</span>
            </Button>
            <span className="text-xs font-semibold text-[#C6A66B] uppercase tracking-wider">
              {selectedCategory} Payment
            </span>
          </div>

          <div className="p-6 rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-5">
            {/* Source Account */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">Funding Account</label>
              <select
                value={activeAccount.id}
                onChange={(e) => {
                  const target = accounts.find((a) => a.id === e.target.value);
                  if (target) setActiveAccount(target);
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs outline-none"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.maskedAccountNumber}) — Available: {acc.currency}{" "}
                    {acc.availableBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </option>
                ))}
              </select>
            </div>

            {/* Provider Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Service Provider <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProvider}
                onChange={(e) => {
                  setSelectedProvider(e.target.value);
                  setSubscriptionPackage("");
                }}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs outline-none"
                required
              >
                {CATEGORY_DATA[selectedCategory]?.providers.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Provider Packages (For Internet, Cable TV, Mobile Data) */}
            {CATEGORY_DATA[selectedCategory]?.providers.find((p) => p.name === selectedProvider)
              ?.packages && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Select Subscription Package</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORY_DATA[selectedCategory]?.providers
                    .find((p) => p.name === selectedProvider)
                    ?.packages?.map((pkg) => (
                      <div
                        key={pkg.name}
                        onClick={() => {
                          setSubscriptionPackage(pkg.name);
                          setAmount(pkg.price.toString());
                        }}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          subscriptionPackage === pkg.name
                            ? "border-[#C6A66B] bg-[#C6A66B]/10 font-semibold"
                            : "border-border/60 hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{pkg.name}</span>
                          <span className="font-mono font-bold text-foreground">£{pkg.price.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Identifier: Meter / Smartcard / Account / Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  {selectedCategory === "Electricity"
                    ? "Customer Meter Number"
                    : selectedCategory === "Water"
                      ? "Water Account ID"
                      : selectedCategory === "Cable Television"
                        ? "Smartcard / Decoder Number"
                        : selectedCategory.includes("Mobile")
                          ? "Mobile Phone Number"
                          : "Customer Account Identifier"}{" "}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-2">
                  <Input
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter identifier"
                    className="text-xs font-mono"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSimulateVerify}
                    disabled={isVerifying}
                    className="text-xs shrink-0"
                  >
                    {isVerifying ? (
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                    ) : (
                      <Search className="h-3 w-3" />
                    )}
                    <span>Verify</span>
                  </Button>
                </div>
              </div>

              {selectedCategory === "Electricity" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Meter Type</label>
                  <select
                    value={meterType}
                    onChange={(e) => setMeterType(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs outline-none"
                  >
                    <option>Smart Meter (Direct Feed)</option>
                    <option>Prepaid Digital Keypad</option>
                    <option>Postpaid Quarterly Meter</option>
                  </select>
                </div>
              )}

              {/* Verified Customer Name Feedback */}
              {customerVerifiedName && (
                <div className="md:col-span-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>
                    Provider Record Match: <strong>{customerVerifiedName}</strong>
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Payment Amount ({activeAccount.currency}) <span className="text-rose-500">*</span>
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
                <label className="text-xs font-medium text-foreground">Payment Reference (Optional)</label>
                <Input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. November Residence Utility"
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("categories")}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs gap-1.5 px-6"
            >
              <span>Review Payment</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      )}

      {/* STEP 3: PAYMENT REVIEW */}
      {step === "review" && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <div>
                <h3 className="text-base font-serif font-semibold text-foreground">
                  Confirm Utility Bill Settlement
                </h3>
                <p className="text-xs text-muted-foreground">
                  Verify the provider and billing account details prior to payment authorization.
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
                <span>Edit</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[11px] text-muted-foreground block">Service Category</span>
                <strong className="text-foreground text-sm font-medium">{selectedCategory}</strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Provider</span>
                <strong className="text-foreground text-sm font-medium">{selectedProvider}</strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Customer Identifier</span>
                <strong className="text-foreground text-sm font-mono">{identifier}</strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Customer Name</span>
                <strong className="text-foreground text-sm font-medium">
                  {customerVerifiedName || "Arthur Sterling"}
                </strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Debit From Account</span>
                <strong className="text-foreground text-sm font-medium">
                  {activeAccount.name} ({activeAccount.maskedAccountNumber})
                </strong>
              </div>

              <div>
                <span className="text-[11px] text-muted-foreground block">Settlement Fee</span>
                <strong className="text-emerald-600 font-medium">£0.00 (Inclusive)</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-muted/60 to-muted/30 border border-border/60 flex justify-between items-center">
              <div>
                <span className="text-xs text-muted-foreground block">Total Payment Amount:</span>
                <span className="text-xl font-bold font-serif text-[#C6A66B]">
                  £{parseFloat(amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" /> Direct Settlement Ready
              </span>
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
              <span>Back</span>
            </Button>

            <Button
              type="button"
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs gap-1.5 px-6"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  <span>Settling with Provider…</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Authorize & Pay Bill</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: PAYMENT RECEIPT */}
      {step === "success" && txResult && (
        <div className="p-8 rounded-xl border border-white/60 bg-white/80 dark:bg-slate-900/70 backdrop-blur-md shadow-md text-center max-w-lg mx-auto space-y-6">
          <div className="h-16 w-16 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-serif font-semibold text-foreground">
              Utility Payment Confirmed.
            </h2>
            <p className="text-xs text-muted-foreground">
              The payment has been disbursed to the utility provider network and cleared.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/40 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Reference:</span>
              <span className="font-mono font-semibold text-foreground">{txResult.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Provider:</span>
              <span className="font-medium text-foreground">{selectedProvider}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account / Meter:</span>
              <span className="font-mono text-foreground">{identifier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount Paid:</span>
              <span className="font-mono font-semibold text-foreground">
                £{parseFloat(amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Date:</span>
              <span className="text-foreground">{txResult.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={resetAll}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Pay Another Bill</span>
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
