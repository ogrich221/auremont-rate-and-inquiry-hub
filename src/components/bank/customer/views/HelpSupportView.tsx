import React, { useState } from "react";
import {
  HelpCircle,
  Phone,
  Mail,
  Clock,
  ShieldAlert,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  MessageSquare,
  Lock,
  Headphones,
  Paperclip,
  FileCheck,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";

interface FAQItem {
  id: string;
  category: "Transfers" | "Security" | "Accounts" | "Cards";
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "faq-1",
    category: "Transfers",
    question: "What are the processing cut-off times for Domestic Transfers?",
    answer:
      "Faster Payments domestic transfers are processed 24/7/365 and typically arrive in the recipient's account within minutes. CHAPS high-value transfers submitted before 15:30 GMT will settle on the same business day.",
  },
  {
    id: "faq-2",
    category: "Transfers",
    question: "How long do International Wire Transfers take to settle?",
    answer:
      "SWIFT wire transfers typically settle within 1 to 3 business days depending on the destination jurisdiction, intermediary clearing banks, and local time zones. Priority wires initiated before 14:00 GMT are dispatched to correspondent rails the same day.",
  },
  {
    id: "faq-3",
    category: "Security",
    question: "How does Auremont Trust Bank protect against unauthorized account activity?",
    answer:
      "All high-value payments require two-step cryptographic verification or hardware token confirmation. We continuously monitor transactions using adaptive machine learning fraud heuristics and adhere to strict PSD2 Strong Customer Authentication (SCA) standards.",
  },
  {
    id: "faq-4",
    category: "Security",
    question: "What should I do if I suspect fraud or have lost my card?",
    answer:
      "Contact our 24/7 Emergency Fraud Hotline immediately at +44 (0) 800 014 9900 or lock your credentials via the Security section in your Customer Profile. Our specialist fraud team is available around the clock.",
  },
  {
    id: "faq-5",
    category: "Accounts",
    question: "How can I request an adjustment to my daily transfer limits?",
    answer:
      "Premier Private Reserve clients may submit a secure limit modification request via this Help & Support portal or directly with their dedicated Senior Relationship Manager. Temporary surges can be arranged within 1 business hour.",
  },
  {
    id: "faq-6",
    category: "Cards",
    question: "Can I generate a virtual debit card for online transactions?",
    answer:
      "Yes. Auremont Trust Bank offers encrypted single-use and recurring virtual cards linked directly to your multi-currency accounts. Navigate to My Accounts to request or manage card credentials.",
  },
];

export function HelpSupportView() {
  const { tickets, submitSupportTicket } = useCustomerBanking();

  // Search & FAQ state
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedFaqCat, setSelectedFaqCat] = useState<string>("All");
  const [expandedFaq, setExpandedFaq] = useState<string | null>("faq-1");

  // Ticket Form state
  const [subject, setSubject] = useState("");
  const [department, setDepartment] = useState("Private Client Banking");
  const [priority, setPriority] = useState<"Standard" | "High" | "Urgent">("Standard");
  const [message, setMessage] = useState("");
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const filteredFaqs = FAQ_DATA.filter((item) => {
    if (selectedFaqCat !== "All" && item.category !== selectedFaqCat) return false;
    if (
      faqSearch &&
      !item.question.toLowerCase().includes(faqSearch.toLowerCase()) &&
      !item.answer.toLowerCase().includes(faqSearch.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const ref = submitSupportTicket({
        subject: subject.trim(),
        department,
        priority,
        message: message.trim(),
      });
      setIsSubmitting(false);
      setSubmittedRef(ref);
      setSubject("");
      setMessage("");
      setAttachmentName(null);
    }, 700);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-2xl md:text-3xl font-serif text-white tracking-wide">
          Help & Dedicated Client Concierge
        </h1>
        <p className="text-sm text-slate-300 mt-1">
          Access priority support, contact your relationship team, or submit an authenticated confidential inquiry.
        </p>
      </div>

      {/* Emergency Fraud Callout Banner */}
      <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-[#172C49]/60 to-[#101D32] p-5 sm:p-6 backdrop-blur-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/30 text-red-300 uppercase tracking-wider">
                  24/7 Priority Emergency
                </span>
                <h3 className="text-base font-semibold text-white">
                  Suspect Fraud or Compromised Account?
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                If you detect unauthorized withdrawals, suspect credential compromise, or have misplaced your private debit card, immediately contact our 24-hour rapid response team.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href="tel:+448000149900"
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs tracking-wider uppercase inline-flex items-center gap-2 shadow-lg shadow-red-900/30 transition-all"
            >
              <Phone className="w-4 h-4" />
              Call +44 800 014 9900
            </a>
          </div>
        </div>
      </div>

      {/* Contact Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Concierge Phone */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#172C49]/40 backdrop-blur-md hover:border-[#C6A66B]/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#C6A66B]/15 border border-[#C6A66B]/30 flex items-center justify-center mb-4">
            <Phone className="w-5 h-5 text-[#C6A66B]" />
          </div>
          <h3 className="text-sm font-semibold text-white">Premier Client Desk</h3>
          <p className="text-xs text-slate-300 mt-1">Direct telephone line for private banking clients.</p>
          <div className="mt-4 pt-3 border-t border-white/10 space-y-1">
            <div className="text-sm font-mono font-medium text-white">+44 (0) 20 7946 0990</div>
            <div className="text-xs text-slate-400">Intl: +44 20 7946 0995</div>
          </div>
        </div>

        {/* Card 2: Email Desk */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#172C49]/40 backdrop-blur-md hover:border-[#C6A66B]/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#C6A66B]/15 border border-[#C6A66B]/30 flex items-center justify-center mb-4">
            <Mail className="w-5 h-5 text-[#C6A66B]" />
          </div>
          <h3 className="text-sm font-semibold text-white">Private Client Office</h3>
          <p className="text-xs text-slate-300 mt-1">Encrypted institutional correspondence.</p>
          <div className="mt-4 pt-3 border-t border-white/10 space-y-1">
            <div className="text-xs font-mono font-medium text-white truncate">
              privateclient@auremont.co.uk
            </div>
            <div className="text-xs text-slate-400">PGP Key available on request</div>
          </div>
        </div>

        {/* Card 3: Operating Hours */}
        <div className="p-5 rounded-2xl border border-white/10 bg-[#172C49]/40 backdrop-blur-md hover:border-[#C6A66B]/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-[#C6A66B]/15 border border-[#C6A66B]/30 flex items-center justify-center mb-4">
            <Clock className="w-5 h-5 text-[#C6A66B]" />
          </div>
          <h3 className="text-sm font-semibold text-white">Operating Hours</h3>
          <p className="text-xs text-slate-300 mt-1">Dedicated team schedule (GMT).</p>
          <div className="mt-4 pt-3 border-t border-white/10 space-y-1 text-xs">
            <div className="flex justify-between text-slate-200">
              <span>Mon – Fri:</span>
              <span className="font-mono text-white">07:00 – 21:00 GMT</span>
            </div>
            <div className="flex justify-between text-slate-200">
              <span>Sat – Sun:</span>
              <span className="font-mono text-white">08:00 – 18:00 GMT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section: Secure Form & FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Secure Inquiry Form (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#172C49]/40 backdrop-blur-md">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-[#C6A66B]/15 border border-[#C6A66B]/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-[#C6A66B]" />
              </div>
              <div>
                <h2 className="text-base font-serif text-white">Submit Secure Inquiry</h2>
                <p className="text-xs text-slate-300">
                  Communications are authenticated through bank-grade encryption.
                </p>
              </div>
            </div>

            {submittedRef ? (
              <div className="p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-base font-serif text-white">Inquiry Successfully Dispatched</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Your communication has been securely logged and routed to your Senior Relationship Manager.
                </p>
                <div className="inline-block p-3 rounded-lg bg-[#101D32] border border-white/10 text-xs font-mono text-[#C6A66B]">
                  Ticket Reference: {submittedRef}
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittedRef(null)}
                    className="text-xs text-[#C6A66B] hover:text-[#DBC599] underline underline-offset-4"
                  >
                    Submit another inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Department */}
                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1.5 uppercase tracking-wider">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#101D32] border border-white/15 text-white text-xs focus:outline-none focus:border-[#C6A66B]"
                    >
                      <option value="Private Client Banking">Private Client Banking</option>
                      <option value="International Payments & FX">International Payments & FX</option>
                      <option value="Fraud & Security Concern">Fraud & Security Concern</option>
                      <option value="Digital Banking & Access">Digital Banking & Access</option>
                      <option value="Statements & Tax Reports">Statements & Tax Reports</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-medium text-slate-200 mb-1.5 uppercase tracking-wider">
                      Priority Level
                    </label>
                    <select
                      value={priority}
                      onChange={(e) =>
                        setPriority(e.target.value as "Standard" | "High" | "Urgent")
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#101D32] border border-white/15 text-white text-xs focus:outline-none focus:border-[#C6A66B]"
                    >
                      <option value="Standard">Standard (Within 24 Hours)</option>
                      <option value="High">High (Within 4 Hours)</option>
                      <option value="Urgent">Urgent Priority (Immediate Escalation)</option>
                    </select>
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1.5 uppercase tracking-wider">
                    Subject Line *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inward SWIFT wire inquiry / Transfer limit review"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#101D32] border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C6A66B]"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-medium text-slate-200 mb-1.5 uppercase tracking-wider">
                    Detailed Message *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Provide full details of your request, including any relevant transaction references or specific dates..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#101D32] border border-white/15 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#C6A66B] resize-none"
                  />
                </div>

                {/* Attachment Simulation */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-200 mb-1 uppercase tracking-wider">
                      Supporting Document (Optional)
                    </label>
                    {attachmentName && (
                      <button
                        type="button"
                        onClick={() => setAttachmentName(null)}
                        className="text-[11px] text-red-400 hover:text-red-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {attachmentName ? (
                    <div className="p-3 rounded-xl bg-[#101D32] border border-white/10 flex items-center justify-between text-xs text-white">
                      <span className="inline-flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#C6A66B]" />
                        {attachmentName}
                      </span>
                      <span className="text-slate-400 text-[11px]">Attached</span>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer transition-all">
                      <Paperclip className="w-4 h-4 text-[#C6A66B]" />
                      <span>Attach invoice, PDF receipt, or photo (max 10MB)</span>
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setAttachmentName(file.name);
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !subject.trim() || !message.trim()}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#C6A66B] to-[#b39358] hover:from-[#d1b37b] hover:to-[#be9e63] text-[#101D32] font-semibold text-xs tracking-wider uppercase inline-flex items-center justify-center gap-2 shadow-lg shadow-[#C6A66B]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#101D32] border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Secure Message...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Authenticated Message</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Recent Inquiries List */}
          {tickets.length > 0 && (
            <div className="p-6 rounded-2xl border border-white/10 bg-[#172C49]/40 backdrop-blur-md">
              <h3 className="text-sm font-serif text-white mb-3">Your Recent Support Tickets</h3>
              <div className="space-y-2">
                {tickets.slice(0, 4).map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl bg-[#101D32]/60 border border-white/5 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[#C6A66B] text-[11px]">
                          {t.referenceNumber}
                        </span>
                        <span className="text-white font-medium truncate max-w-[200px]">
                          {t.subject}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t.department} • {t.date}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Knowledge Base / FAQs (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl border border-white/10 bg-[#172C49]/40 backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-xl bg-[#C6A66B]/15 border border-[#C6A66B]/30 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-[#C6A66B]" />
              </div>
              <div>
                <h2 className="text-base font-serif text-white">Frequently Answered</h2>
                <p className="text-xs text-slate-300">Quick guidance on common operations.</p>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search banking questions..."
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#101D32] border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#C6A66B]"
              />
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {["All", "Transfers", "Security", "Accounts", "Cards"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFaqCat(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                    selectedFaqCat === cat
                      ? "bg-[#C6A66B] text-[#101D32]"
                      : "bg-white/5 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-2.5 pt-2">
              {filteredFaqs.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No questions match your query. Try searching with different keywords.
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = expandedFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-xl border border-white/10 bg-[#101D32]/50 overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedFaq(isOpen ? null : faq.id)}
                        className="w-full p-3.5 text-left flex items-start justify-between gap-3 hover:bg-white/5 transition-colors"
                      >
                        <span className="text-xs font-semibold text-white leading-snug">
                          {faq.question}
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-[#C6A66B] shrink-0 mt-0.5" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-3.5 pb-3.5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-white/5">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
