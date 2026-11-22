import React, { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  ArrowRight,
  Clock,
  Bookmark,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Emblem } from "@/components/bank/shell";
import headquarters from "@/assets/headquarters.asset.json";
import {
  type ApplicationFormData,
  type StepNumber,
  isSequentialOrRepetitivePin,
  evaluatePasswordStrength,
} from "./types";
import { StepOnePersonal } from "./StepOnePersonal";
import { StepTwoContact } from "./StepTwoContact";
import { StepThreePreferences } from "./StepThreePreferences";
import { StepFourSecurity } from "./StepFourSecurity";
import { StepFiveIdentity } from "./StepFiveIdentity";
import { StepSixReview } from "./StepSixReview";
import { RegistrationSuccess } from "./RegistrationSuccess";
import { StatusTrackerModal } from "./StatusTrackerModal";
import { SaveResumeModal } from "./SaveResumeModal";
import { submitApplicationFn } from "@/lib/application.functions";

const initialFormData: ApplicationFormData = {
  // Step 1
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: "",
  gender: "",
  nationality: "United Kingdom",
  countryOfResidence: "United Kingdom",
  residentialAddress: "",
  city: "",
  stateProvince: "",
  postalCode: "",

  // Step 2
  email: "",
  confirmEmail: "",
  countryCallingCode: "+44",
  mobilePhone: "",
  alternativePhone: "",
  preferredContactMethod: "Email",
  emailVerified: false,
  phoneVerified: false,

  // Step 3
  preferredAccountType: "personal_checking",
  preferredCurrency: "USD",
  employmentStatus: "Employed",
  occupation: "",
  sourceOfFunds: "Employment Income",
  expectedActivity: "$10,000 – $50,000 / month",

  // Step 4
  password: "",
  confirmPassword: "",
  securityQuestions: [
    { question: "What was the name of your first school?", answer: "" },
    { question: "What city were you born in?", answer: "" },
    { question: "What was the name of your first pet?", answer: "" },
  ],
  transferPin: "",
  confirmTransferPin: "",

  // Step 5
  documentType: "passport",
  documentNumber: "",
  issuingCountry: "United Kingdom",
  documentExpiryDate: "",
  documentFrontUploaded: false,
  documentFrontFilename: "",
  documentBackUploaded: false,
  documentBackFilename: "",
  proofOfAddressUploaded: false,
  proofOfAddressFilename: "",

  // Step 6
  acceptedTerms: false,
  acknowledgedPrivacy: false,
  consentedIdentityCheck: false,
  marketingConsent: false,
};

export function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1);
  const [formData, setFormData] = useState<ApplicationFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Modals & Tracker state
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);
  const [submittedTimestamp, setSubmittedTimestamp] = useState<string>("");
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [trackerInitialRef, setTrackerInitialRef] = useState("");
  const [saveResumeOpen, setSaveResumeOpen] = useState(false);

  // Session timer simulation (15 minutes countdown)
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);

  const submitFn = useServerFn(submitApplicationFn);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatSessionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const updateFormData = (fields: Partial<ApplicationFormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
    // Clear relevant errors
    const cleared = { ...errors };
    Object.keys(fields).forEach((key) => delete cleared[key]);
    setErrors(cleared);
  };

  // Step Validation Logic
  const validateStep = (step: StepNumber): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors["firstName"] = "First name is required.";
      if (!formData.lastName.trim()) newErrors["lastName"] = "Last name is required.";
      if (!formData.dateOfBirth) {
        newErrors["dateOfBirth"] = "Date of birth is required.";
      } else {
        const birthDate = new Date(formData.dateOfBirth);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (age < 18) {
          newErrors["dateOfBirth"] = "Applicant must be at least 18 years of age.";
        }
      }
      if (!formData.nationality) newErrors["nationality"] = "Nationality is required.";
      if (!formData.countryOfResidence) newErrors["countryOfResidence"] = "Residence country is required.";
      if (!formData.residentialAddress.trim()) newErrors["residentialAddress"] = "Address is required.";
      if (!formData.city.trim()) newErrors["city"] = "City is required.";
      if (!formData.stateProvince.trim()) newErrors["stateProvince"] = "State or province is required.";
      if (!formData.postalCode.trim()) newErrors["postalCode"] = "Postal code is required.";
    }

    if (step === 2) {
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors["email"] = "A valid email address is required.";
      }
      if (formData.email !== formData.confirmEmail) {
        newErrors["confirmEmail"] = "Email addresses do not match.";
      }
      if (!formData.mobilePhone.trim() || formData.mobilePhone.replace(/\D/g, "").length < 6) {
        newErrors["mobilePhone"] = "A valid mobile telephone number is required.";
      }
      if (!formData.emailVerified) {
        newErrors["email"] = "Please verify your email address to continue.";
      }
      if (!formData.phoneVerified) {
        newErrors["mobilePhone"] = "Please verify your mobile number via OTP to continue.";
      }
    }

    if (step === 3) {
      if (!formData.occupation.trim()) newErrors["occupation"] = "Occupation is required.";
      if (!formData.preferredCurrency) newErrors["preferredCurrency"] = "Currency is required.";
    }

    if (step === 4) {
      const strength = evaluatePasswordStrength(formData.password);
      if (strength.score < 3 || formData.password.length < 12) {
        newErrors["password"] =
          "Password must be at least 12 characters and contain uppercase, lowercase, numbers, and symbols.";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors["confirmPassword"] = "Passwords do not match.";
      }

      // Check unique security questions
      const questions = formData.securityQuestions.map((q) => q.question);
      const unique = new Set(questions);
      if (unique.size < 3) {
        newErrors["securityQuestions"] = "Please select 3 different security questions.";
      }
      if (formData.securityQuestions.some((q) => !q.answer.trim())) {
        newErrors["securityQuestions"] = "Answers must be entered for all 3 security questions.";
      }

      // PIN check
      const pinResult = isSequentialOrRepetitivePin(formData.transferPin);
      if (pinResult.invalid) {
        newErrors["transferPin"] = pinResult.reason || "Invalid 6-digit transaction PIN.";
      }
      if (formData.transferPin !== formData.confirmTransferPin) {
        newErrors["confirmTransferPin"] = "Transaction PINs do not match.";
      }
    }

    if (step === 5) {
      if (!formData.documentNumber.trim()) {
        newErrors["documentNumber"] = "Official document number is required.";
      }
      if (!formData.documentExpiryDate) {
        newErrors["documentExpiryDate"] = "Expiry date is required.";
      }
      if (!formData.documentFrontUploaded) {
        newErrors["documentFront"] = "Please upload the front scan of your identification.";
      }
      if (formData.documentType !== "passport" && !formData.documentBackUploaded) {
        newErrors["documentBack"] = "Please upload the back scan of your identification.";
      }
      if (!formData.proofOfAddressUploaded) {
        newErrors["proofOfAddress"] = "Please upload proof of residential address.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 6) {
        setCurrentStep((prev) => (prev + 1) as StepNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as StepNumber);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGoToStep = (step: StepNumber) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Submission
  const handleSubmitApplication = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4) || !validateStep(5)) {
      setSubmitError("Please ensure all previous sections are properly completed.");
      return;
    }

    if (!formData.acceptedTerms || !formData.acknowledgedPrivacy || !formData.consentedIdentityCheck) {
      setSubmitError("You must accept the Terms, Privacy Policy, and Identity Verification consent.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      // Salt & hash security answers client-side before sending
      const hashedQuestions = formData.securityQuestions.map((q) => ({
        question: q.question,
        answerHash: "SHA256_SALTED_" + btoa(q.answer.toLowerCase().trim()),
      }));

      const res = await submitFn({
        data: {
          firstName: formData.firstName,
          middleName: formData.middleName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          nationality: formData.nationality,
          countryOfResidence: formData.countryOfResidence,
          residentialAddress: formData.residentialAddress,
          city: formData.city,
          stateProvince: formData.stateProvince,
          postalCode: formData.postalCode,

          email: formData.email,
          confirmEmail: formData.confirmEmail,
          countryCallingCode: formData.countryCallingCode,
          mobilePhone: formData.mobilePhone,
          alternativePhone: formData.alternativePhone,
          preferredContactMethod: formData.preferredContactMethod,
          emailVerified: true,
          phoneVerified: true,

          preferredAccountType: formData.preferredAccountType,
          preferredCurrency: formData.preferredCurrency,
          employmentStatus: formData.employmentStatus,
          occupation: formData.occupation,
          sourceOfFunds: formData.sourceOfFunds,
          expectedActivity: formData.expectedActivity,

          passwordLength: formData.password.length,
          passwordStrengthLabel: evaluatePasswordStrength(formData.password).label,
          securityQuestions: hashedQuestions,
          transferPinMasked: "••••••",

          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          issuingCountry: formData.issuingCountry,
          documentExpiryDate: formData.documentExpiryDate,
          documentFrontFilename: formData.documentFrontFilename || "id_front_scan.pdf",
          documentBackFilename: formData.documentBackFilename || "id_back_scan.jpg",
          proofOfAddressFilename: formData.proofOfAddressFilename || "utility_proof.pdf",

          acceptedTerms: true,
          acknowledgedPrivacy: true,
          consentedIdentityCheck: true,
          marketingConsent: formData.marketingConsent,
        },
      });

      if (res?.success) {
        setSubmittedRef(res.referenceNumber);
        setSubmittedTimestamp(res.submittedAt);
        localStorage.removeItem("auremont_reg_draft");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Unable to submit your application. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const progressPercentage = Math.round((currentStep / 6) * 100);

  const stepLabels: Record<StepNumber, string> = {
    1: "Personal Information",
    2: "Contact Information",
    3: "Account Preferences",
    4: "Security Setup",
    5: "Identity Verification",
    6: "Review & Submit",
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="container flex items-center justify-between py-3.5 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="h-8 w-8 text-primary transition-transform group-hover:scale-105">
                <Emblem />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold tracking-widest text-foreground font-display">
                  AUREMONT
                </span>
                <span className="text-[9px] tracking-wider text-muted-foreground uppercase">
                  TRUST BANK
                </span>
              </div>
            </Link>

            <span className="hidden md:inline-block h-4 w-px bg-border mx-2" />

            <div className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span>256-Bit SSL / TLS Bank-Grade Encryption</span>
            </div>
          </div>

          {/* Right utility items */}
          <div className="flex items-center gap-3">
            {/* Session countdown */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-muted-foreground font-mono bg-muted/40 px-2.5 py-1 rounded border border-border/50">
              <Clock className="h-3.5 w-3.5 text-primary" />
              <span>Session: {formatSessionTime(secondsRemaining)}</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSaveResumeOpen(true)}
              className="text-xs gap-1.5 border-primary/30 hover:bg-primary/10 h-8 text-foreground"
            >
              <Bookmark className="h-3.5 w-3.5 text-primary" />
              <span className="hidden sm:inline">Save & Resume</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-xs text-muted-foreground hover:text-foreground h-8"
            >
              <Link to="/">
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                <span>Back to Home</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Dynamic Progress Indicator */}
        {!submittedRef && (
          <div className="w-full bg-border/40">
            <div className="container px-4 sm:px-8 py-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-primary">
                    Step {currentStep} of 6:
                  </span>
                  <span className="font-medium text-foreground">
                    {stepLabels[currentStep]}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                  <span>Est. completion: ~4-5 minutes</span>
                  <span className="font-semibold text-primary">{progressPercentage}%</span>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-1 bg-muted" />
            </div>
          </div>
        )}
      </header>

      {/* Main Experience Layout */}
      <main className="flex-1">
        {submittedRef ? (
          <div className="container py-10 px-4 sm:px-8">
            <RegistrationSuccess
              referenceNumber={submittedRef}
              submittedAt={submittedTimestamp}
              onOpenStatusTracker={(ref) => {
                setTrackerInitialRef(ref);
                setTrackerOpen(true);
              }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-115px)]">
            {/* Desktop Architectural Hero Left Column */}
            <div className="hidden lg:flex lg:col-span-4 relative flex-col justify-between p-10 overflow-hidden bg-secondary text-secondary-foreground border-r border-border/40">
              <img
                src={headquarters.url}
                alt="Auremont Institutional Architecture"
                className="absolute inset-0 h-full w-full object-cover opacity-25 mix-blend-luminosity filter contrast-125"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-secondary/90 via-secondary/75 to-secondary/95" />

              {/* Decorative Geometric Gold Line */}
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-primary/40 to-transparent" />

              <div className="relative z-10 space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  <Sparkles className="h-3 w-3" />
                  PREMIUM BANKING ONBOARDING
                </span>

                <h1 className="text-3xl xl:text-4xl font-serif font-medium leading-tight tracking-tight text-white">
                  Begin Your Banking Journey.
                </h1>

                <p className="text-xs text-secondary-foreground/80 leading-relaxed max-w-sm">
                  Experience a more confident way to manage your finances. Complete your secure account application in just a few simple steps.
                </p>
              </div>

              {/* Stepper Navigation List on Desktop */}
              <div className="relative z-10 space-y-3 my-8">
                {([1, 2, 3, 4, 5, 6] as StepNumber[]).map((step) => {
                  const isCurrent = currentStep === step;
                  const isCompleted = currentStep > step;
                  return (
                    <button
                      key={step}
                      type="button"
                      disabled={step > currentStep}
                      onClick={() => handleGoToStep(step)}
                      className={`w-full flex items-center gap-3 text-left p-2.5 rounded-lg transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-white/10 border border-primary/40 text-white font-medium shadow-sm"
                          : isCompleted
                            ? "text-secondary-foreground/80 hover:text-white"
                            : "opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold shrink-0 ${
                          isCompleted
                            ? "bg-primary text-primary-foreground font-bold"
                            : isCurrent
                              ? "border border-primary text-primary"
                              : "border border-white/20 text-white/50"
                        }`}
                      >
                        {isCompleted ? "✓" : step}
                      </span>
                      <span className="text-xs tracking-tight">{stepLabels[step]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Institutional Safety Seal */}
              <div className="relative z-10 pt-4 border-t border-white/10 text-[11px] text-secondary-foreground/70 space-y-2">
                <div className="flex items-center gap-2 text-white font-medium">
                  <Lock className="h-3.5 w-3.5 text-primary" />
                  <span>Institutional Assurance</span>
                </div>
                <p className="text-[10px] leading-relaxed">
                  Auremont Trust Bank employs hardware security modules and multi-tiered compliance infrastructure.
                </p>
              </div>
            </div>

            {/* Form Right Column */}
            <div className="lg:col-span-8 flex flex-col justify-between p-4 sm:p-8 xl:p-12 max-w-4xl mx-auto w-full">
              {/* Form Content Surface */}
              <div className="w-full">
                {currentStep === 1 && (
                  <StepOnePersonal
                    data={formData}
                    updateData={updateFormData}
                    errors={errors}
                  />
                )}
                {currentStep === 2 && (
                  <StepTwoContact
                    data={formData}
                    updateData={updateFormData}
                    errors={errors}
                  />
                )}
                {currentStep === 3 && (
                  <StepThreePreferences
                    data={formData}
                    updateData={updateFormData}
                    errors={errors}
                  />
                )}
                {currentStep === 4 && (
                  <StepFourSecurity
                    data={formData}
                    updateData={updateFormData}
                    errors={errors}
                  />
                )}
                {currentStep === 5 && (
                  <StepFiveIdentity
                    data={formData}
                    updateData={updateFormData}
                    errors={errors}
                  />
                )}
                {currentStep === 6 && (
                  <StepSixReview
                    data={formData}
                    updateData={updateFormData}
                    onGoToStep={handleGoToStep}
                    onSubmit={handleSubmitApplication}
                    submitting={submitting}
                    submitError={submitError}
                  />
                )}
              </div>

              {/* Bottom Step Controller Actions */}
              {currentStep < 6 && (
                <div className="mt-10 pt-6 border-t border-border/80 flex items-center justify-between gap-4">
                  <div>
                    {currentStep > 1 ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                        className="text-xs gap-1.5 h-10 px-5 text-foreground border-border"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Previous Step</span>
                      </Button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setSaveResumeOpen(true)}
                        className="text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
                      >
                        Resume existing application?
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="text-xs font-semibold bg-primary text-primary-foreground h-10 px-6 gap-2 shadow-sm hover:bg-primary/90"
                    >
                      <span>Continue to {stepLabels[(currentStep + 1) as StepNumber]}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Track Status Modal */}
      <StatusTrackerModal
        open={trackerOpen}
        onOpenChange={setTrackerOpen}
        initialReference={trackerInitialRef}
      />

      {/* Save & Resume Modal */}
      <SaveResumeModal
        open={saveResumeOpen}
        onOpenChange={setSaveResumeOpen}
        data={formData}
        currentStep={currentStep}
        onRestoreData={(saved, step) => {
          setFormData(saved);
          setCurrentStep(step as StepNumber);
        }}
      />
    </div>
  );
}
