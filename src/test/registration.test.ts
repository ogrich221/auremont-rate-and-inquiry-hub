import { describe, it, expect } from "vitest";
import {
  isSequentialOrRepetitivePin,
  evaluatePasswordStrength,
} from "@/components/bank/registration/types";
import {
  saveNewApplication,
  getApplicationByRef,
  updateApplicationReview,
} from "@/lib/application.server";
import type { ApplicationRecord } from "@/components/bank/registration/types";

describe("Registration Security and Validation Logic", () => {
  describe("6-Digit Transfer PIN Validation", () => {
    it("blocks repetitive PINs like 111111, 777777, 000000", () => {
      expect(isSequentialOrRepetitivePin("111111").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("777777").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("000000").invalid).toBe(true);
    });

    it("blocks sequential ascending PINs like 123456, 234567, 012345", () => {
      expect(isSequentialOrRepetitivePin("123456").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("234567").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("012345").invalid).toBe(true);
    });

    it("blocks sequential descending PINs like 654321, 987654", () => {
      expect(isSequentialOrRepetitivePin("654321").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("987654").invalid).toBe(true);
    });

    it("blocks obvious patterns like 121212, 112233", () => {
      expect(isSequentialOrRepetitivePin("121212").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("112233").invalid).toBe(true);
    });

    it("requires exactly 6 digits", () => {
      expect(isSequentialOrRepetitivePin("12345").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("1234567").invalid).toBe(true);
      expect(isSequentialOrRepetitivePin("abcdef").invalid).toBe(true);
    });

    it("approves strong, non-sequential, non-repetitive PINs", () => {
      expect(isSequentialOrRepetitivePin("948172").invalid).toBe(false);
      expect(isSequentialOrRepetitivePin("582941").invalid).toBe(false);
      expect(isSequentialOrRepetitivePin("739104").invalid).toBe(false);
    });
  });

  describe("Password Strength Evaluation", () => {
    it("classifies short passwords (<12 chars) as Weak", () => {
      const res = evaluatePasswordStrength("Short1!");
      expect(res.checks.length).toBe(false);
      expect(res.score).toBeLessThanOrEqual(2);
    });

    it("requires uppercase, lowercase, numbers, and symbols", () => {
      const res = evaluatePasswordStrength("onlylowercaseletters");
      expect(res.checks.uppercase).toBe(false);
      expect(res.checks.number).toBe(false);
      expect(res.checks.special).toBe(false);
    });

    it("rewards strong passwords meeting all criteria", () => {
      const strong = evaluatePasswordStrength("Auremont_Vault_2026!");
      expect(strong.checks.length).toBe(true);
      expect(strong.checks.uppercase).toBe(true);
      expect(strong.checks.lowercase).toBe(true);
      expect(strong.checks.number).toBe(true);
      expect(strong.checks.special).toBe(true);
      expect(strong.score).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Application Persistence and Administrative Audit Flow", () => {
    const testRecord: ApplicationRecord = {
      referenceNumber: "ATB-2026-TEST1",
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "UNDER_COMPLIANCE_REVIEW",
      applicant: {
        fullName: "Lord Arthur Sterling",
        firstName: "Arthur",
        lastName: "Sterling",
        email: "arthur.sterling@example.co.uk",
        phone: "+44 7911 123456",
        nationality: "United Kingdom",
        countryOfResidence: "United Kingdom",
        residentialAddress: "14 Kensington Palace Gardens",
        city: "London",
        stateProvince: "Greater London",
        postalCode: "W8 4QY",
        dateOfBirth: "1980-05-15",
      },
      preferences: {
        accountType: "premium_savings",
        accountTypeName: "Premium Savings Account",
        currency: "GBP",
        employmentStatus: "Private Investor",
        occupation: "Managing Partner",
        sourceOfFunds: "Investment & Capital Gains",
        expectedActivity: "$250,000+ / month (Private Client Tier)",
      },
      security: {
        passwordHashed: true,
        pinMasked: "••••••",
        securityQuestionsSummary: [
          "What was the name of your first school?",
          "What city were you born in?",
          "What was the name of your first pet?",
        ],
      },
      identity: {
        documentType: "passport",
        documentNumberMasked: "•••• 2811",
        issuingCountry: "United Kingdom",
        expiryDate: "2032-10-10",
        frontDocumentFilename: "passport_front.pdf",
        proofOfAddressFilename: "counsel_tax.pdf",
        aiVerificationStatus: "VERIFIED",
      },
      compliance: {
        termsAccepted: true,
        privacyAcknowledged: true,
        kycConsent: true,
        marketingOptIn: false,
      },
      auditTrail: [
        {
          timestamp: new Date().toISOString(),
          actor: "Auremont Digital Onboarding Gateway",
          action: "Application ingested",
        },
      ],
    };

    it("persists a new application and retrieves it by reference number", () => {
      saveNewApplication(testRecord);
      const fetched = getApplicationByRef("ATB-2026-TEST1");
      expect(fetched).not.toBeNull();
      expect(fetched?.applicant.fullName).toBe("Lord Arthur Sterling");
      expect(fetched?.status).toBe("UNDER_COMPLIANCE_REVIEW");
    });

    it("updates administrative status and appends audit trail entry", () => {
      saveNewApplication(testRecord);
      const updated = updateApplicationReview(
        "ATB-2026-TEST1",
        "APPROVED",
        "Identity and AML clearance approved by Zurich Committee.",
        "Compliance Director",
      );

      expect(updated).not.toBeNull();
      expect(updated?.status).toBe("APPROVED");
      expect(updated?.auditTrail[0].action).toBe("Status updated to APPROVED");
      expect(updated?.auditTrail[0].actor).toBe("Compliance Director");
      expect(updated?.auditTrail[0].note).toContain("Zurich Committee");
    });
  });
});
