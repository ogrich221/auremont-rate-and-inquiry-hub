import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  Building2,
  Globe2,
  Receipt,
  Users,
  History,
  FileText,
  User,
  Bell,
  HelpCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
  ChevronDown,
  ShieldCheck,
  ExternalLink,
  ShieldAlert,
  ArrowUpDown,
  Lock,
} from "lucide-react";
import { useCustomerBanking } from "./customer-state";
import type { NavigationSection } from "./customer-types";
import { Emblem } from "../shell";
import "./customer-dashboard.css";

// Views
import { OverviewView } from "./views/OverviewView";
import { AccountsView } from "./views/AccountsView";
import { DomesticTransferView } from "./views/DomesticTransferView";
import { InternationalWireView } from "./views/InternationalWireView";
import { PayBillsView } from "./views/PayBillsView";
import { BeneficiariesView } from "./views/BeneficiariesView";
import type { CustomerTransaction } from "./customer-types";
import { TransactionHistoryView } from "./views/TransactionHistoryView";
import { StatementsView } from "./views/StatementsView";
import { ProfileView } from "./views/ProfileView";
import { NotificationsView } from "./views/NotificationsView";
import { HelpSupportView } from "./views/HelpSupportView";
import { supabase } from "@/integrations/supabase/client";

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ReactNode;
  badge?: number | undefined;
}

export function CustomerLayout() {
  const navigate = useNavigate();
  const {
    profile,
    accounts,
    activeAccount,
    setActiveAccount,
    activeSection,
    setActiveSection,
    notifications,
    searchQuery,
    setSearchQuery,
    markNotificationAsRead,
  } = useCustomerBanking();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<CustomerTransaction | null>(null);

  // Initial luxury branded loading sequence
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 650);
    return () => clearTimeout(timer);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const navItems: NavItem[] = [
    {
      id: "overview",
      label: "Overview",
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: "accounts",
      label: "My Accounts",
      icon: <Wallet className="w-4 h-4 shrink-0" />,
    },
    {
      id: "domestic-transfers",
      label: "Domestic Transfers",
      icon: <Building2 className="w-4 h-4 shrink-0" />,
    },
    {
      id: "international-wires",
      label: "International Wire Transfers",
      icon: <Globe2 className="w-4 h-4 shrink-0" />,
    },
    {
      id: "pay-bills",
      label: "Pay Bills",
      icon: <Receipt className="w-4 h-4 shrink-0" />,
    },
    {
      id: "beneficiaries",
      label: "Beneficiaries",
      icon: <Users className="w-4 h-4 shrink-0" />,
    },
    {
      id: "transactions",
      label: "Transaction History",
      icon: <History className="w-4 h-4 shrink-0" />,
    },
    {
      id: "statements",
      label: "Statements",
      icon: <FileText className="w-4 h-4 shrink-0" />,
    },
    {
      id: "profile",
      label: "My Profile",
      icon: <User className="w-4 h-4 shrink-0" />,
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4 shrink-0" />,
      badge: unreadNotificationsCount > 0 ? unreadNotificationsCount : undefined,
    },
    {
      id: "help-support",
      label: "Help & Support",
      icon: <HelpCircle className="w-4 h-4 shrink-0" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      // ignore
    }
    void navigate({ to: "/login" });
  };

  const handleNavClick = (sectionId: NavigationSection) => {
    setActiveSection(sectionId);
    setIsMobileMenuOpen(false);
  };

  const renderActiveView = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewView />;
      case "accounts":
        return <AccountsView />;
      case "domestic-transfers":
        return <DomesticTransferView />;
      case "international-wires":
        return <InternationalWireView />;
      case "pay-bills":
        return <PayBillsView />;
      case "beneficiaries":
        return <BeneficiariesView />;
      case "transactions":
        return <TransactionHistoryView selectedTx={selectedTx} onSelectTx={setSelectedTx} />;
      case "statements":
        return <StatementsView />;
      case "profile":
        return <ProfileView />;
      case "notifications":
        return <NotificationsView />;
      case "help-support":
        return <HelpSupportView />;
      default:
        return <OverviewView />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#101D32] flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#172C49] to-[#101D32] border border-[#C6A66B]/50 flex items-center justify-center shadow-2xl shadow-[#C6A66B]/15 animate-pulse">
            <div className="w-10 h-10 text-[#C6A66B]">
              <Emblem />
            </div>
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#C6A66B]/20 to-transparent blur-md -z-10" />
        </div>
        <h2 className="text-xl font-serif tracking-widest text-[#F8F7F3] uppercase">
          Auremont Trust Bank
        </h2>
        <p className="text-xs tracking-wider text-[#C6A66B] font-mono mt-2 flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Securing Your Banking Experience...
        </p>
      </div>
    );
  }

  return (
    <div className="customer-dashboard-root flex min-h-screen">
      {/* Background Watermark Emblem */}
      <div className="customer-watermark">
        <Emblem />
      </div>

      {/* MOBILE MENU BACKDROP */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION (Desktop & Mobile Slide-Out) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-[#172C49]/95 backdrop-blur-xl border-r border-white/10 transition-all duration-300 ${
          isSidebarCollapsed ? "w-20" : "w-64"
        } ${
          isMobileMenuOpen
            ? "translate-x-0 w-72"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Sidebar Header / Logo */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <Link
            to="/"
            className={`flex items-center gap-3 overflow-hidden transition-all ${
              isSidebarCollapsed && !isMobileMenuOpen ? "justify-center w-full" : ""
            }`}
          >
            <div className="w-8 h-8 shrink-0 text-[#C6A66B]">
              <Emblem />
            </div>
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <div className="leading-tight">
                <span className="font-serif tracking-widest text-sm font-semibold text-white block">
                  AUREMONT
                </span>
                <span className="text-[9px] tracking-widest text-[#C6A66B] font-medium block">
                  TRUST BANK
                </span>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          {isMobileMenuOpen && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={isSidebarCollapsed && !isMobileMenuOpen ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? "bg-gradient-to-r from-[#C6A66B] to-[#b89555] text-[#101D32] font-semibold shadow-md shadow-[#C6A66B]/20"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                } ${isSidebarCollapsed && !isMobileMenuOpen ? "justify-center px-0" : ""}`}
              >
                <div
                  className={`${
                    isActive
                      ? "text-[#101D32]"
                      : "text-[#C6A66B] group-hover:text-white transition-colors"
                  }`}
                >
                  {item.icon}
                </div>

                {(!isSidebarCollapsed || isMobileMenuOpen) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {/* Badge for notifications */}
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-[#101D32] text-[#C6A66B]"
                        : "bg-[#C6A66B] text-[#101D32]"
                    } ${
                      isSidebarCollapsed && !isMobileMenuOpen
                        ? "absolute top-1.5 right-1.5 w-2 h-2 p-0 rounded-full"
                        : ""
                    }`}
                  >
                    {isSidebarCollapsed && !isMobileMenuOpen ? "" : item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer with Collapse Toggle & Logout */}
        <div className="p-3 border-t border-white/10 shrink-0 space-y-1.5">
          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 p-2 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-4 h-4 text-[#C6A66B]" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-[#C6A66B]" />
                <span className="text-[11px] uppercase tracking-wider">Collapse Sidebar</span>
              </>
            )}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            title={isSidebarCollapsed && !isMobileMenuOpen ? "Sign Out" : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-red-300 hover:text-white hover:bg-red-500/20 transition-all ${
              isSidebarCollapsed && !isMobileMenuOpen ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0 text-red-400" />
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <span className="truncate">Sign Out</span>
            )}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-30 h-16 bg-[#101D32]/90 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Auremont Brand */}
            <div className="flex lg:hidden items-center gap-2">
              <div className="w-6 h-6 text-[#C6A66B]">
                <Emblem />
              </div>
              <span className="font-serif text-sm font-semibold text-white tracking-wide">
                AUREMONT
              </span>
            </div>

            {/* Global Search Bar */}
            <div className="hidden md:flex items-center relative w-72 lg:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search accounts, transfers, receipts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C6A66B] focus:bg-[#172C49]/60 transition-all"
              />
            </div>
          </div>

          {/* Right Top Nav Controls */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-[#C6A66B] ring-2 ring-[#101D32]" />
                )}
              </button>

              {isNotificationDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsNotificationDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#172C49]/95 backdrop-blur-xl shadow-2xl shadow-black/60 z-40 p-4 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-semibold text-white">
                          Recent Alerts
                        </span>
                        {unreadNotificationsCount > 0 && (
                          <span className="text-[10px] bg-[#C6A66B] text-[#101D32] px-1.5 py-0.2 rounded-full font-bold">
                            {unreadNotificationsCount} new
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotificationDropdownOpen(false);
                          setActiveSection("notifications");
                        }}
                        className="text-[11px] text-[#C6A66B] hover:text-[#DBC599]"
                      >
                        View all
                      </button>
                    </div>

                    <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
                      {notifications.slice(0, 4).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            markNotificationAsRead(n.id);
                            setIsNotificationDropdownOpen(false);
                            setActiveSection("notifications");
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                            n.read
                              ? "bg-white/5 border-white/5 opacity-80"
                              : "bg-[#101D32]/60 border-[#C6A66B]/30"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-white truncate">{n.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">{n.date}</span>
                          </div>
                          <p className="text-[11px] text-slate-300 line-clamp-2 mt-0.5">
                            {n.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile Pill & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 p-1.5 pr-2.5 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C6A66B] to-[#96763a] text-[#101D32] font-semibold text-xs flex items-center justify-center overflow-hidden border border-[#C6A66B]/50 shrink-0">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.firstName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {profile.firstName[0]}
                      {profile.lastName[0]}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-white leading-tight">
                    {profile.firstName}
                  </div>
                  <div className="text-[10px] text-[#C6A66B] leading-none">Premier Client</div>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-white/10 bg-[#172C49]/95 backdrop-blur-xl shadow-2xl shadow-black/60 z-40 p-2 space-y-1">
                    <div className="p-3 border-b border-white/10">
                      <div className="text-xs font-semibold text-white">
                        {profile.firstName} {profile.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{profile.email}</div>
                      <div className="text-[10px] text-[#C6A66B] font-mono mt-1">
                        ID: {profile.customerId}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveSection("profile");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <User className="w-4 h-4 text-[#C6A66B]" />
                      <span>My Profile & Settings</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveSection("statements");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-[#C6A66B]" />
                      <span>Statements & Tax Reports</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setActiveSection("help-support");
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <HelpCircle className="w-4 h-4 text-[#C6A66B]" />
                      <span>Client Support Desk</span>
                    </button>

                    <Link
                      to="/admin"
                      onClick={() => setIsProfileDropdownOpen(false)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <Lock className="w-4 h-4 text-slate-400" />
                        Admin Workspace
                      </span>
                      <ExternalLink className="w-3 h-3 text-slate-400" />
                    </Link>

                    <div className="border-t border-white/10 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-300 hover:text-white hover:bg-red-500/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* WELCOME BANNER / DASHBOARD HEADER */}
        <section className="bg-gradient-to-b from-[#172C49]/60 to-transparent border-b border-white/5 px-4 sm:px-8 py-6">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-mono font-medium tracking-widest text-[#C6A66B] uppercase flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                Auremont Premier Private Banking
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif text-white tracking-wide mt-1">
                Welcome Back, {profile.firstName}.
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Your finances, your priorities, all in one convenient place.
              </p>
            </div>

            {/* Quick Account Badge Switcher */}
            <div className="flex items-center gap-3">
              <div className="bg-[#101D32]/80 border border-white/10 rounded-2xl p-2.5 px-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#C6A66B]/15 border border-[#C6A66B]/30 flex items-center justify-center shrink-0">
                  <Wallet className="w-4 h-4 text-[#C6A66B]" />
                </div>
                <div className="text-left">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Primary Account
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {activeAccount.name} ({activeAccount.maskedAccountNumber.slice(-4)})
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VIEW MAIN CONTAINER */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
}
