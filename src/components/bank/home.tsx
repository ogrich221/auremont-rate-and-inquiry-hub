import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Globe,
  Headphones,
  Wallet,
  Building2,
  HandCoins,
  CreditCard,
  ChartNoAxesCombined,
  Smartphone,
  Check,
  LockKeyhole,
  SlidersHorizontal,
  HeartHandshake,
  Quote,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { services } from "@/lib/bank";
import type { SiteData } from "@/lib/bank";
import { Emblem } from "@/components/bank/shell";
import headquarters from "@/assets/headquarters.asset.json";
import family from "@/assets/family.asset.json";
const icons = {
  personal: Wallet,
  business: Building2,
  loans: HandCoins,
  cards: CreditCard,
  wealth: ChartNoAxesCombined,
  digital: Smartphone,
};
export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
export function RateCards({ rates }: Pick<SiteData, "rates">) {
  return (
    <div className="rate-grid">
      {rates.map((r, i) => {
        const Icon = [Wallet, ChartNoAxesCombined, HandCoins, CreditCard][i] ?? Wallet;
        return (
          <article className="rate-card" key={r.title}>
            <div className="rate-card-top">
              <span className="icon-tile">
                <Icon size={22} />
              </span>
              <span className="demo-tag">ILLUSTRATIVE</span>
            </div>
            <h3>{r.title}</h3>
            <div className="rate-number">
              {r.value}
              <span>{r.unit}</span>
            </div>
            <p>{r.description}</p>
            <span className="rate-term">{r.term ?? "Illustrative rate · Terms not approved"}</span>
            <Link to={r.path} className="text-link">
              Learn More <ArrowUpRight size={16} />
            </Link>
          </article>
        );
      })}
    </div>
  );
}
export function ServiceGrid() {
  return (
    <div className="service-grid">
      {services.map((s) => {
        const Icon = icons[s.icon];
        return (
          <Link className="service-card" key={s.name} to={s.path}>
            <span className="service-icon">
              <Icon size={26} strokeWidth={1.4} />
            </span>
            <h3>{s.name}</h3>
            <p>{s.description}</p>
            <span className="service-arrow">
              <ArrowUpRight size={19} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
export function AboutSection() {
  return (
    <section className="section about-section">
      <div className="container about-grid">
        <div className="about-image">
          <img
            src={headquarters.url}
            alt="Illustrative modern glass headquarters at blue hour"
            loading="lazy"
          />
          <div className="image-caption">
            <Building2 size={17} />
            <span>
              A vision of modern banking<small>Illustrative architecture</small>
            </span>
          </div>
        </div>
        <div className="about-copy">
          <span className="eyebrow">THE AUREMONT APPROACH</span>
          <h2>
            Building Confidence
            <br />
            Through Better Banking.
          </h2>
          <p>
            At Auremont Trust Bank, we believe banking should be built around people, possibilities,
            and progress. Our approach focuses on accessible financial services, thoughtful customer
            experiences, and technology that makes managing money easier.
          </p>
          <div className="about-features">
            {[
              [
                HeartHandshake,
                "Customer Commitment",
                "Your goals at the heart of every conversation.",
              ],
              [ShieldCheck, "Financial Transparency", "Clear information. Thoughtful decisions."],
              [Smartphone, "Digital Innovation", "A simpler, more connected banking experience."],
            ].map(([Icon, title, text]) => {
              const I = Icon as typeof HeartHandshake;
              return (
                <div key={String(title)}>
                  <I size={23} />
                  <span>
                    <strong>{String(title)}</strong>
                    <small>{String(text)}</small>
                  </span>
                </div>
              );
            })}
          </div>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/about">
              About Our Institution <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
export function BankHeroShowcase() {
  const [rotated, setRotated] = useState(false);

  return (
    <div className="bank-hero-showcase">
      <div
        className="bank-hero-flipper"
        onMouseEnter={() => setRotated(true)}
        onMouseLeave={() => setRotated(false)}
        onClick={() => setRotated((prev) => !prev)}
        role="button"
        tabIndex={0}
        aria-label="Auremont Trust Bank interactive credentials - rotates 180 degrees"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setRotated((prev) => !prev);
          }
        }}
      >
        <div className={`bank-hero-card ${rotated ? "rotated-180" : ""}`}>
          {/* Front Face (0deg) */}
          <div className="bank-hero-face bank-hero-front">
            <div className="card-glass-glow" />
            <div className="card-top">
              <div className="card-brand">
                <Emblem />
                <div>
                  <strong>AUREMONT</strong>
                  <small>TRUST BANK</small>
                </div>
              </div>
              <div className="card-emblem-badge">
                <ShieldCheck className="h-4 w-4" />
                <span>Tier-1 Reserve</span>
              </div>
            </div>

            <div className="card-mid">
              <div className="card-chip">
                <span className="chip-cell" />
                <span className="chip-cell" />
                <span className="chip-cell" />
              </div>
              <span className="card-tier-label">PREMIER INSTITUTIONAL CHARTER</span>
            </div>

            <div className="card-bottom">
              <div>
                <span className="card-label">INSTITUTIONAL MEMBER</span>
                <span className="card-value">Vault Clearance Authorized</span>
              </div>
              <div className="card-rotate-pill">
                <RotateCcw className="h-3 w-3" />
                <span>Rotate 180°</span>
              </div>
            </div>
          </div>

          {/* Back Face (180deg) */}
          <div className="bank-hero-face bank-hero-back">
            <div className="card-glass-glow" />
            <div className="card-magstripe" />
            <div className="card-back-body">
              <div className="card-back-specs">
                <div className="spec-item">
                  <span className="spec-label">REGULATORY CHARTER</span>
                  <span className="spec-val">No. 1894-ATB · Geneva / London</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">CORE CAPITAL RATIO</span>
                  <span className="spec-val">18.4% Tier-1 Solvency</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">AUTHENTICATION LEVEL</span>
                  <span className="spec-val">AAL2 Multi-Factor FIPS-140-3</span>
                </div>
                <div className="spec-item">
                  <span className="spec-label">DEPOSIT PROTECTION</span>
                  <span className="spec-val">Private Sovereign Clearing</span>
                </div>
              </div>

              <div className="card-back-footer">
                <div className="card-seal">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Auremont Verified Assurance</span>
                </div>
                <span className="card-degree-indicator">180° REVERSED PERSPECTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bank-hero-controls">
        <button
          type="button"
          onClick={() => setRotated((prev) => !prev)}
          className="hero-rotate-btn"
          aria-label="Rotate bank hero card 180 degrees"
        >
          <RotateCcw className={`h-3.5 w-3.5 transition-transform duration-700 ${rotated ? "rotate-180" : ""}`} />
          <span>{rotated ? "Rotated 180° (Click to Return)" : "Rotate Bank Hero 180°"}</span>
        </button>
        <span className="hero-rotate-sub">Hover or click to rotate 180 degrees</span>
      </div>
    </div>
  );
}

export function Home({ data }: { data: SiteData }) {
  return (
    <>
      <section className="hero">
        <img
          className="hero-image"
          src={headquarters.url}
          alt="Illustrative Auremont glass banking headquarters illuminated at dusk"
          fetchPriority="high"
        />
        <div className="hero-overlay" />
        <div className="container hero-content">
          <div className="hero-grid">
            <div className="hero-copy">
              <span className="hero-eyebrow">
                <span className="hero-emblem-rotate-180"><Emblem /></span> A HIGHER STANDARD OF BANKING
              </span>
              <p className="hero-brand-name">AUREMONT TRUST BANK</p>
              <h1>
                Banking That Moves
                <br />
                You <em>Forward.</em>
              </h1>
              <p className="hero-description">
                Experience a smarter approach to banking with secure digital solutions, personalized
                financial services, and the freedom to manage your money wherever life takes you.
              </p>
              <div className="hero-actions">
                <Button size="lg" asChild>
                  <Link to="/open-account">
                    Open an Account <ArrowUpRight />
                  </Link>
                </Button>
                <Button variant="hero" size="lg" asChild>
                  <Link to="/login">
                    Access Online Banking <ArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="hero-assurances">
                <span>
                  <ShieldCheck />
                  Security-minded by design
                </span>
                <span>
                  <Globe />
                  Banking beyond boundaries
                </span>
              </div>
            </div>

            <div className="hero-showcase-column">
              <BankHeroShowcase />
            </div>
          </div>
        </div>
        <div className="hero-bottom">
          <div className="container">
            <span>Your Wealth. Your Future. Our Commitment.</span>
            <span>PERSONAL · BUSINESS · WEALTH</span>
          </div>
        </div>
      </section>
      <section className="stats-section">
        <div className="container stats-grid">
          {data.stats.map((s, i) => {
            const Icon = [HeartHandshake, Globe, Building2, Headphones][i] ?? Globe;
            return (
              <div key={s.label} className="stat">
                <Icon size={25} strokeWidth={1.3} />
                <div>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        <span className="stats-note">
          Demonstration service information. Operational availability is not verified.
        </span>
      </section>
      <section className="section rates-section">
        <div className="container">
          <SectionTitle
            eyebrow="A SMARTER WAY TO MOVE AHEAD"
            title="Financial Solutions Designed Around You."
            description="Explore possibilities for today. Build confidence for tomorrow."
          />
          <RateCards rates={data.rates} />
          <p className="section-note">
            All rates are demonstration values, not bank offers. APY: Annual Percentage Yield. APR:
            Annual Percentage Rate.
          </p>
        </div>
      </section>
      <section className="section services-section">
        <div className="container">
          <div className="heading-row">
            <SectionTitle
              eyebrow="BANKING, WITH YOU IN MIND"
              title="Everything You Need. All in One Place."
            />
            <span className="section-side-copy">
              For everyday moments.
              <br />
              For extraordinary ambitions.
            </span>
          </div>
          <ServiceGrid />
        </div>
      </section>
      <section className="journey-banner">
        <img
          src={family.url}
          alt="Illustrative family enjoying time together outside their home"
          loading="lazy"
        />
        <div className="journey-overlay" />
        <div className="container journey-content">
          <span className="hero-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>
            Your Financial Journey
            <br />
            Deserves a Better Beginning.
          </h2>
          <p>
            Discover banking solutions designed to support your goals, simplify your finances, and
            help you plan confidently for tomorrow.
          </p>
          <Button size="lg" asChild>
            <Link to="/personal-banking">
              Explore Banking Solutions <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
      <AboutSection />
      <section className="section benefits-section">
        <div className="container">
          <SectionTitle
            eyebrow="THE DIFFERENCE IS IN THE DETAILS"
            title="Built Around What Matters to You."
          />
          <div className="benefit-grid">
            {[
              [LockKeyhole, "Secure Banking Experience"],
              [Smartphone, "Convenient Digital Access"],
              [Headphones, "Personalized Customer Support"],
              [ShieldCheck, "Transparent Banking Information"],
              [SlidersHorizontal, "Flexible Financial Solutions"],
              [Wallet, "Modern Account Management"],
            ].map(([Icon, title]) => {
              const I = Icon as typeof Wallet;
              return (
                <div key={String(title)}>
                  <I size={25} strokeWidth={1.4} />
                  <h3>{String(title)}</h3>
                  <Check size={14} />
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="section testimonials">
        <div className="container">
          <SectionTitle
            eyebrow="PEOPLE. POSSIBILITIES. PROGRESS."
            title="Trusted Service. Meaningful Relationships."
          />
          <div className="testimonial-grid">
            {[
              [
                "EL",
                "Emma Lawson",
                "Personal banking",
                "A banking experience that feels considered, from the everyday details to the bigger picture.",
              ],
              [
                "JW",
                "James Walker",
                "Business banking",
                "It’s reassuring to have a clear view of the possibilities as your business moves forward.",
              ],
              [
                "SO",
                "Sofia Owen",
                "Digital banking",
                "The simplicity of managing everything in one place makes room for the things that matter.",
              ],
            ].map(([initials, name, category, text]) => (
              <article key={name} className="testimonial">
                <Quote size={26} />
                <p>“{text}”</p>
                <div className="review-person">
                  <span className="avatar">{initials}</span>
                  <span>
                    <strong>{name}</strong>
                    <small>{category}</small>
                  </span>
                </div>
                <span className="review-demo">
                  Demonstration testimonial · Not a verified review
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="support-band">
        <div className="container">
          <span className="support-icon">
            <Headphones size={34} strokeWidth={1.4} />
          </span>
          <div>
            <span className="eyebrow">LET’S TALK ABOUT WHAT’S NEXT</span>
            <h2>A little guidance. A world of possibility.</h2>
            <p>Questions about your next step? Start a conversation with us.</p>
          </div>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/contact">
              Contact Us <ArrowUpRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
