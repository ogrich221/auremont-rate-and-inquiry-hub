import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  canAccessAdministration,
  customerSchema,
  applicationSchema,
  reviewSchema,
  statusSchema,
  maskReference,
} from "@/lib/admin-model";
import {
  isSequentialOrRepetitivePin,
  evaluatePasswordStrength,
  type ApplicationRecord,
} from "@/components/bank/registration/types";
import {
  saveNewApplication,
  getApplicationByRef,
  updateApplicationReview,
} from "@/lib/application.server";

describe("Admin Open Account & Login Functional Integrity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Admin Open Account Feature (Customer Creation & Application Provisioning)", () => {
    it("validates successful customer creation by an administrator", () => {
      const validCustomer = {
        first_name: "Victoria",
        middle_name: "Elizabeth",
        last_name: "Windsor",
        date_of_birth: "1985-06-15",
        nationality: "United Kingdom",
        country: "United Kingdom",
        address: "10 Belgrave Square, London",
        email: "v.windsor@auremont-client.co.uk",
        phone: "+44 20 7946 0912",
        alternative_phone: "+44 77 0090 0821",
        account_type: "Wealth" as const,
        currency: "GBP" as const,
        opening_date: "2026-11-21",
        notes: "Onboarded via private wealth administration desk",
      };

      const result = customerSchema.safeParse(validCustomer);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.account_type).toBe("Wealth");
        expect(result.data.currency).toBe("GBP");
        expect(result.data.first_name).toBe("Victoria");
      }
    });

    it("strictly blocks raw password or PIN injection during admin customer provisioning", () => {
      const poisonedCustomer = {
        first_name: "Alexander",
        last_name: "Cross",
        email: "alexander.cross@example.com",
        account_type: "Personal" as const,
        currency: "USD" as const,
        password: "InsecurePlaintextPassword123!",
        pin: "123456",
      };

      const result = customerSchema.safeParse(poisonedCustomer);
      expect(result.success).toBe(false);
    });

    it("validates administrative demo application record creation", () => {
      const demoApp = {
        first_name: "Genevieve",
        last_name: "Dupont",
        email: "genevieve.dupont@example.fr",
        phone: "+33 1 42 68 55 00",
        account_type: "Business" as const,
        currency: "EUR" as const,
      };

      const result = applicationSchema.safeParse(demoApp);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("EUR");
      }
    });

    it("requires documented checks before administrative approval of an account application", () => {
      const pendingApproval = {
        id: "11111111-2222-3333-4444-555555555555",
        decision: "Approved" as const,
        reason: "Full KYC and identity checks satisfied",
        checks: false, // Checks not marked complete
      };

      const failure = reviewSchema.safeParse(pendingApproval);
      expect(failure.success).toBe(false);

      const verifiedApproval = {
        ...pendingApproval,
        checks: true,
      };
      const success = reviewSchema.safeParse(verifiedApproval);
      expect(success.success).toBe(true);
    });

    it("processes complete onboarding application lifecycle and audit trail update", async () => {
      const testRef = `ATB-ADM-${Date.now()}`;
      const newApp: ApplicationRecord = {
        referenceNumber: testRef,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: "UNDER_COMPLIANCE_REVIEW",
        applicant: {
          fullName: "Charles Montgomery",
          firstName: "Charles",
          lastName: "Montgomery",
          email: "c.montgomery@auremont-test.com",
          phone: "+1 212 555 0199",
          nationality: "United States",
          countryOfResidence: "United States",
          residentialAddress: "740 Park Avenue",
          city: "New York",
          stateProvince: "NY",
          postalCode: "10021",
          dateOfBirth: "1975-03-22",
        },
        preferences: {
          accountType: "wealth_management",
          accountTypeName: "Private Wealth Reserve",
          currency: "USD",
          employmentStatus: "Executive",
          occupation: "Managing Director",
          sourceOfFunds: "Investment Returns",
          expectedActivity: "Over $100,000 / month",
        },
        security: {
          passwordHash: "PBKDF2_MOCKED_HASH_FOR_TEST",
          pinHash: "PBKDF2_MOCKED_PIN_HASH",
          securityQuestion1: "What was the name of your first elementary school?",
          securityAnswer1Hash: "HASH_A1",
          securityQuestion2: "In what city or town did your parents meet?",
          securityAnswer2Hash: "HASH_A2",
          twoFactorMethod: "TOTP_AUTHENTICATOR",
        },
        identity: {
          documentType: "Passport",
          documentNumber: "US987654321",
          issuingCountry: "United States",
          documentExpiryDate: "2032-12-31",
          documentFrontFileName: "passport_front.jpg",
          proofOfAddressFileName: "utility_bill.pdf",
          sourceOfWealthFileName: "tax_return.pdf",
        },
        auditTrail: [
          {
            timestamp: new Date().toISOString(),
            status: "UNDER_COMPLIANCE_REVIEW",
            note: "Applicant completed digital application on onboarding portal.",
            actor: "Applicant",
          },
        ],
      };

      await saveNewApplication(newApp);
      const retrieved = await getApplicationByRef(testRef);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.applicant.fullName).toBe("Charles Montgomery");
      expect(retrieved?.status).toBe("UNDER_COMPLIANCE_REVIEW");

      // Admin executes approval to open the account
      const updated = await updateApplicationReview(
        testRef,
        "APPROVED",
        "Identity verified through institutional KYC clearing. Account opened successfully.",
        "Primary Compliance Administrator",
      );

      expect(updated.status).toBe("APPROVED");
      expect(updated.auditTrail.length).toBe(2);
      expect(updated.auditTrail[0].actor).toBe("Primary Compliance Administrator");
      expect(updated.auditTrail[0].action).toContain("APPROVED");
    });
  });

  describe("2. Authentication and Login Safeguards (Customer & Administrator)", () => {
    it("strictly grants admin login only to designated primary administrator with role and AAL2 MFA", () => {
      // Valid admin with full MFA
      expect(canAccessAdministration(true, true, "aal2")).toBe(true);

      // Attempting without primary designated identity
      expect(canAccessAdministration(false, true, "aal2")).toBe(false);

      // Attempting without admin role
      expect(canAccessAdministration(true, false, "aal2")).toBe(false);

      // Attempting with AAL1 (password only, missing 2FA challenge)
      expect(canAccessAdministration(true, true, "aal1")).toBe(false);
    });

    it("evaluates password strength rigorously for account security", () => {
      // Weak password
      const weak = evaluatePasswordStrength("abc123");
      expect(weak.score).toBeLessThanOrEqual(2);
      expect(weak.checks.length).toBe(false);

      // Strong password meeting institutional requirements
      const strong = evaluatePasswordStrength("Auremont#Secure$2026Vault!");
      expect(strong.checks.length).toBe(true);
      expect(strong.checks.uppercase).toBe(true);
      expect(strong.checks.lowercase).toBe(true);
      expect(strong.checks.number).toBe(true);
      expect(strong.checks.special).toBe(true);
      expect(strong.score).toBeGreaterThanOrEqual(4);
    });

    it("validates 6-digit PIN rules preventing easily guessable patterns", () => {
      expect(isSequentialOrRepetitivePin("123456").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("654321").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("999999").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("121212").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("849102").invalid).toBe(false);
    });

    it("correctly masks sensitive account numbers in admin overview", () => {
      expect(maskReference("ACT-2026-987654")).toBe("•••• 987654");
      expect(maskReference("DEMO-001234")).toBe("•••• 001234");
    });
  });
});
