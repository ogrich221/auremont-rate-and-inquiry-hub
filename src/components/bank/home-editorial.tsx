import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { services } from "@/lib/bank";
import type { SiteData } from "@/lib/bank";
import { Emblem } from "@/components/bank/shell";
import headquarters from "@/assets/headquarters.asset.json";
import family from "@/assets/family.asset.json";

const numerals = ["I", "II", "III", "IV", "V", "VI"];

export function EditorialHome({ data }: { data: SiteData }) {
  const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="ed">
      <header className="ed-masthead ed-wrap">
        <div className="ed-meta">
          <span>Vol. I — Demonstration Edition</span>
          <span suppressHydrationWarning>{today}</span>
          <span>Personal · Business · Wealth</span>
        </div>
        <div className="ed-title">
          <span className="ed-emblem"><Emblem /></span>
          <p>The Auremont Ledger</p>
        </div>
        <div className="ed-rule-double" />
      </header>

      <section className="ed-wrap ed-lead">
        <h1>
          Wealth is <em>quiet.</em>
          <br />
          Banking should be <span>too.</span>
        </h1>
        <div className="ed-lead-grid">
          <figure className="ed-figure">
            <img src={headquarters.url} alt="Illustrative Auremont headquarters at dusk" fetchPriority="high" />
            <figcaption>Fig. 1 — An illustrative view of the house of Auremont.</figcaption>
          </figure>
          <div className="ed-columns">
            <p className="ed-dropcap">
              Auremont Trust Bank is a demonstration of what considered banking can feel like: unhurried,
              precise and personal. Every page is written for the person reading it, not the product being sold.
            </p>
            <p>
              From everyday accounts to long-horizon planning, the services below are presented as an index rather
              than an advertisement. Read at your own pace; nothing here is an offer.
            </p>
            <div className="ed-actions">
              <Link to="/open-account" className="ed-btn ed-btn-solid">
                Begin an application <ArrowUpRight size={16} />
              </Link>
              <Link to="/login" className="ed-btn">
                Sign in <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="ed-wrap ed-section">
        <div className="ed-section-head">
          <span>§ 1</span>
          <h2>Index of Services</h2>
        </div>
        <ol className="ed-index">
          {services.map((s, i) => (
            <li key={s.path}>
              <Link to={s.path}>
                <span className="ed-num">{numerals[i]}</span>
                <span className="ed-name">{s.name}</span>
                <span className="ed-desc">{s.description}</span>
                <ArrowUpRight className="ed-arrow" size={22} />
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="ed-dark">
        <div className="ed-wrap ed-section">
          <div className="ed-section-head">
            <span>§ 2</span>
            <h2>The Rate Ledger</h2>
          </div>
          <div className="ed-ledger">
            {data.rates.map((r) => (
              <Link to={r.path} key={r.title} className="ed-ledger-row">
                <span className="ed-ledger-title">{r.title}</span>
                <span className="ed-leader" aria-hidden="true" />
                <span className="ed-ledger-value">
                  {r.value}
                  <small>{r.unit}</small>
                </span>
              </Link>
            ))}
          </div>
          <p className="ed-fine">
            Illustrative figures only — not bank offers, and terms are not approved. APY: Annual Percentage Yield.
            APR: Annual Percentage Rate.
          </p>
        </div>
      </section>

      <section className="ed-wrap ed-section ed-figures">
        {data.stats.map((s, i) => (
          <div key={s.label}>
            <span className="ed-num">{numerals[i]}</span>
            <strong>{s.value}</strong>
            <span>{s.label}</span>
          </div>
        ))}
        <p className="ed-fine ed-span">Demonstration service information. Operational availability is not verified.</p>
      </section>

      <section className="ed-wrap ed-section ed-feature">
        <img src={family.url} alt="Illustrative family outside their home" loading="lazy" />
        <blockquote>
          <p>“Your wealth. Your future. Our commitment.”</p>
          <cite>— The Auremont principle</cite>
          <Link to="/about" className="ed-btn">
            Read about the house <ArrowRight size={16} />
          </Link>
        </blockquote>
      </section>

      <footer className="ed-wrap ed-colophon">
        <div className="ed-rule-double" />
        <div>
          <p>Correspondence is welcome.</p>
          <Link to="/contact" className="ed-btn ed-btn-solid">
            Write to us <ArrowUpRight size={16} />
          </Link>
        </div>
        <span>Demonstration website. No real banking accounts, deposits or transfers.</span>
      </footer>
    </div>
  );
}
