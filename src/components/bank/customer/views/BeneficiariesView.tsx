import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Search,
  Building2,
  Globe,
  Trash2,
  Edit2,
  Send,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { useCustomerBanking } from "../customer-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomerBeneficiary } from "../customer-types";

export function BeneficiariesView() {
  const { beneficiaries, addBeneficiary, updateBeneficiary, deleteBeneficiary, setActiveSection } =
    useCustomerBanking();

  const [filterType, setFilterType] = useState<"ALL" | "Domestic Transfer" | "International Wire">("ALL");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBen, setEditingBen] = useState<CustomerBeneficiary | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingOrSwift, setRoutingOrSwift] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("United Kingdom");
  const [transferType, setTransferType] = useState<"Domestic Transfer" | "International Wire">(
    "Domestic Transfer",
  );
  const [nickname, setNickname] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const filtered = beneficiaries.filter((b) => {
    const matchesType = filterType === "ALL" || b.transferType === filterType;
    const matchesSearch =
      !search.trim() ||
      b.fullName.toLowerCase().includes(search.toLowerCase()) ||
      b.bankName.toLowerCase().includes(search.toLowerCase()) ||
      b.country.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const openAddModal = () => {
    setEditingBen(null);
    setFullName("");
    setEmail("");
    setPhone("");
    setBankName("");
    setAccountNumber("");
    setRoutingOrSwift("");
    setStreet("");
    setCity("");
    setState("");
    setPostalCode("");
    setCountry("United Kingdom");
    setTransferType("Domestic Transfer");
    setNickname("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const openEditModal = (b: CustomerBeneficiary) => {
    setEditingBen(b);
    setFullName(b.fullName);
    setEmail(b.email || "");
    setPhone(b.phone || "");
    setBankName(b.bankName);
    setAccountNumber(b.accountNumber);
    setRoutingOrSwift(b.routingOrSwift);
    setStreet(b.bankAddress.street);
    setCity(b.bankAddress.city);
    setState(b.bankAddress.state);
    setPostalCode(b.bankAddress.postalCode);
    setCountry(b.country);
    setTransferType(b.transferType);
    setNickname(b.nickname || "");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return setErrorMsg("Beneficiary Name is required.");
    if (!bankName.trim()) return setErrorMsg("Bank Name is required.");
    if (!accountNumber.trim()) return setErrorMsg("Account Number / IBAN is required.");
    if (!routingOrSwift.trim()) return setErrorMsg("Sort code or SWIFT is required.");

    if (editingBen) {
      updateBeneficiary(editingBen.id, {
        fullName,
        email,
        phone,
        bankName,
        accountNumber,
        routingOrSwift,
        bankAddress: { street, city, state, postalCode, country },
        country,
        transferType,
        nickname,
      });
    } else {
      addBeneficiary({
        fullName,
        email,
        phone,
        bankName,
        accountNumber,
        routingOrSwift,
        bankAddress: { street, city, state, postalCode, country },
        country,
        transferType,
        nickname,
      });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="text-[11px] font-semibold tracking-widest text-[#C6A66B] uppercase flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> Trusted Counterparty Registry
          </span>
          <h1 className="text-2xl md:text-3xl font-serif font-medium text-foreground mt-1">
            Beneficiary Management
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Maintain authorized domestic and international wire payees with institutional identity validation.
          </p>
        </div>

        <Button
          onClick={openAddModal}
          className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold text-xs gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add New Beneficiary</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by payee name, bank, or jurisdiction..."
            className="pl-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {(
            [
              ["ALL", "All Beneficiaries"],
              ["Domestic Transfer", "Domestic"],
              ["International Wire", "Cross-Border Wire"],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setFilterType(val)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                filterType === val
                  ? "bg-[#C6A66B] text-[#101D32] font-semibold shadow-xs"
                  : "bg-white/60 dark:bg-slate-900/40 text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Beneficiaries Grid */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border/80 bg-white/40 space-y-2">
          <Users className="h-8 w-8 text-muted-foreground mx-auto opacity-50" />
          <h3 className="text-sm font-semibold text-foreground">No beneficiaries found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {search ? "No records matched your search term." : "You have not added any beneficiaries yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-xl border border-white/60 bg-white/75 dark:bg-slate-900/60 backdrop-blur-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-serif font-bold text-foreground">{b.fullName}</h3>
                    {b.nickname && (
                      <span className="text-[10px] text-[#C6A66B] font-medium block">
                        “{b.nickname}”
                      </span>
                    )}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                      b.transferType === "Domestic Transfer"
                        ? "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                        : "bg-purple-500/10 text-purple-700 dark:text-purple-300"
                    }`}
                  >
                    {b.transferType === "Domestic Transfer" ? (
                      <Building2 className="h-3 w-3" />
                    ) : (
                      <Globe className="h-3 w-3" />
                    )}
                    {b.transferType === "Domestic Transfer" ? "Domestic" : "International Wire"}
                  </span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Bank:</span>
                    <strong className="text-foreground font-medium">{b.bankName}</strong>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Account Number:</span>
                    <span className="font-mono text-foreground font-medium">
                      {b.maskedAccountNumber}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Routing / SWIFT:</span>
                    <span className="font-mono text-foreground">{b.routingOrSwift}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Country:</span>
                    <span className="text-foreground">{b.country}</span>
                  </div>
                  <div className="pt-1 text-[11px] text-muted-foreground border-t border-border/30">
                    <span>Bank Address: </span>
                    <span className="text-foreground">
                      {[b.bankAddress.street, b.bankAddress.city, b.bankAddress.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-border/40">
                <div className="flex items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(b)}
                    className="h-7 w-7 text-muted-foreground hover:text-foreground"
                    title="Edit Beneficiary"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteBeneficiary(b.id)}
                    className="h-7 w-7 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                    title="Remove Beneficiary"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (b.transferType === "Domestic Transfer") {
                      setActiveSection("domestic-transfers");
                    } else {
                      setActiveSection("international-wires");
                    }
                  }}
                  className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] text-xs font-semibold gap-1.5 h-8 px-3"
                >
                  <Send className="h-3 w-3" />
                  <span>Send Funds</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT BENEFICIARY MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="bg-background border border-border/80 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-base font-serif font-semibold text-foreground">
                {editingBen ? "Edit Beneficiary Details" : "Register Trusted Payee"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Transfer Type</label>
                <select
                  value={transferType}
                  onChange={(e) => setTransferType(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 outline-none"
                >
                  <option value="Domestic Transfer">Domestic Clearing Network</option>
                  <option value="International Wire">International SWIFT Wire</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 col-span-2">
                  <label className="font-medium text-foreground">
                    Full Legal Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full individual or corporate name"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">Nickname / Memo</label>
                  <Input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="e.g. London Landlord"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">Country</label>
                  <Input
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="United Kingdom"
                    required
                  />
                </div>

                <div className="space-y-1.5 col-span-2">
                  <label className="font-medium text-foreground">
                    Bank Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Barclays Bank UK"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">
                    Account / IBAN <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account or IBAN"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-medium text-foreground">
                    Sort Code / SWIFT <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={routingOrSwift}
                    onChange={(e) => setRoutingOrSwift(e.target.value)}
                    placeholder="e.g. 20-00-00 or SWIFT"
                    required
                  />
                </div>
              </div>

              {/* Bank Address */}
              <div className="pt-2 border-t border-border/40 space-y-2">
                <label className="font-medium text-foreground block">Recipient Bank Address</label>
                <Input
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street Address"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
                  <Input
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                  />
                  <Input
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="Postal"
                  />
                </div>
              </div>

              {errorMsg && <p className="text-rose-500 text-xs">{errorMsg}</p>}

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#C6A66B] hover:bg-[#b5955a] text-[#101D32] font-semibold"
                >
                  {editingBen ? "Save Changes" : "Confirm & Save Payee"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
