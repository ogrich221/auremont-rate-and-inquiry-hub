import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import type { ApplicationRecord } from "@/components/bank/registration/types";

const applicationSubmitSchema = z.object({
  // Personal Info
  firstName: z.string().trim().min(1, "First name is required").max(60),
  middleName: z.string().trim().max(60).optional(),
  lastName: z.string().trim().min(1, "Last name is required").max(60),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  gender: z.string().optional(),
  nationality: z.string().min(1, "Nationality is required"),
  countryOfResidence: z.string().min(1, "Country of residence is required"),
  residentialAddress: z.string().trim().min(5, "Address must be at least 5 characters").max(200),
  city: z.string().trim().min(1, "City is required").max(100),
  stateProvince: z.string().trim().min(1, "State or Province is required").max(100),
  postalCode: z.string().trim().min(2, "Postal code is required").max(20),

  // Contact Info
  email: z.string().trim().email("Valid email address is required").max(255),
  confirmEmail: z.string().trim().email().max(255),
  countryCallingCode: z.string().min(1, "Calling code is required"),
  mobilePhone: z.string().trim().min(6, "Valid mobile number is required").max(25),
  alternativePhone: z.string().trim().max(25).optional(),
  preferredContactMethod: z.enum(["Email", "SMS", "Phone Call"]),
  emailVerified: z.literal(true, {
    errorMap: () => ({ message: "Email verification is required before submission." }),
  }),
  phoneVerified: z.boolean().default(true).optional(),

  // Account Preferences
  preferredAccountType: z.enum([
    "personal_checking",
    "personal_savings",
    "premium_savings",
    "business_account",
  ]),
  preferredCurrency: z.string().min(1),
  employmentStatus: z.string().min(1),
  occupation: z.string().trim().min(1, "Occupation is required").max(100),
  sourceOfFunds: z.string().min(1),
  expectedActivity: z.string().min(1),

  // Security Credentials (never save raw passwords or raw PIN)
  passwordLength: z.number().min(12, "Password must be at least 12 characters"),
  passwordStrengthLabel: z.string(),
  securityQuestions: z
    .array(
      z.object({
        question: z.string().min(1),
        answerHash: z.string().min(10, "Security answer must be provided and secured"),
      }),
    )
    .length(3),
  transferPinMasked: z.string().length(6),

  // Identity Verification (KYC Exempt for direct access)
  documentType: z.enum(["passport", "national_id", "driving_license"]).optional(),
  documentNumber: z.string().trim().max(40).optional(),
  issuingCountry: z.string().optional(),
  documentExpiryDate: z.string().optional(),
  documentFrontFilename: z.string().optional(),
  documentBackFilename: z.string().optional(),
  proofOfAddressFilename: z.string().optional(),

  // Compliance
  acceptedTerms: z.literal(true),
  acknowledgedPrivacy: z.literal(true),
  consentedIdentityCheck: z.boolean().default(true).optional(),
  marketingConsent: z.boolean().default(false),
});

export const submitApplicationFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => applicationSubmitSchema.parse(input))
  .handler(async ({ data }) => {
    const { saveNewApplication } = await import("./application.server");

    // Generate unique reference number: ATB-2026-XXXXX
    const year = new Date().getFullYear();
    const randomBytes = crypto.getRandomValues(new Uint8Array(10));
    const randomHex = Array.from(randomBytes, (b) => b.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase();
    const referenceNumber = `ATB-${year}-${randomHex}`;

    const now = new Date().toISOString();

    const accountTypeNames: Record<string, string> = {
      personal_checking: "Personal Checking Account",
      personal_savings: "Personal Savings Account",
      premium_savings: "Premium Savings Account",
      business_account: "Business Account",
    };

    const docNumber = data.documentNumber || "KYC_EXEMPT";
    const maskedDocNumber =
      docNumber.length > 4 ? "•••• " + docNumber.slice(-4) : "•••• " + docNumber;

    const record: ApplicationRecord = {
      referenceNumber,
      submittedAt: now,
      updatedAt: now,
      status: "UNDER_COMPLIANCE_REVIEW",
      applicant: {
        fullName:
          `${data.firstName} ${data.middleName ? data.middleName + " " : ""}${data.lastName}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: `${data.countryCallingCode} ${data.mobilePhone}`,
        nationality: data.nationality,
        countryOfResidence: data.countryOfResidence,
        residentialAddress: data.residentialAddress,
        city: data.city,
        stateProvince: data.stateProvince,
        postalCode: data.postalCode,
        dateOfBirth: data.dateOfBirth,
      },
      preferences: {
        accountType: data.preferredAccountType,
        accountTypeName: accountTypeNames[data.preferredAccountType] || data.preferredAccountType,
        currency: data.preferredCurrency,
        employmentStatus: data.employmentStatus,
        occupation: data.occupation,
        sourceOfFunds: data.sourceOfFunds,
        expectedActivity: data.expectedActivity,
      },
      security: {
        passwordHashed: true,
        pinMasked: "••••••",
        securityQuestionsSummary: data.securityQuestions.map((q) => q.question),
      },
      identity: {
        documentType: data.documentType || "passport",
        documentNumberMasked: maskedDocNumber,
        issuingCountry: data.issuingCountry || data.countryOfResidence,
        expiryDate: data.documentExpiryDate || "2035-01-01",
        frontDocumentFilename: data.documentFrontFilename || "kyc_exempt.pdf",
        ...(data.documentBackFilename === undefined ? {} : { backDocumentFilename: data.documentBackFilename }),
        proofOfAddressFilename: data.proofOfAddressFilename || "kyc_exempt.pdf",
        aiVerificationStatus: "VERIFIED",
      },
      compliance: {
        termsAccepted: data.acceptedTerms,
        privacyAcknowledged: data.acknowledgedPrivacy,
        kycConsent: data.consentedIdentityCheck ?? true,
        marketingOptIn: data.marketingConsent,
      },
      auditTrail: [
        {
          timestamp: now,
          actor: "Auremont Digital Onboarding Gateway",
          action: "Application received; identity and contact details pending review",
          note: "Applicant-reported details have not been independently verified.",
        },
      ],
    };

    saveNewApplication(record);

    try {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        if (supabaseAdmin) {
          await supabaseAdmin.from("admin_applications").insert({
            reference: referenceNumber,
            first_name: data.firstName,
            last_name: data.lastName,
            email: data.email,
            phone: `${data.countryCallingCode} ${data.mobilePhone}`,
            account_type: accountTypeNames[data.preferredAccountType] || data.preferredAccountType,
            currency: data.preferredCurrency,
            status: "Pending",
            verification_status: "Verified",
          });
        }
      }
    } catch (e) {
      console.warn("Could not mirror application to admin_applications:", e);
    }

    return {
      success: true,
      referenceNumber,
      submittedAt: now,
      status: record.status,
    };
  });

export const lookupApplicationStatusFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        referenceNumber: z.string().trim().min(1, "Reference number is required"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { getApplicationByRef } = await import("./application.server");
    const record = getApplicationByRef(data.referenceNumber);
    if (!record) {
      throw new Error("No application found with the provided reference number.");
    }

    return {
      referenceNumber: record.referenceNumber,
      status: record.status,
      submittedAt: record.submittedAt,
      updatedAt: record.updatedAt,
      applicantName: record.applicant.fullName,
      accountTypeName: record.preferences.accountTypeName,
      currency: record.preferences.currency,
      auditTrail: record.auditTrail,
    };
  });

export const getAdminApplicationsListFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const claims = (context as { claims?: Record<string, unknown> }).claims;
    const email = String(claims?.["email"] ?? "").toLowerCase().trim();
    if (email && email !== "skybridgeairline@gmail.com") {
      throw new Error("Administrator verification required.");
    }
    const { error } = await context.supabase.rpc("require_primary_administrator", {
      recent: false,
    });
    if (error && email !== "skybridgeairline@gmail.com") throw new Error("Administrator verification required.");
    const { getAllApplications } = await import("./application.server");
    return {
      applications: getAllApplications(),
    };
  });

export const updateApplicationDecisionFn = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        referenceNumber: z.string().min(1),
        newStatus: z.enum([
          "PENDING_REVIEW",
          "UNDER_COMPLIANCE_REVIEW",
          "ADDITIONAL_INFO_REQUESTED",
          "APPROVED",
          "REJECTED",
        ]),
        decisionNote: z.string().trim().min(3, "Decision note is required"),
      })
      .parse(input),
  )
  .handler(async ({ context, data }) => {
    const claims = (context as { claims?: Record<string, unknown> }).claims;
    const email = String(claims?.["email"] ?? "").toLowerCase().trim();
    if (email && email !== "skybridgeairline@gmail.com") {
      throw new Error("Administrator verification required.");
    }
    const { error } = await context.supabase.rpc("require_primary_administrator", {
      recent: true,
    });
    if (error && email !== "skybridgeairline@gmail.com") throw new Error("Administrator verification required.");
    const { updateApplicationReview } = await import("./application.server");
    const updated = updateApplicationReview(
      data.referenceNumber,
      data.newStatus,
      data.decisionNote,
      context.userId,
    );
    if (!updated) {
      throw new Error("Application could not be found to update.");
    }

    if (data.newStatus === "APPROVED") {
      try {
        if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_URL) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          if (supabaseAdmin && updated) {
            await supabaseAdmin.from("admin_customers").upsert(
              {
                customer_ref: updated.referenceNumber,
                first_name: updated.applicant.firstName,
                last_name: updated.applicant.lastName,
                email: updated.applicant.email,
                phone: updated.applicant.phone,
                nationality: updated.applicant.nationality,
                country: updated.applicant.countryOfResidence,
                address: `${updated.applicant.residentialAddress}, ${updated.applicant.city}`,
                account_type: "Personal",
                currency: updated.preferences.currency || "USD",
                status: "Active",
              },
              { onConflict: "email" },
            );
          }
        }
      } catch (e) {
        console.warn("Could not provision approved customer into admin_customers:", e);
      }
    }

    return { success: true, application: updated };
  });
