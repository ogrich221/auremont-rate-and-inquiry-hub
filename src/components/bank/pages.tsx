import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Check, ShieldCheck, Mail, Phone, Clock, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { contactSchema } from "@/lib/bank";
import { submitContact } from "@/lib/bank.functions";
import { AboutSection, ServiceGrid, SectionTitle } from "./home";
export function PageBanner({
  title,
  description,
  eyebrow = "AUREMONT TRUST BANK",
}: {
  title: string;
  description: string;
  eyebrow?: string;
}) {
  return (
    <section className="page-banner">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>{title}</span>
        </div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
export const productContent = {
  personal: {
    title: "Personal Banking",
    headline: "Your life. Your plans. Your banking.",
    description:
      "A thoughtful approach to everyday finances, with room for everything you’re working toward.",
    features: [
      "Everyday checking and account information",
      "Savings goals and financial planning",
      "Convenient digital account management",
      "Clear information about fees and eligibility",
    ],
    product: "Banking for your everyday",
    detail:
      "Explore premier checking and savings solutions tailored to your financial goals with competitive yields, 24/7 dedicated support, and frictionless global access.",
  },
  business: {
    title: "Business Banking",
    headline: "A foundation for your next ambition.",
    description:
      "Bring clarity to your business finances, so you can focus on the possibilities ahead.",
    features: [
      "Business checking and savings information",
      "Payment and cash-flow solution overviews",
      "Tools for financial organization",
      "Support for your business journey",
    ],
    product: "A partner in your progress",
    detail:
      "Discover a considered approach to commercial treasury, business checking, and seamless corporate payment solutions designed for expanding enterprises.",
  },
  loans: {
    title: "Loans & Credit",
    headline: "For the milestones that matter.",
    description:
      "Explore financing possibilities with clear information and a long-term perspective.",
    features: [
      "Personal financing information",
      "Competitive borrowing rates",
      "Guidance on lending eligibility",
      "Transparent terms before any commitment",
    ],
    product: "A clearer way forward",
    detail:
      "Personal and commercial lending solutions structured with clear terms, competitive rates, and flexible repayment horizons tailored to your milestones.",
  },
  cards: {
    title: "Debit & Credit Cards",
    headline: "More possibility. Less complexity.",
    description:
      "Explore modern payment experiences and card options designed for everyday flexibility.",
    features: [
      "Debit and credit card service information",
      "Digital payment possibilities",
      "Clear rate and fee disclosures",
      "Security and fraud-prevention guidance",
    ],
    product: "A world in your pocket",
    detail:
      "Elite debit and credit cards offering exclusive travel privileges, enhanced fraud protection, contactless payments, and seamless digital wallet integration.",
  },
  wealth: {
    title: "Wealth Management",
    headline: "A thoughtful view of your tomorrow.",
    description:
      "Start with what matters to you. Explore financial planning with a considered long-term perspective.",
    features: [
      "Financial goal-setting information",
      "Long-term planning resources",
      "Investment education",
      "Transparent risk information",
    ],
    product: "Plan with perspective",
    detail:
      "Tailored private wealth management, asset allocation, and generational trust planning overseen by experienced fiduciary advisors.",
  },
  digital: {
    title: "Digital Banking",
    headline: "Wherever life takes you.",
    description: "A connected, intuitive approach to managing your banking experience.",
    features: [
      "Secure online and mobile banking",
      "Real-time comprehensive account overview",
      "Access across desktop and mobile",
      "Privacy-conscious account management",
    ],
    product: "Your banking, on your terms",
    detail:
      "Experience our state-of-the-art online banking portal. Manage accounts, initiate international wire transfers, and review portfolios anywhere in the world.",
  },
} as const;
export function ProductPage({ kind }: { kind: keyof typeof productContent }) {
  const p = productContent[kind];
  return (
    <>
      <PageBanner title={p.title} description={p.description} />
      <section className="section">
        <div className="container content-grid">
          <div>
            <span className="eyebrow">BUILT AROUND YOU</span>
            <h2>{p.headline}</h2>
            <p>{p.description}</p>
            <ul className="feature-list">
              {p.features.map((f) => (
                <li key={f}>
                  <Check />
                  {f}
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="lg" asChild>
              <Link to="/contact">
                Start a Conversation <ArrowUpRight />
              </Link>
            </Button>
          </div>
          <div className="product-panel">
            <span className="eyebrow">EXPLORE THE POSSIBILITIES</span>
            <h3>{p.product}</h3>
            <p>{p.detail}</p>
            <div className="notice">
              <ShieldCheck size={18} /> Bank with confidence. Industry-standard encryption and institutional safeguards protect your assets.
            </div>
            <Button asChild>
              <Link to="/open-account">
                Open an Account <ArrowUpRight />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section className="section services-section">
        <div className="container">
          <SectionTitle eyebrow="YOUR FINANCIAL WORLD" title="Explore More With Auremont." />
          <ServiceGrid />
        </div>
      </section>
    </>
  );
}
export function AboutPage() {
  return (
    <>
      <PageBanner
        title="About Auremont Trust Bank"
        description="People, possibilities and progress. A vision for more thoughtful international banking."
      />
      <AboutSection />
      <section className="section benefits-section">
        <div className="container">
          <SectionTitle
            eyebrow="OUR COMMITMENT"
            title="Your Wealth. Your Future. Our Commitment."
            description="We put clarity, care and a connected experience at the center of our vision."
          />
          <p className="notice">
            Auremont Trust Bank was founded on the enduring principle that sophisticated banking should be transparent, personal, and uncompromisingly secure for every client we serve.
          </p>
        </div>
      </section>
    </>
  );
}
export const faqs = [
  [
    "How do I open an account with Auremont Trust Bank?",
    "You can open an account online by selecting 'Open an Account' and submitting your onboarding details. Our client onboarding desk reviews and activates profiles promptly.",
  ],
  [
    "What tiers of banking services do you offer?",
    "We provide bespoke Personal Premier Checking, High-Yield Savings, Commercial Treasury Solutions, and Private Wealth Management.",
  ],
  [
    "Are interest rates subject to change?",
    "Rates published on our website reflect current standard offerings and are subject to market adjustments and specific account tier qualifications.",
  ],
  [
    "How can I contact my relationship manager or customer support?",
    "Our client support team and private banking relationship managers can be reached via our 24/7 inquiry portal, direct telephone, or secure in-portal messaging.",
  ],
  [
    "How does Auremont safeguard my account and financial data?",
    "We implement bank-grade 256-bit encryption, mandatory multi-factor authentication (MFA), 6-digit security PIN gates, and continuous automated fraud monitoring.",
  ],
];
export function FAQPage() {
  return (
    <>
      <PageBanner
        title="Frequently Asked Questions"
        description="Clear answers. Greater confidence."
      />
      <section className="section">
        <div className="container legal-content faq-list">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
          <div className="notice">
            Need more information? <Link to="/contact">Send an inquiry →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
export function ContactPage({
  contacts,
}: {
  contacts: { email: string; phone: string; hours: string };
}) {
  const send = useServerFn(submitContact);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const valid = contactSchema.safeParse(data);
    if (!valid.success) {
      setError(valid.error.issues[0]?.message ?? "Please check your information.");
      return;
    }
    setBusy(true);
    try {
      await send({ data: valid.data });
      setSent(true);
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Your message could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageBanner
        title="Let’s Start a Conversation."
        description="A little guidance can make a meaningful difference. We’re here for your next step."
        eyebrow="CONTACT AUREMONT"
      />
      <section className="section">
        <div className="container content-grid">
          <div>
            <span className="eyebrow">HERE FOR WHAT’S NEXT</span>
            <h2>How can we help?</h2>
            <p>
              Send an inquiry to our client services and private banking advisory team. We look forward to assisting you.
            </p>
            <div className="contact-info">
              <div>
                <Mail size={20} />
                <strong>Support email</strong>
                <small>{contacts.email || "client-services@auremontbank.com"}</small>
              </div>
              <div>
                <Phone size={20} />
                <strong>Telephone</strong>
                <small>{contacts.phone || "+1 (800) 287-3666"}</small>
              </div>
              <div>
                <Clock size={20} />
                <strong>Business hours</strong>
                <small>{contacts.hours || "Monday – Friday, 8:00 AM – 6:00 PM EST"}</small>
              </div>
            </div>
            <div className="notice">
              For information on protecting your details, visit our{" "}
              <Link to="/security">Security Centre →</Link>
            </div>
          </div>
          <div className="product-panel">
            <h3>Send an inquiry</h3>
            <form onSubmit={submit}>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="contact-name">Your name</label>
                  <input
                    id="contact-name"
                    name="name"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </div>
                <div className="field">
                  <label htmlFor="contact-email">Email address</label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    maxLength={255}
                    autoComplete="email"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="contact-topic">How can we help?</label>
                <select id="contact-topic" name="topic">
                  {[
                    "General inquiry",
                    "Personal banking",
                    "Business banking",
                    "Security concern",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="contact-message">Your message</label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                />
              </div>
              <div className="sr-trap" aria-hidden="true">
                <label>
                  Website
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? <LoaderCircle className="animate-spin" /> : <ArrowUpRight />}
                {busy ? "Sending…" : "Send Inquiry"}
              </Button>
              {error && (
                <p role="alert" className="form-error">
                  {error}
                </p>
              )}
              {sent && (
                <p role="status" className="form-message">
                  Your inquiry has been saved in the private website inbox. No email notification is
                  sent at this time.
                </p>
              )}
            </form>
          </div>
        </div>
      </section>
      <section className="section services-section">
        <div className="container legal-content">
          <SectionTitle eyebrow="A LITTLE MORE CLARITY" title="Frequently Asked Questions" />
          <div className="faq-list">
            {faqs.slice(0, 4).map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
const legalPages = {
  privacy: {
    title: "Privacy Policy",
    description: "Transparency about how your personal and financial information is safeguarded.",
    sections: [
      [
        "Commitment to Privacy",
        "Auremont Trust Bank is dedicated to protecting client confidentiality and personal financial data in strict adherence with global banking privacy standards.",
      ],
      [
        "Information We Collect",
        "We collect identifying information, contact channels, and transaction history required to deliver secure banking services and fulfill compliance mandates.",
      ],
      [
        "How Information Is Used",
        "Your data is utilized exclusively to maintain your accounts, authenticate access, prevent unauthorized transactions, and provide personalized wealth management services.",
      ],
      [
        "Information Security and Rights",
        "Access to client records is restricted to authorized personnel. You may request copies of your personal data or update your preferences at any time through our client desk.",
      ],
    ],
  },
  terms: {
    title: "Terms & Conditions",
    description: "Standard terms of service and client relationship guidelines.",
    sections: [
      [
        "Governing Agreement",
        "These terms govern the use of Auremont Trust Bank's online banking services, digital applications, and advisory facilities.",
      ],
      [
        "Account Operations",
        "Clients agree to provide accurate registration details and maintain the security of credentials used to access Auremont banking platforms.",
      ],
      [
        "Rates and Market Information",
        "Published interest rates, fee schedules, and product terms represent prevailing offerings and are subject to market conditions and regulatory disclosures.",
      ],
      [
        "Security Responsibilities",
        "Clients are responsible for maintaining confidentiality of PINs, passwords, and security tokens. Immediately notify Auremont of any suspected compromise.",
      ],
    ],
  },
  security: {
    title: "Security Centre",
    description: "Confidence starts with protecting what matters most.",
    sections: [
      [
        "Protect your credentials",
        "Always maintain strict confidentiality over your banking passwords, 6-digit security PIN, and one-time verification codes. Auremont will never ask for your PIN.",
      ],
      [
        "Recognize suspicious requests",
        "Beware of phishing communications or unsolicited messages requesting urgent transfers or credentials. Auremont communications always direct you to secure portals.",
      ],
      [
        "Multi-Layered Security",
        "Our infrastructure utilizes AES-256 encryption, biometrics, multi-factor authentication, and continuous algorithmic fraud detection to protect every transaction.",
      ],
      [
        "Report a concern",
        "If you notice irregular activity or have security questions, report it immediately to our fraud prevention team through the contact center.",
      ],
    ],
  },
  cookies: {
    title: "Cookie Policy",
    description: "A transparent overview of how cookies and session storage protect your experience.",
    sections: [
      [
        "Essential website storage",
        "We use secure encrypted session cookies to authenticate your account and ensure your transactions remain uninterrupted.",
      ],
      [
        "Client Privacy First",
        "Auremont does not sell your browsing data or deploy third-party advertising trackers. All analytics are strictly anonymized for site security and reliability.",
      ],
      [
        "Manage your session",
        "You can manage cookie preferences or clear active sessions at any time. Terminating your session immediately removes authenticated browser access.",
      ],
    ],
  },
  disclosures: {
    title: "Important Disclosures",
    description: "Financial integrity and regulatory transparency.",
    sections: [
      [
        "Banking Services & Oversight",
        "Auremont Trust Bank provides personal banking, business treasury services, and private wealth management subject to applicable banking regulations and audit standards.",
      ],
      [
        "Deposit and Lending Disclosures",
        "All APY and APR figures are presented in compliance with federal disclosure standards. Lending products are subject to underwriting criteria and credit verification.",
      ],
      [
        "Wealth Management & Risk",
        "Investment products and wealth advisory services are subject to market volatility. Past performance does not guarantee future results.",
      ],
      [
        "Client Rights & Disclosures",
        "Account terms, fee schedules, and privacy notices are provided upon account activation and remain available through the digital banking portal.",
      ],
    ],
  },
  careers: {
    title: "Careers at Auremont",
    description: "Join a team dedicated to excellence, innovation, and client trust.",
    sections: [
      [
        "Opportunities at Auremont",
        "We are continually seeking exceptional professionals across private wealth management, software engineering, compliance, and client advisory.",
      ],
      [
        "Connect with Talent Acquisition",
        "Explore career pathways and submit your professional CV or inquiry directly through our contact portal.",
      ],
    ],
  },
} as const;
export function LegalPage({ kind }: { kind: keyof typeof legalPages }) {
  const p = legalPages[kind];
  return (
    <>
      <PageBanner title={p.title} description={p.description} />
      <section className="section">
        <div className="container legal-content">
          {p.sections.map(([h, t]) => (
            <section key={h}>
              <h2>{h}</h2>
              <p>{t}</p>
            </section>
          ))}
          <Button variant="secondary" asChild>
            <Link to="/contact">
              Contact Us <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
