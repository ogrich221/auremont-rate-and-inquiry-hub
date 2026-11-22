import React from "react";
import {
  CreditCard,
  PiggyBank,
  Crown,
  Briefcase,
  Check,
  Coins,
  Building,
  TrendingUp,
  Info,
  ShieldAlert,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  accountTypes,
  currencies,
  employmentStatuses,
  sourcesOfFunds,
  expectedActivities,
  type ApplicationFormData,
  type AccountTypeId,
} from "./types";

interface StepThreeProps {
  data: ApplicationFormData;
  updateData: (fields: Partial<ApplicationFormData>) => void;
  errors: Record<string, string>;
}

export function StepThreePreferences({ data, updateData, errors }: StepThreeProps) {
  const getAccountIcon = (id: AccountTypeId) => {
    switch (id) {
      case "personal_checking":
        return <CreditCard className="h-5 w-5 text-primary" />;
      case "personal_savings":
        return <PiggyBank className="h-5 w-5 text-primary" />;
      case "premium_savings":
        return <Crown className="h-5 w-5 text-primary" />;
      case "business_account":
        return <Briefcase className="h-5 w-5 text-primary" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <Coins className="h-4 w-4" />
          <span>Step 3 of 6 · Banking Structure</span>
        </div>
        <h2 className="mt-1 text-2xl font-serif font-medium tracking-tight text-foreground sm:text-3xl">
          Choose Your Banking Preferences.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Select the institutional banking services and liquidity structures that best match your personal or corporate financial profile.
        </p>
      </div>

      {/* Account Type Selection - Luxury Selectable Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Preferred Account Type <span className="text-destructive">*</span>
          </Label>
          <span className="text-xs text-muted-foreground">Select one service tier</span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {accountTypes.map((type) => {
            const isSelected = data.preferredAccountType === type.id;
            return (
              <div
                key={type.id}
                role="button"
                tabIndex={0}
                onClick={() => updateData({ preferredAccountType: type.id })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    updateData({ preferredAccountType: type.id });
                  }
                }}
                className={`relative flex flex-col justify-between rounded-xl border p-5 text-left transition-all cursor-pointer ${
                  isSelected
                    ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/80"
                    : "border-border/80 bg-card hover:border-primary/50 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 border border-primary/20">
                        {getAccountIcon(type.id)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground tracking-tight">
                          {type.name}
                        </h3>
                        <p className="text-[11px] font-medium text-primary">
                          {type.tagline}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="h-5 w-5 rounded-full border border-border" />
                    )}
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                    {type.description}
                  </p>

                  <ul className="mt-3 space-y-1.5 border-t border-border/50 pt-3">
                    {type.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-[11px] text-foreground/80">
                        <Check className="h-3 w-3 text-primary mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2 border-t border-border/40">
                  <Badge variant="outline" className="text-[10px] font-medium border-primary/30 text-primary">
                    {type.badge}
                  </Badge>
                  {type.id === "business_account" && (
                    <span className="text-[10px] text-muted-foreground italic">
                      Separate licensing verification applies
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Account Currency & Employment Status */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="preferredCurrency" className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Coins className="h-3.5 w-3.5 text-primary" />
            <span>Base Account Currency <span className="text-destructive">*</span></span>
          </Label>
          <Select
            value={data.preferredCurrency}
            onValueChange={(val) => updateData({ preferredCurrency: val })}
          >
            <SelectTrigger id="preferredCurrency">
              <SelectValue placeholder="Select primary settlement currency" />
            </SelectTrigger>
            <SelectContent>
              {currencies.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="employmentStatus" className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Building className="h-3.5 w-3.5 text-primary" />
            <span>Employment Status <span className="text-destructive">*</span></span>
          </Label>
          <Select
            value={data.employmentStatus}
            onValueChange={(val) => updateData({ employmentStatus: val })}
          >
            <SelectTrigger id="employmentStatus">
              <SelectValue placeholder="Select professional status" />
            </SelectTrigger>
            <SelectContent>
              {employmentStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Occupation & Source of Funds */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="occupation" className="text-xs font-medium text-foreground">
            Current Occupation / Profession <span className="text-destructive">*</span>
          </Label>
          <Input
            id="occupation"
            value={data.occupation}
            onChange={(e) => updateData({ occupation: e.target.value })}
            placeholder="e.g. Managing Director / Partner"
            className={errors["occupation"] ? "border-destructive" : ""}
          />
          {errors["occupation"] && (
            <p className="text-xs text-destructive">{errors["occupation"]}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sourceOfFunds" className="text-xs font-medium text-foreground">
            Primary Source of Capital & Wealth <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.sourceOfFunds}
            onValueChange={(val) => updateData({ sourceOfFunds: val })}
          >
            <SelectTrigger id="sourceOfFunds">
              <SelectValue placeholder="Select source of funds" />
            </SelectTrigger>
            <SelectContent>
              {sourcesOfFunds.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expected Account Activity */}
      <div className="space-y-1.5">
        <Label htmlFor="expectedActivity" className="text-xs font-medium text-foreground flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5 text-primary" />
          <span>Anticipated Monthly Turnover / Activity <span className="text-destructive">*</span></span>
        </Label>
        <Select
          value={data.expectedActivity}
          onValueChange={(val) => updateData({ expectedActivity: val })}
        >
          <SelectTrigger id="expectedActivity">
            <SelectValue placeholder="Select expected monthly flow" />
          </SelectTrigger>
          <SelectContent>
            {expectedActivities.map((tier) => (
              <SelectItem key={tier} value={tier}>
                {tier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-[11px] text-muted-foreground">
          Assists in determining risk profiles, personalized daily clearing limits, and fee schedules.
        </p>
      </div>

      {/* Regulatory Availability Disclaimer */}
      <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Regulatory Notice on Product Availability:</strong> Account availability, deposit limits, interest yields, and payment services are subject to Auremont Trust Bank's jurisdictional banking licenses, regulatory compliance verification, and client qualification criteria. Business accounts undergo independent corporate entity checks.
        </div>
      </div>
    </div>
  );
}
