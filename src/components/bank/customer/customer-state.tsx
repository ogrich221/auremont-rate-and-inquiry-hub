import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  getCustomerTransactions,
  checkUserLoginStatus,
  submitCustomerTransfer,
} from "@/lib/central-admin.functions";
import type {
  CustomerAccount,
  CustomerTransaction,
  CustomerBeneficiary,
  CustomerProfile,
  CustomerNotification,
  CustomerStatement,
  CustomerSupportTicket,
  NavigationSection,
  BankAddress,
  ResidentialAddress,
} from "./customer-types";

const INITIAL_PROFILE: CustomerProfile = {
  id: "c-auremont-0941",
  customerId: "ATB-89410-PC",
  firstName: "Arthur",
  middleName: "Montgomery",
  lastName: "Sterling",
  email: "arthur.sterling@auremont-client.co.uk",
  mobilePhone: "+44 7911 204918",
  alternativePhone: "+44 20 7946 0882",
  dateOfBirth: "1982-05-14",
  nationality: "United Kingdom",
  countryOfResidence: "United Kingdom",
  residentialAddress: {
    street: "14 Kensington Palace Gardens",
    city: "London",
    state: "Greater London",
    postalCode: "W8 4QY",
    country: "United Kingdom",
  },
  avatarUrl: null,
  accountStatus: "Active",
  accountType: "Premier Private Reserve Client",
  memberSince: "October 2021",
  kycStatus: "Verified",
  mfaEnabled: false,
  emailVerified: true,
  phoneVerified: true,
  lastLogin: "Today at 21:40 GMT (London, UK)",
  lastPasswordChange: "45 days ago",
};

const INITIAL_ACCOUNTS: CustomerAccount[] = [
  {
    id: "acc-checking-01",
    name: "Premier Checking Account",
    type: "Premier Checking",
    accountNumber: "9481028471",
    maskedAccountNumber: "•••• •••• 8471",
    currency: "GBP",
    balance: 148250.75,
    availableBalance: 145000.00,
    status: "Active",
    openingDate: "2021-10-15",
    routingNumber: "12-40-88",
    iban: "GB82 AURE 1240 8894 8102 84",
    swiftBic: "AUREGB2LXXX",
  },
  {
    id: "acc-savings-02",
    name: "High-Yield Reserve Savings",
    type: "Reserve Savings",
    accountNumber: "6301948215",
    maskedAccountNumber: "•••• •••• 8215",
    currency: "GBP",
    balance: 450920.00,
    availableBalance: 450920.00,
    status: "Active",
    openingDate: "2022-01-10",
    interestRate: "4.85% APY",
    routingNumber: "12-40-88",
    iban: "GB44 AURE 1240 8863 0194 82",
    swiftBic: "AUREGB2LXXX",
  },
  {
    id: "acc-vault-03",
    name: "Global Multi-Currency Vault",
    type: "Multi-Currency Vault",
    accountNumber: "2840192847",
    maskedAccountNumber: "•••• •••• 2847",
    currency: "USD",
    balance: 285400.50,
    availableBalance: 285400.50,
    status: "Active",
    openingDate: "2022-08-04",
    interestRate: "5.10% APY",
    routingNumber: "026009593",
    swiftBic: "AUREUS33XXX",
  },
  {
    id: "acc-liquidity-04",
    name: "Private Liquidity Reserve",
    type: "Private Liquidity",
    accountNumber: "7719203948",
    maskedAccountNumber: "•••• •••• 3948",
    currency: "EUR",
    balance: 95400.00,
    availableBalance: 95400.00,
    status: "Active",
    openingDate: "2023-03-20",
    routingNumber: "AUREDEFFXXX",
    iban: "DE89 3704 0044 0532 0130 00",
    swiftBic: "AUREDEFFXXX",
  },
];

const INITIAL_TRANSACTIONS: CustomerTransaction[] = [
  {
    id: "tx-1",
    reference: "ATB-DOM-202611-89104",
    type: "Domestic Transfer",
    recipientMerchant: "Belgravia Property Asset Management",
    recipientBank: "Barclays Private Bank UK",
    recipientAccountMasked: "•••• 4920",
    recipientBankAddress: {
      street: "1 Churchill Place",
      city: "London",
      state: "Greater London",
      postalCode: "E14 5HP",
      country: "United Kingdom",
    },
    date: "2026-11-20 14:32",
    amount: 12500.00,
    currency: "GBP",
    status: "Completed",
    fee: 0.00,
    description: "Q4 Property Reserve & Estate Retainer",
    category: "Housing & Real Estate",
  },
  {
    id: "tx-2",
    reference: "ATB-WIR-202611-44012",
    type: "International Wire",
    recipientMerchant: "Geneva Wealth Advisory SA",
    recipientBank: "Pictet & Cie Geneva",
    recipientAccountMasked: "•••• 7712",
    recipientBankAddress: {
      street: "Route des Acacias 60",
      city: "Geneva",
      state: "Canton of Geneva",
      postalCode: "1211",
      country: "Switzerland",
    },
    date: "2026-11-18 10:15",
    amount: 45000.00,
    currency: "USD",
    status: "Completed",
    fee: 25.00,
    description: "Private Advisory Portfolio Capital Allocation",
    category: "Investments",
    swiftRef: "PICTCHGGXXX",
    wirePurpose: "Capital Management",
  },
  {
    id: "tx-3",
    reference: "ATB-BIL-202611-30911",
    type: "Bill Payment",
    recipientMerchant: "British Gas & Electricity Services",
    date: "2026-11-15 16:40",
    amount: 684.20,
    currency: "GBP",
    status: "Completed",
    fee: 0.00,
    description: "Residential Energy & Smart Meter Settlement",
    category: "Utilities",
  },
  {
    id: "tx-4",
    reference: "ATB-DEP-202611-11094",
    type: "Deposit",
    recipientMerchant: "Sovereign Treasury Dividends & Payout",
    date: "2026-11-12 09:00",
    amount: 28400.00,
    currency: "GBP",
    status: "Completed",
    fee: 0.00,
    description: "Quarterly Fixed Income Yield Disbursement",
    category: "Income",
  },
  {
    id: "tx-5",
    reference: "ATB-BIL-202611-99401",
    type: "Bill Payment",
    recipientMerchant: "BT Business & Residential Fibre",
    date: "2026-11-08 11:22",
    amount: 145.00,
    currency: "GBP",
    status: "Completed",
    fee: 0.00,
    description: "Ultra-Fast Gigabit Fibre Lease",
    category: "Utilities",
  },
  {
    id: "tx-6",
    reference: "ATB-WIR-202610-88120",
    type: "International Wire",
    recipientMerchant: "KPMG International Tax Consultants",
    recipientBank: "Deutsche Bank Frankfurt",
    recipientAccountMasked: "•••• 3190",
    recipientBankAddress: {
      street: "Taunusanlage 12",
      city: "Frankfurt am Main",
      state: "Hesse",
      postalCode: "60325",
      country: "Germany",
    },
    date: "2026-10-28 15:10",
    amount: 8200.00,
    currency: "EUR",
    status: "Completed",
    fee: 20.00,
    description: "Corporate International Tax Advisory Retainer",
    category: "Professional Services",
  },
];

const INITIAL_BENEFICIARIES: CustomerBeneficiary[] = [
  {
    id: "ben-1",
    fullName: "Belgravia Property Asset Management",
    email: "finance@belgravia-assets.co.uk",
    phone: "+44 20 7183 9920",
    bankName: "Barclays Private Bank UK",
    accountNumber: "2049182049",
    maskedAccountNumber: "•••• •••• 4920",
    routingOrSwift: "20-00-00",
    bankAddress: {
      street: "1 Churchill Place",
      city: "London",
      state: "Greater London",
      postalCode: "E14 5HP",
      country: "United Kingdom",
    },
    country: "United Kingdom",
    transferType: "Domestic Transfer",
    nickname: "Estate Managers",
    createdAt: "2022-04-12",
  },
  {
    id: "ben-2",
    fullName: "Geneva Wealth Advisory SA",
    email: "desk@geneva-wealth.ch",
    phone: "+41 22 819 00 00",
    bankName: "Pictet & Cie Geneva",
    accountNumber: "CH8800803000771239102",
    maskedAccountNumber: "•••• •••• 7712",
    routingOrSwift: "PICTCHGGXXX",
    bankAddress: {
      street: "Route des Acacias 60",
      city: "Geneva",
      state: "Canton of Geneva",
      postalCode: "1211",
      country: "Switzerland",
    },
    country: "Switzerland",
    transferType: "International Wire",
    nickname: "Swiss Wealth Advisor",
    createdAt: "2023-01-19",
  },
  {
    id: "ben-3",
    fullName: "Lady Vivienne Sterling",
    email: "vivienne.sterling@sterling-trust.co.uk",
    phone: "+44 7911 884012",
    bankName: "Coutts & Co",
    accountNumber: "8849102941",
    maskedAccountNumber: "•••• •••• 2941",
    routingOrSwift: "18-00-02",
    bankAddress: {
      street: "440 Strand",
      city: "London",
      state: "Greater London",
      postalCode: "WC2R 0QS",
      country: "United Kingdom",
    },
    country: "United Kingdom",
    transferType: "Domestic Transfer",
    nickname: "Family Trust Allocation",
    createdAt: "2023-09-05",
  },
  {
    id: "ben-4",
    fullName: "Manhattan Private Aviation Holdings",
    email: "treasury@manhattan-aviation.com",
    phone: "+1 212 555 0188",
    bankName: "JPMorgan Chase New York",
    accountNumber: "021000021884019284",
    maskedAccountNumber: "•••• •••• 9284",
    routingOrSwift: "CHASUS33XXX",
    bankAddress: {
      street: "270 Park Avenue",
      city: "New York",
      state: "NY",
      postalCode: "10017",
      country: "United States",
    },
    country: "United States",
    transferType: "International Wire",
    nickname: "Charter Fleet Services",
    createdAt: "2024-02-14",
  },
];

const INITIAL_NOTIFICATIONS: CustomerNotification[] = [
  {
    id: "notif-1",
    title: "Transfer Processed Successfully",
    message: "Your domestic transfer of £12,500.00 to Belgravia Property Asset Management was executed.",
    category: "Transactions",
    date: "Yesterday at 14:32 GMT",
    read: false,
    reference: "ATB-DOM-202611-89104",
  },
  {
    id: "notif-2",
    title: "Security Verification Active",
    message: "Password and Security PIN successfully verified for your session.",
    category: "Security Alerts",
    date: "Nov 20, 2026 at 09:12 GMT",
    read: false,
  },
  {
    id: "notif-3",
    title: "Utility Bill Settlement Confirmed",
    message: "Payment of £684.20 to British Gas & Electricity Services has settled from Premier Checking.",
    category: "Bills",
    date: "Nov 15, 2026 at 16:40 GMT",
    read: true,
  },
  {
    id: "notif-4",
    title: "Quarterly Portfolio Summary Ready",
    message: "Your Q3 private wealth institutional statement is available for download in Statements.",
    category: "Announcements",
    date: "Nov 10, 2026 at 08:00 GMT",
    read: true,
  },
];

const INITIAL_STATEMENTS: CustomerStatement[] = [
  {
    id: "stmt-1",
    accountId: "acc-checking-01",
    accountName: "Premier Checking Account",
    period: "October 2026",
    dateGenerated: "2026-11-01",
    documentName: "ATB_Statement_Checking_2026_10.pdf",
    size: "248 KB",
  },
  {
    id: "stmt-2",
    accountId: "acc-savings-02",
    accountName: "High-Yield Reserve Savings",
    period: "October 2026",
    dateGenerated: "2026-11-01",
    documentName: "ATB_Statement_Reserve_2026_10.pdf",
    size: "312 KB",
  },
  {
    id: "stmt-3",
    accountId: "acc-checking-01",
    accountName: "Premier Checking Account",
    period: "September 2026",
    dateGenerated: "2026-10-01",
    documentName: "ATB_Statement_Checking_2026_09.pdf",
    size: "260 KB",
  },
  {
    id: "stmt-4",
    accountId: "acc-vault-03",
    accountName: "Global Multi-Currency Vault",
    period: "Q3 2026 Institutional Summary",
    dateGenerated: "2026-10-01",
    documentName: "ATB_Q3_Vault_Summary_2026.pdf",
    size: "580 KB",
  },
];

const INITIAL_TICKETS: CustomerSupportTicket[] = [
  {
    id: "ticket-1",
    referenceNumber: "ATB-SUP-2026-8941",
    subject: "International Currency Exchange Limit Increase",
    department: "Private Wealth Liquidity Desk",
    message: "Requesting guidance on scheduling recurring FX spot transactions exceeding $500,000.",
    date: "2026-11-19 11:20",
    status: "In Review",
    priority: "High",
  },
];

interface CustomerContextType {
  profile: CustomerProfile;
  accounts: CustomerAccount[];
  transactions: CustomerTransaction[];
  beneficiaries: CustomerBeneficiary[];
  notifications: CustomerNotification[];
  statements: CustomerStatement[];
  tickets: CustomerSupportTicket[];
  activeSection: NavigationSection;
  setActiveSection: (s: NavigationSection) => void;
  activeAccount: CustomerAccount;
  setActiveAccount: (acc: CustomerAccount) => void;
  isBalanceVisible: boolean;
  setIsBalanceVisible: (v: boolean) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Actions
  executeDomesticTransfer: (data: {
    recipientName: string;
    bankName: string;
    branch?: string;
    bankAddress: BankAddress;
    accountNumber: string;
    accountType: string;
    routingNumber: string;
    amount: number;
    currency: string;
    description: string;
    saveBeneficiary?: boolean;
  }) => Promise<{ success: boolean; reference: string; error?: string }>;

  executeInternationalWire: (data: {
    beneficiaryName: string;
    beneficiaryEmail?: string;
    beneficiaryPhone: string;
    beneficiaryAddress: ResidentialAddress;
    bankName: string;
    bankAddress: string;
    bankCity: string;
    bankCountry: string;
    swiftBic: string;
    ibanOrAccount: string;
    routingNumber?: string;
    intermediaryBank?: string;
    amount: number;
    sendCurrency: string;
    receiveCurrency: string;
    purpose: string;
    reference: string;
    sourceOfFunds?: string;
    exchangeRate: number;
    fee: number;
    convertedAmount: number;
  }) => Promise<{ success: boolean; reference: string; error?: string }>;

  executeUtilityPayment: (data: {
    category: string;
    provider: string;
    customerIdentifier: string;
    meterOrAccountType?: string;
    customerName: string;
    amount: number;
    reference: string;
  }) => Promise<{ success: boolean; reference: string; error?: string }>;

  addBeneficiary: (ben: Omit<CustomerBeneficiary, "id" | "createdAt" | "maskedAccountNumber">) => void;
  updateBeneficiary: (id: string, updates: Partial<CustomerBeneficiary>) => void;
  deleteBeneficiary: (id: string) => void;

  updateProfile: (updates: Partial<CustomerProfile>) => void;
  updateProfileAvatar: (dataUrl: string) => void;
  removeProfileAvatar: () => void;

  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  submitSupportTicket: (ticket: Omit<CustomerSupportTicket, "id" | "referenceNumber" | "date" | "status">) => string;
  refreshTransactions: () => Promise<void>;
  isImpersonating?: boolean;
  exitImpersonation?: () => void;
}

const CustomerContext = createContext<CustomerContextType | null>(null);

const STORAGE_KEY = "auremont_customer_dashboard_state_v1";

function getImpersonatedProfile(imp: any): CustomerProfile {
  return {
    id: imp.id || "c-auremont-0941",
    customerId: imp.customer_ref || `ATB-${(imp.id || "00000").slice(0, 5).toUpperCase()}-PC`,
    firstName: imp.first_name || "Client",
    middleName: imp.middle_name || "",
    lastName: imp.last_name || "",
    email: imp.email || "client@auremont.com",
    mobilePhone: imp.phone || "+44 7911 204918",
    alternativePhone: "+44 20 7946 0882",
    dateOfBirth: imp.date_of_birth || "1985-06-20",
    nationality: imp.country || "United Kingdom",
    countryOfResidence: imp.country || "United Kingdom",
    residentialAddress: {
      street: imp.street_address || "14 Kensington Palace Gardens",
      city: imp.city || "London",
      state: imp.state || "Greater London",
      postalCode: imp.postal_code || "W8 4QY",
      country: imp.country || "United Kingdom",
    },
    avatarUrl: null,
    accountStatus: imp.status || "Active",
    accountType: imp.account_type ? `${imp.account_type} Client` : "Premier Private Reserve Client",
    memberSince: imp.created_at ? new Date(imp.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "October 2021",
    kycStatus: "Verified",
    mfaEnabled: false,
    emailVerified: true,
    phoneVerified: true,
    lastLogin: "Administrator Session Impersonation",
    lastPasswordChange: "Protected by Auremont Private Vault",
  };
}

function getImpersonatedAccounts(imp: any): CustomerAccount[] {
  const balanceNum = Number(imp.balance ?? 150000);
  const currency = imp.currency || "USD";
  return [
    {
      id: `acc-main-${(imp.id || "01").slice(0, 8)}`,
      name: `${imp.account_type || "Private"} Primary Account`,
      type: imp.account_type || "Checking",
      accountNumber: imp.account_ref ? imp.account_ref.replace(/\D/g, "").slice(0, 10) : "9481028471",
      maskedAccountNumber: imp.account_ref ? `•••• •••• ${imp.account_ref.slice(-4)}` : "•••• •••• 8471",
      currency: currency,
      balance: balanceNum,
      availableBalance: balanceNum,
      status: imp.status || "Active",
      openingDate: imp.created_at ? imp.created_at.split("T")[0] : "2022-01-10",
      routingNumber: "12-40-88",
      iban: `GB82 AURE 1240 88${(imp.id || "1240").slice(0, 8).replace(/\D/g, "12")}`,
      swiftBic: "AUREGB2LXXX",
    },
    {
      id: `acc-reserve-${(imp.id || "02").slice(0, 8)}`,
      name: "Private Reserve High-Yield Vault",
      type: "Reserve Savings",
      accountNumber: "6301948215",
      maskedAccountNumber: "•••• •••• 8215",
      currency: currency,
      balance: Math.round(balanceNum * 1.5 * 100) / 100,
      availableBalance: Math.round(balanceNum * 1.5 * 100) / 100,
      status: "Active",
      openingDate: "2023-01-15",
      interestRate: "4.85% APY",
      routingNumber: "12-40-88",
      swiftBic: "AUREGB2LXXX",
    },
  ];
}

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [isImpersonating, setIsImpersonating] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return !!sessionStorage.getItem("auremont_impersonate_customer");
    }
    return false;
  });

  const exitImpersonation = useCallback(() => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("auremont_impersonate_customer");
      window.location.href = "/admin/users";
    }
  }, []);

  const [profile, setProfile] = useState<CustomerProfile>(() => {
    if (typeof window !== "undefined") {
      const imp = sessionStorage.getItem("auremont_impersonate_customer");
      if (imp) {
        try {
          return getImpersonatedProfile(JSON.parse(imp));
        } catch {}
      }
      const saved = localStorage.getItem(`${STORAGE_KEY}_profile`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_PROFILE;
  });

  const [accounts, setAccounts] = useState<CustomerAccount[]>(() => {
    if (typeof window !== "undefined") {
      const imp = sessionStorage.getItem("auremont_impersonate_customer");
      if (imp) {
        try {
          return getImpersonatedAccounts(JSON.parse(imp));
        } catch {}
      }
      const saved = localStorage.getItem(`${STORAGE_KEY}_accounts`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_ACCOUNTS;
  });

  const [transactions, setTransactions] = useState<CustomerTransaction[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [beneficiaries, setBeneficiaries] = useState<CustomerBeneficiary[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`${STORAGE_KEY}_beneficiaries`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_BENEFICIARIES;
  });

  const [notifications, setNotifications] = useState<CustomerNotification[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [statements] = useState<CustomerStatement[]>(INITIAL_STATEMENTS);
  const [tickets, setTickets] = useState<CustomerSupportTicket[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tickets`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_TICKETS;
  });

  const [activeSection, setActiveSection] = useState<NavigationSection>("overview");
  const [activeAccountId, setActiveAccountId] = useState<string>(
    accounts[0]?.id || INITIAL_ACCOUNTS[0]!.id,
  );
  const activeAccount =
    accounts.find((a) => a.id === activeAccountId) || accounts[0] || INITIAL_ACCOUNTS[0]!;
  const setActiveAccount = (acc: CustomerAccount) => setActiveAccountId(acc.id);
  const [isBalanceVisible, setIsBalanceVisible] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const checkStatus = useServerFn(checkUserLoginStatus);
  const postTransfer = useServerFn(submitCustomerTransfer);

  // Sync with authenticated Supabase user and verify approval
  useEffect(() => {
    void (async () => {
      try {
        if (typeof window !== "undefined" && sessionStorage.getItem("auremont_impersonate_customer")) {
          // Administrator impersonation active
          return;
        }

        const { data } = await supabase.auth.getUser();
        if (data?.user?.email) {
          const userEmail = data.user.email.toLowerCase().trim();
          if (userEmail !== "skybridgeairline@gmail.com") {
            try {
              const check = await checkStatus({ data: { email: userEmail } });
              if (!check.allowed) {
                await supabase.auth.signOut();
                if (typeof window !== "undefined") {
                  window.location.href = `/login?error=${encodeURIComponent(
                    check.reason || "Account pending administrator approval before login.",
                  )}`;
                }
                return;
              }
            } catch {}
          }

          setProfile((prev) => {
            if (prev.email === "arthur.sterling@auremont-client.co.uk") {
              const namePart = userEmail.split("@")[0] || "Client";
              const capitalized = namePart.charAt(0).toUpperCase() + namePart.slice(1);
              return {
                ...prev,
                email: userEmail,
                firstName: prev.firstName === "Arthur" ? capitalized : prev.firstName,
              };
            }
            return prev;
          });
        }
      } catch {}
    })();
  }, [checkStatus]);

  const fetchTransactions = useServerFn(getCustomerTransactions);

  const syncTransactions = useCallback(async () => {
    try {
      const res = await fetchTransactions({
        data: {
          email: profile.email,
        },
      });
      if (res?.transactions && res.transactions.length > 0) {
        setTransactions((prev) => {
          const serverMap = new Map(res.transactions.map((tx: any) => [tx.id, tx]));
          const refMap = new Map(res.transactions.map((tx: any) => [tx.reference, tx]));

          const updated = prev.map((localTx) => {
            if (serverMap.has(localTx.id)) return serverMap.get(localTx.id)!;
            if (refMap.has(localTx.reference)) return refMap.get(localTx.reference)!;
            return localTx;
          });

          const existingIds = new Set(updated.map((t) => t.id));
          const existingRefs = new Set(updated.map((t) => t.reference));
          const toAdd = res.transactions.filter(
            (t: any) => !existingIds.has(t.id) && !existingRefs.has(t.reference),
          );

          const combined = [...toAdd, ...updated];
          return combined.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        });

        const adminCredits = res.transactions
          .filter((t: any) => (t.type === "Deposit" || t.type === "Credit") && t.status === "Completed")
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        const adminDebits = res.transactions
          .filter((t: any) => t.type !== "Deposit" && t.type !== "Credit" && t.status === "Completed")
          .reduce((sum: number, t: any) => sum + t.amount, 0);

        if (adminCredits > 0 || adminDebits > 0) {
          setAccounts((prev) =>
            prev.map((acc, idx) => {
              if (idx === 0) {
                const baseBalance = INITIAL_ACCOUNTS[0]!.balance;
                const newBal = Math.max(0, baseBalance + adminCredits - adminDebits);
                return {
                  ...acc,
                  balance: newBal,
                  availableBalance: Math.max(0, newBal - 3250),
                };
              }
              return acc;
            }),
          );
        }
      }
    } catch {}
  }, [fetchTransactions, profile.email]);

  useEffect(() => {
    void syncTransactions();
  }, [syncTransactions]);

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`${STORAGE_KEY}_profile`, JSON.stringify(profile));
      localStorage.setItem(`${STORAGE_KEY}_accounts`, JSON.stringify(accounts));
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
      localStorage.setItem(`${STORAGE_KEY}_beneficiaries`, JSON.stringify(beneficiaries));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_tickets`, JSON.stringify(tickets));
    }
  }, [profile, accounts, transactions, beneficiaries, notifications, tickets]);

  const executeDomesticTransfer = async (data: {
    recipientName: string;
    bankName: string;
    branch?: string;
    bankAddress: BankAddress;
    accountNumber: string;
    accountType: string;
    routingNumber: string;
    amount: number;
    currency: string;
    description: string;
    saveBeneficiary?: boolean;
  }) => {
    if (data.amount <= 0) return { success: false, reference: "", error: "Invalid transfer amount." };
    if (activeAccount.availableBalance < data.amount) {
      return { success: false, reference: "", error: "Insufficient available balance in selected account." };
    }

    const ref = `ATB-DOM-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const maskedAcc = `•••• ${data.accountNumber.slice(-4)}`;

    // Debit active account
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === activeAccount.id
          ? {
              ...acc,
              balance: acc.balance - data.amount,
              availableBalance: acc.availableBalance - data.amount,
            }
          : acc,
      ),
    );

    // Record Transaction awaiting admin approval
    const newTx: CustomerTransaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      type: "Domestic Transfer",
      recipientMerchant: data.recipientName,
      recipientBank: data.bankName,
      recipientAccountMasked: maskedAcc,
      recipientBankAddress: data.bankAddress,
      date: now,
      amount: data.amount,
      currency: data.currency,
      status: "Pending",
      fee: 0,
      description: data.description || "Domestic Bank Transfer",
      category: "Transfers",
    };

    setTransactions((prev) => [newTx, ...prev]);

    try {
      await postTransfer({
        data: {
          email: profile.email,
          recipient: data.recipientName,
          amount: data.amount,
          currency: data.currency,
          type: "Domestic Transfer",
          description: data.description || "Domestic Bank Transfer",
          reference: ref,
        },
      });
    } catch {}

    // Save beneficiary if checked
    if (data.saveBeneficiary) {
      const newBen: CustomerBeneficiary = {
        id: `ben-${Date.now()}`,
        fullName: data.recipientName,
        bankName: data.bankName,
        accountNumber: data.accountNumber,
        maskedAccountNumber: maskedAcc,
        routingOrSwift: data.routingNumber,
        bankAddress: data.bankAddress,
        country: data.bankAddress.country || "United Kingdom",
        transferType: "Domestic Transfer",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setBeneficiaries((prev) => [newBen, ...prev]);
    }

    // Add Notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Transfer Awaiting Administrator Approval",
        message: `Your domestic transfer of ${data.currency} ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} to ${data.recipientName} has been scheduled and is awaiting compliance approval.`,
        category: "Transactions",
        date: "Just now",
        read: false,
        reference: ref,
      },
      ...prev,
    ]);

    return { success: true, reference: ref };
  };

  const executeInternationalWire = async (data: {
    beneficiaryName: string;
    beneficiaryEmail?: string;
    beneficiaryPhone: string;
    beneficiaryAddress: ResidentialAddress;
    bankName: string;
    bankAddress: string;
    bankCity: string;
    bankCountry: string;
    swiftBic: string;
    ibanOrAccount: string;
    routingNumber?: string;
    intermediaryBank?: string;
    amount: number;
    sendCurrency: string;
    receiveCurrency: string;
    purpose: string;
    reference: string;
    sourceOfFunds?: string;
    exchangeRate: number;
    fee: number;
    convertedAmount: number;
  }) => {
    const totalDebit = data.amount + data.fee;
    if (activeAccount.availableBalance < totalDebit) {
      return { success: false, reference: "", error: "Insufficient balance to cover wire and transfer fee." };
    }

    const ref = `ATB-WIR-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const maskedAcc = data.ibanOrAccount ? `•••• ${data.ibanOrAccount.slice(-4)}` : "•••• 0000";

    // Debit account
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === activeAccount.id
          ? {
              ...acc,
              balance: acc.balance - totalDebit,
              availableBalance: acc.availableBalance - totalDebit,
            }
          : acc,
      ),
    );

    // Record Transaction awaiting admin approval
    const newTx: CustomerTransaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      type: "International Wire",
      recipientMerchant: data.beneficiaryName,
      recipientBank: data.bankName,
      recipientAccountMasked: maskedAcc,
      recipientBankAddress: {
        street: data.bankAddress,
        city: data.bankCity,
        state: "",
        postalCode: "",
        country: data.bankCountry,
      },
      date: now,
      amount: data.amount,
      currency: data.sendCurrency,
      status: "Pending",
      fee: data.fee,
      description: data.purpose || "International Wire Transfer",
      category: "Wire Transfers",
      swiftRef: data.swiftBic,
      wirePurpose: data.purpose,
      exchangeRate: data.exchangeRate,
      convertedAmount: data.convertedAmount,
      receivingCurrency: data.receiveCurrency,
    };

    setTransactions((prev) => [newTx, ...prev]);

    try {
      await postTransfer({
        data: {
          email: profile.email,
          recipient: data.beneficiaryName,
          amount: data.amount,
          currency: data.sendCurrency,
          type: "International Wire",
          description: data.purpose || "International Wire Transfer",
          reference: ref,
        },
      });
    } catch {}

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Wire Awaiting Administrator Approval",
        message: `Wire transfer of ${data.sendCurrency} ${data.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} to ${data.beneficiaryName} (${data.bankCountry}) is awaiting compliance approval before clearing.`,
        category: "Transactions",
        date: "Just now",
        read: false,
        reference: ref,
      },
      ...prev,
    ]);

    return { success: true, reference: ref };
  };

  const executeUtilityPayment = async (data: {
    category: string;
    provider: string;
    customerIdentifier: string;
    meterOrAccountType?: string;
    customerName: string;
    amount: number;
    reference: string;
  }) => {
    if (activeAccount.availableBalance < data.amount) {
      return { success: false, reference: "", error: "Insufficient available balance." };
    }

    const ref = `ATB-BIL-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);

    // Debit
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === activeAccount.id
          ? {
              ...acc,
              balance: acc.balance - data.amount,
              availableBalance: acc.availableBalance - data.amount,
            }
          : acc,
      ),
    );

    const newTx: CustomerTransaction = {
      id: `tx-${Date.now()}`,
      reference: ref,
      type: "Bill Payment",
      recipientMerchant: data.provider,
      date: now,
      amount: data.amount,
      currency: activeAccount.currency,
      status: "Pending",
      fee: 0,
      description: `${data.category}: ${data.provider} (${data.customerIdentifier})`,
      category: "Utilities",
    };

    setTransactions((prev) => [newTx, ...prev]);

    try {
      await postTransfer({
        data: {
          email: profile.email,
          recipient: data.provider,
          amount: data.amount,
          currency: activeAccount.currency,
          type: "Bill Payment",
          description: `${data.category}: ${data.provider} (${data.customerIdentifier})`,
          reference: ref,
        },
      });
    } catch {}

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Bill Payment Awaiting Approval",
        message: `Payment of ${activeAccount.currency} ${data.amount.toFixed(2)} to ${data.provider} is awaiting administrative approval before release.`,
        category: "Bills",
        date: "Just now",
        read: false,
        reference: ref,
      },
      ...prev,
    ]);

    return { success: true, reference: ref };
  };

  const addBeneficiary = (ben: Omit<CustomerBeneficiary, "id" | "createdAt" | "maskedAccountNumber">) => {
    const masked = ben.accountNumber ? `•••• ${ben.accountNumber.slice(-4)}` : "•••• 0000";
    const newBen: CustomerBeneficiary = {
      ...ben,
      id: `ben-${Date.now()}`,
      maskedAccountNumber: masked,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    setBeneficiaries((prev) => [newBen, ...prev]);
  };

  const updateBeneficiary = (id: string, updates: Partial<CustomerBeneficiary>) => {
    setBeneficiaries((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    );
  };

  const deleteBeneficiary = (id: string) => {
    setBeneficiaries((prev) => prev.filter((b) => b.id !== id));
  };

  const updateProfile = (updates: Partial<CustomerProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: "Profile Information Updated",
        message: "Your customer contact and profile details were updated successfully.",
        category: "Security Alerts",
        date: "Just now",
        read: false,
      },
      ...prev,
    ]);
  };

  const updateProfileAvatar = (dataUrl: string) => {
    setProfile((prev) => ({ ...prev, avatarUrl: dataUrl }));
  };

  const removeProfileAvatar = () => {
    setProfile((prev) => ({ ...prev, avatarUrl: null }));
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const submitSupportTicket = (
    ticket: Omit<CustomerSupportTicket, "id" | "referenceNumber" | "date" | "status">,
  ) => {
    const ref = `ATB-SUP-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString().replace("T", " ").slice(0, 16);
    const newTicket: CustomerSupportTicket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      referenceNumber: ref,
      date: now,
      status: "Open",
    };
    setTickets((prev) => [newTicket, ...prev]);
    return ref;
  };

  return (
    <CustomerContext.Provider
      value={{
        profile,
        accounts,
        transactions,
        beneficiaries,
        notifications,
        statements,
        tickets,
        activeSection,
        setActiveSection,
        activeAccount,
        setActiveAccount,
        isBalanceVisible,
        setIsBalanceVisible,
        searchQuery,
        setSearchQuery,
        executeDomesticTransfer,
        executeInternationalWire,
        executeUtilityPayment,
        addBeneficiary,
        updateBeneficiary,
        deleteBeneficiary,
        updateProfile,
        updateProfileAvatar,
        removeProfileAvatar,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        submitSupportTicket,
        refreshTransactions: syncTransactions,
        isImpersonating,
        exitImpersonation,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomerBanking() {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error("useCustomerBanking must be used within CustomerProvider");
  return ctx;
}
