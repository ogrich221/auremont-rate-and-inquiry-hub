import { z } from "zod";

export type StepNumber = 1 | 2 | 3 | 4 | 5;

export const countryList = [
  "United States",
  "United Kingdom",
  "Switzerland",
  "Singapore",
  "United Arab Emirates",
  "Canada",
  "Germany",
  "France",
  "Australia",
  "Japan",
  "Hong Kong",
  "Monaco",
  "Luxembourg",
  "Netherlands",
  "Ireland",
  "Norway",
  "Sweden",
  "New Zealand",
] as const;

export const callingCodes = [
  { code: "+1", country: "US / CA" },
  { code: "+44", country: "United Kingdom" },
  { code: "+41", country: "Switzerland" },
  { code: "+65", country: "Singapore" },
  { code: "+971", country: "United Arab Emirates" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+377", country: "Monaco" },
  { code: "+352", country: "Luxembourg" },
  { code: "+61", country: "Australia" },
  { code: "+81", country: "Japan" },
  { code: "+852", country: "Hong Kong" },
] as const;

export const securityQuestionsList = [
  "What was the name of your first school?",
  "What city were you born in?",
  "What was the name of your first pet?",
  "What was the name of your childhood best friend?",
  "What is a memorable childhood nickname?",
] as const;

export const accountTypes = [
  {
    id: "personal_checking",
    name: "Personal Checking Account",
    tagline: "Everyday Liquidity & Global Access",
    description:
      "Seamless day-to-day transactions with premium metal debit privileges, multi-currency pockets, and zero international transaction surcharges.",
    badge: "Popular",
    features: [
      "Multi-currency debit card with instant freeze controls",
      "Complimentary domestic & international ATM withdrawals",
      "Real-time fraud telemetry and merchant protection",
      "Dedicated digital banking concierge",
    ],
  },
  {
    id: "personal_savings",
    name: "Personal Savings Account",
    tagline: "Disciplined Wealth Accumulation",
    description:
      "Capital preservation with institutional-grade yield and automatic round-ups into multi-currency reserve vaults.",
    badge: "4.25% APY Illustrative",
    features: [
      "Competitive tiered interest calculated daily",
      "Automated recurrent deposit allocations",
      "No monthly maintenance fees with threshold balance",
      "Quarterly market review and liquidity reporting",
    ],
  },
  {
    id: "premium_savings",
    name: "Premium Savings Account",
    tagline: "Private Client High-Yield Treasury",
    description:
      "Bespoke high-balance liquid treasury account featuring top-tier yields, private wealth advisory, and priority settlement routing.",
    badge: "4.85% APY Illustrative",
    features: [
      "Enhanced yield structure for qualified capital deposits",
      "Assigned Private Wealth Officer & direct telephone desk",
      "Preferential foreign exchange treasury rates",
      "Invitations to exclusive institutional macroeconomic briefings",
    ],
  },
  {
    id: "business_account",
    name: "Business Account",
    tagline: "Corporate Liquidity & Operations",
    description:
      "Enterprise cash management and treasury tools built for international commercial enterprises and family investment offices.",
    badge: "Subject to Eligibility",
    features: [
      "Multi-signatory approval workflows and audit trails",
      "Custom commercial wire and SWIFT/SEPA integration",
      "Direct accounting software synchronization",
      "Separate commercial licensing & compliance verification required",
    ],
  },
] as const;

export type AccountTypeId = (typeof accountTypes)[number]["id"];

export const currencies = [
  { code: "USD", symbol: "$", label: "USD – US Dollar ($)" },
  { code: "EUR", symbol: "€", label: "EUR – Euro (€)" },
  { code: "GBP", symbol: "£", label: "GBP – British Pound (£)" },
  { code: "CHF", symbol: "Fr.", label: "CHF – Swiss Franc (Fr.)" },
  { code: "SGD", symbol: "S$", label: "SGD – Singapore Dollar (S$)" },
  { code: "AED", symbol: "د.إ", label: "AED – UAE Dirham (د.إ)" },
] as const;

export const employmentStatuses = [
  "Employed",
  "Self-Employed",
  "Business Owner",
  "Retired",
  "Private Investor",
  "Student",
] as const;

export const sourcesOfFunds = [
  "Employment Income",
  "Business Earnings & Dividends",
  "Investment & Capital Gains",
  "Family Trust / Inheritance",
  "Real Estate / Asset Liquidation",
  "Other Legitimate Capital",
] as const;

export const expectedActivities = [
  "Under $10,000 / month",
  "$10,000 – $50,000 / month",
  "$50,000 – $250,000 / month",
  "$250,000+ / month (Private Client Tier)",
] as const;

export const identityDocumentTypes = [
  { id: "passport", label: "International Passport" },
  { id: "national_id", label: "National Identity Card" },
  { id: "driving_license", label: "Government Driver's License" },
] as const;

export interface ApplicationFormData {
  // Step 1: Personal Information
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender?: "Male" | "Female" | "Non-Binary" | "Prefer not to say" | "";
  nationality: string;
  countryOfResidence: string;
  residentialAddress: string;
  city: string;
  stateProvince: string;
  postalCode: string;

  // Step 2: Contact Information
  email: string;
  confirmEmail: string;
  countryCallingCode: string;
  mobilePhone: string;
  alternativePhone?: string;
  preferredContactMethod: "Email" | "SMS" | "Phone Call";
  emailVerified: boolean;
  phoneVerified: boolean;

  // Step 3: Account Preferences
  preferredAccountType: AccountTypeId;
  preferredCurrency: string;
  employmentStatus: string;
  occupation: string;
  sourceOfFunds: string;
  expectedActivity: string;

  // Step 4: Security Setup
  password: string;
  confirmPassword: string;
  securityQuestions: [
    { question: string; answer: string },
    { question: string; answer: string },
    { question: string; answer: string },
  ];
  transferPin: string;
  confirmTransferPin: string;

  // Optional Identity Verification (KYC Exempt for direct access)
  documentType?: "passport" | "national_id" | "driving_license";
  documentNumber?: string;
  issuingCountry?: string;
  documentExpiryDate?: string;
  documentFrontUploaded?: boolean;
  documentFrontFilename?: string;
  documentBackUploaded?: boolean;
  documentBackFilename?: string;
  proofOfAddressUploaded?: boolean;
  proofOfAddressFilename?: string;

  // Step 5: Review & Agreements
  acceptedTerms: boolean;
  acknowledgedPrivacy: boolean;
  consentedIdentityCheck?: boolean;
  marketingConsent: boolean;
}

export type ApplicationStatus =
  | "PENDING_REVIEW"
  | "UNDER_COMPLIANCE_REVIEW"
  | "ADDITIONAL_INFO_REQUESTED"
  | "APPROVED"
  | "REJECTED";

export interface ApplicationRecord {
  referenceNumber: string;
  submittedAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  applicant: {
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    nationality: string;
    countryOfResidence: string;
    residentialAddress: string;
    city: string;
    stateProvince: string;
    postalCode: string;
    dateOfBirth: string;
  };
  preferences: {
    accountType: string;
    accountTypeName: string;
    currency: string;
    employmentStatus: string;
    occupation: string;
    sourceOfFunds: string;
    expectedActivity: string;
  };
  security: {
    passwordHashed: boolean;
    pinMasked: string;
    securityQuestionsSummary: string[];
  };
  identity: {
    documentType: string;
    documentNumberMasked: string;
    issuingCountry: string;
    expiryDate: string;
    frontDocumentFilename: string;
    backDocumentFilename?: string;
    proofOfAddressFilename: string;
    aiVerificationStatus: "VERIFIED" | "PENDING";
  };
  compliance: {
    termsAccepted: boolean;
    privacyAcknowledged: boolean;
    kycConsent: boolean;
    marketingOptIn: boolean;
  };
  auditTrail: Array<{
    timestamp: string;
    actor: string;
    action: string;
    note?: string;
  }>;
}

/**
 * Checks whether a 6-digit PIN is repetitive (111111) or sequential (123456, 654321, 012345).
 */
export function isSequentialOrRepetitivePin(pin: string): {
  invalid: boolean;
  reason?: string;
} {
  if (!/^\d{6}$/.test(pin)) {
    return { invalid: true, reason: "PIN must be exactly 6 digits." };
  }

  // Check all digits identical (e.g. 111111, 777777)
  if (/^(\d)\1{5}$/.test(pin)) {
    return { invalid: true, reason: "Repetitive PINs like " + pin + " are not permitted for security." };
  }

  // Check sequential ascending (e.g. 123456, 234567, 012345)
  const isAscending = pin
    .split("")
    .every((d, i, arr) => i === 0 || Number(d) === (Number(arr[i - 1]) + 1) % 10);
  if (isAscending) {
    return { invalid: true, reason: "Sequential PINs (such as 123456) are easily guessed and not permitted." };
  }

  // Check sequential descending (e.g. 654321, 987654)
  const isDescending = pin
    .split("")
    .every((d, i, arr) => i === 0 || Number(d) === (Number(arr[i - 1]) - 1 + 10) % 10);
  if (isDescending) {
    return { invalid: true, reason: "Reverse sequential PINs (such as 654321) are not permitted." };
  }

  // Common obvious patterns
  const forbiddenPatterns = ["121212", "696969", "112233", "123123", "000000"];
  if (forbiddenPatterns.includes(pin)) {
    return { invalid: true, reason: "This common pattern is not permitted. Please choose a unique 6-digit combination." };
  }

  return { invalid: false };
}

/**
 * Evaluates password strength based on banking grade requirements.
 */
export function evaluatePasswordStrength(password: string): {
  score: number; // 0 to 5
  label: "Too Weak" | "Weak" | "Fair" | "Good" | "Strong" | "Excellent";
  color: string;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
} {
  const checks = {
    length: password.length >= 12,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const satisfiedCount = Object.values(checks).filter(Boolean).length;

  if (password.length === 0) {
    return { score: 0, label: "Too Weak", color: "var(--muted)", checks };
  }

  if (satisfiedCount <= 2 || !checks.length) {
    return { score: 1, label: "Weak", color: "oklch(0.55 0.18 28)", checks };
  }
  if (satisfiedCount === 3) {
    return { score: 2, label: "Fair", color: "#f59e0b", checks };
  }
  if (satisfiedCount === 4) {
    return { score: 3, label: "Good", color: "#10b981", checks };
  }
  if (satisfiedCount === 5 && password.length >= 14) {
    return { score: 5, label: "Excellent", color: "var(--gold)", checks };
  }
  return { score: 4, label: "Strong", color: "#10b981", checks };
}
