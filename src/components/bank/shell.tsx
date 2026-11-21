import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ArrowUpRight, ShieldCheck, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { navigation } from "@/lib/bank";
export function Emblem() {
  return (
    <svg className="emblem" viewBox="0 0 44 50" fill="none" aria-hidden="true">
      <path
        d="M22 2 40 9v17c0 10-10 17-18 22C14 43 4 36 4 26V9L22 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path d="m11 33 11-23 11 23M16 25h12M12 35h20" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
export function Brand() {
  return (
    <Link to="/" className="brand">
      <Emblem />
      <span>
        AUREMONT<small>TRUST BANK</small>
      </span>
    </Link>
  );
}
export function Header() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <header className="site-header">
      <div className="utility-bar">
        <div className="container utility-inner">
          <span>
            <ShieldCheck size={12} /> Demonstration website · No real banking services
          </span>
          <span className="utility-right">
            <Link to="/security">Security Centre</Link>
            <span className="utility-divider" />
            <Globe size={12} /> International Banking
          </span>
        </div>
      </div>
      <div className="container nav-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Main navigation">
          {navigation.map(([name, to]) => (
            <Link key={to} to={to} className={path === to ? "active" : ""}>
              {name}
            </Link>
          ))}
        </nav>
        <div className="nav-actions">
          <Button variant="nav" asChild>
            <Link to="/login">
              Login <ChevronRight size={14} />
            </Link>
          </Button>
          <Button asChild className="account-nav">
            <Link to="/open-account">
              Open an Account <ArrowUpRight />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="mobile-toggle"
            aria-label={open ? "Close navigation" : "Open navigation"}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          {navigation.map(([name, to]) => (
            <Link key={to} to={to} onClick={() => setOpen(false)}>
              {name}
              <ChevronRight size={16} />
            </Link>
          ))}
          <Button asChild>
            <Link to="/open-account" onClick={() => setOpen(false)}>
              Open an Account
            </Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
const footerGroups = [
  {
    name: "Our Institution",
    links: [
      ["About Us", "/about"],
      ["Our Approach", "/about"],
      ["Careers", "/careers"],
      ["Contact", "/contact"],
    ],
  },
  {
    name: "Banking",
    links: [
      ["Personal Banking", "/personal-banking"],
      ["Business Banking", "/business-banking"],
      ["Loans & Credit", "/loans"],
      ["Cards", "/cards"],
    ],
  },
  {
    name: "Customer Services",
    links: [
      ["Online Banking", "/login"],
      ["Help Centre", "/contact"],
      ["FAQs", "/faq"],
      ["Security Centre", "/security"],
    ],
  },
  {
    name: "Legal",
    links: [
      ["Privacy Policy", "/privacy"],
      ["Terms & Conditions", "/terms"],
      ["Cookie Policy", "/cookies"],
      ["Disclosures", "/disclosures"],
    ],
  },
] as const;
export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Brand />
            <p>
              Your Wealth. Your Future.
              <br />
              Our Commitment.
            </p>
            <span className="footer-label">A considered approach to banking.</span>
          </div>
          {footerGroups.map((g) => (
            <div key={g.name}>
              <h3>{g.name}</h3>
              {g.links.map(([n, p]) => (
                <Link key={n} to={p}>
                  {n}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Auremont Trust Bank. All rights reserved.</span>
          <Link to="/disclosures">Demonstration environment</Link>
          <Link to="/admin">
            Administration <ArrowUpRight size={12} />
          </Link>
        </div>
        <p className="footer-disclosure">
          Auremont is a demonstration project, not a licensed banking service. Rates, testimonials,
          imagery and account information are illustrative. No deposits, transfers or credit
          applications are accepted. No deposit-insurance or regulatory status is claimed.
        </p>
      </div>
    </footer>
  );
}
