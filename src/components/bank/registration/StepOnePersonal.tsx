import React from "react";
import { User, Calendar, MapPin, Globe, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countryList, type ApplicationFormData } from "./types";

interface StepOneProps {
  data: ApplicationFormData;
  updateData: (fields: Partial<ApplicationFormData>) => void;
  errors: Record<string, string>;
}

export function StepOnePersonal({ data, updateData, errors }: StepOneProps) {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="border-b border-border/70 pb-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
          <User className="h-4 w-4" />
          <span>Step 1 of 6 · Personal Profile</span>
        </div>
        <h2 className="mt-1 text-2xl font-serif font-medium tracking-tight text-foreground sm:text-3xl">
          Let’s Get to Know You.
        </h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Please provide your personal information exactly as it appears on your official government identification documents.
        </p>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs font-medium text-foreground">
            First Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            placeholder="e.g. Jonathan"
            className={errors.firstName ? "border-destructive focus-visible:ring-destructive" : ""}
            aria-invalid={!!errors.firstName}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          {errors.firstName && (
            <p id="firstName-error" className="text-xs text-destructive">
              {errors.firstName}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="middleName" className="text-xs font-medium text-foreground">
            Middle Name <span className="text-muted-foreground font-normal">(Optional)</span>
          </Label>
          <Input
            id="middleName"
            value={data.middleName || ""}
            onChange={(e) => updateData({ middleName: e.target.value })}
            placeholder="e.g. Edward"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs font-medium text-foreground">
            Last Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
            placeholder="e.g. Sterling"
            className={errors.lastName ? "border-destructive focus-visible:ring-destructive" : ""}
            aria-invalid={!!errors.lastName}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          {errors.lastName && (
            <p id="lastName-error" className="text-xs text-destructive">
              {errors.lastName}
            </p>
          )}
        </div>
      </div>

      {/* Date of Birth & Gender */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dateOfBirth" className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>Date of Birth <span className="text-destructive">*</span></span>
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={data.dateOfBirth}
            onChange={(e) => updateData({ dateOfBirth: e.target.value })}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split("T")[0]}
            className={errors.dateOfBirth ? "border-destructive focus-visible:ring-destructive" : ""}
            aria-invalid={!!errors.dateOfBirth}
            aria-describedby={errors.dateOfBirth ? "dob-error" : undefined}
          />
          <p className="text-[11px] text-muted-foreground">
            Applicants must be at least 18 years of age.
          </p>
          {errors.dateOfBirth && (
            <p id="dob-error" className="text-xs text-destructive">
              {errors.dateOfBirth}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="gender" className="text-xs font-medium text-foreground">
            Gender <span className="text-muted-foreground font-normal">(Optional, where legally appropriate)</span>
          </Label>
          <Select
            value={data.gender || ""}
            onValueChange={(val) => updateData({ gender: val as ApplicationFormData["gender"] })}
          >
            <SelectTrigger id="gender">
              <SelectValue placeholder="Select gender (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Non-Binary">Non-Binary</SelectItem>
              <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Citizenship & Residence */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="nationality" className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <Globe className="h-3.5 w-3.5 text-primary" />
            <span>Nationality <span className="text-destructive">*</span></span>
          </Label>
          <Select
            value={data.nationality}
            onValueChange={(val) => updateData({ nationality: val })}
          >
            <SelectTrigger id="nationality" className={errors.nationality ? "border-destructive" : ""}>
              <SelectValue placeholder="Select primary citizenship" />
            </SelectTrigger>
            <SelectContent>
              {countryList.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.nationality && (
            <p className="text-xs text-destructive">{errors.nationality}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="countryOfResidence" className="text-xs font-medium text-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Country of Residence <span className="text-destructive">*</span></span>
          </Label>
          <Select
            value={data.countryOfResidence}
            onValueChange={(val) => updateData({ countryOfResidence: val })}
          >
            <SelectTrigger id="countryOfResidence" className={errors.countryOfResidence ? "border-destructive" : ""}>
              <SelectValue placeholder="Select tax & residential country" />
            </SelectTrigger>
            <SelectContent>
              {countryList.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.countryOfResidence && (
            <p className="text-xs text-destructive">{errors.countryOfResidence}</p>
          )}
        </div>
      </div>

      {/* Residential Address */}
      <div className="space-y-4 rounded-lg border border-border/80 bg-muted/20 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>Permanent Residential Address</span>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="residentialAddress" className="text-xs font-medium text-foreground">
            Street Address <span className="text-destructive">*</span>
          </Label>
          <Input
            id="residentialAddress"
            value={data.residentialAddress}
            onChange={(e) => updateData({ residentialAddress: e.target.value })}
            placeholder="e.g. 14 Kensington Palace Gardens, Suite 4B"
            className={errors.residentialAddress ? "border-destructive" : ""}
          />
          {errors.residentialAddress && (
            <p className="text-xs text-destructive">{errors.residentialAddress}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="city" className="text-xs font-medium text-foreground">
              City <span className="text-destructive">*</span>
            </Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => updateData({ city: e.target.value })}
              placeholder="e.g. London"
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && <p className="text-xs text-destructive">{errors.city}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="stateProvince" className="text-xs font-medium text-foreground">
              State / Province <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stateProvince"
              value={data.stateProvince}
              onChange={(e) => updateData({ stateProvince: e.target.value })}
              placeholder="e.g. Greater London"
              className={errors.stateProvince ? "border-destructive" : ""}
            />
            {errors.stateProvince && (
              <p className="text-xs text-destructive">{errors.stateProvince}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="postalCode" className="text-xs font-medium text-foreground">
              Postal / ZIP Code <span className="text-destructive">*</span>
            </Label>
            <Input
              id="postalCode"
              value={data.postalCode}
              onChange={(e) => updateData({ postalCode: e.target.value })}
              placeholder="e.g. W8 4QY"
              className={errors.postalCode ? "border-destructive" : ""}
            />
            {errors.postalCode && (
              <p className="text-xs text-destructive">{errors.postalCode}</p>
            )}
          </div>
        </div>
      </div>

      {/* Regulatory reassurance note */}
      <div className="flex items-center gap-2 rounded-md bg-secondary/5 px-3.5 py-2.5 text-xs text-muted-foreground border border-border/60">
        <Shield className="h-4 w-4 text-primary shrink-0" />
        <span>
          Auremont Trust Bank enforces strict data confidentiality. Your legal address details are encrypted with TLS 1.3 in transit and protected under Swiss and international banking privacy guidelines.
        </span>
      </div>
    </div>
  );
}
