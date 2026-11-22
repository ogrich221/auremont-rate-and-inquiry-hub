export type NavigationSection =
  | "overview"
  | "accounts"
  | "domestic-transfers"
  | "international-wires"
  | "pay-bills"
  | "beneficiaries"
  | "transactions"
  | "statements"
  | "profile"
  | "notifications"
  | "help-support";

export type AccountType =
  | "Premier Checking"
  | "Reserve Savings"
  | "Multi-Currency Vault"
  | "Private Liquidity";

export interface CustomerAccount {
  id: string;
  name: string;
  type: AccountType;
  accountNumber: string;
  maskedAccountNumber: string;
  currency: string;
  balance: number;
  availableBalance: number;
  status: "Active" | "Restricted" | "Locked";
  openingDate: string;
  interestRate?: string;
  routingNumber: string;
  iban?: string;
  swiftBic?: string;
}

export type TransactionType =
  | "Domestic Transfer"
  | "International Wire"
  | "Bill Payment"
  | "Deposit"
  | "Withdrawal";

export type TransactionStatus = "Completed" | "Pending" | "Failed" | "Reversed";

export interface CustomerTransaction {
  id: string;
  reference: string;
  type: TransactionType;
  recipientMerchant: string;
  recipientBank?: string;
  recipientAccountMasked?: string;
  recipientBankAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  date: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  fee: number;
  description: string;
  category?: string;
  swiftRef?: string;
  wirePurpose?: string;
  exchangeRate?: number;
  convertedAmount?: number;
  receivingCurrency?: string;
}

export interface BankAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerBeneficiary {
  id: string;
  fullName: string;
  email?: string;
  phone?: string;
  bankName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  routingOrSwift: string;
  bankAddress: BankAddress;
  country: string;
  transferType: "Domestic Transfer" | "International Wire";
  nickname?: string;
  createdAt: string;
}

export interface ResidentialAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CustomerProfile {
  id: string;
  customerId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  alternativePhone: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
  residentialAddress: ResidentialAddress;
  avatarUrl: string | null;
  accountStatus: "Active" | "Suspended" | "Pending";
  accountType: string;
  memberSince: string;
  kycStatus: "Verified" | "Pending" | "Review Required";
  mfaEnabled: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin: string;
  lastPasswordChange: string;
}

export type NotificationCategory =
  | "Transactions"
  | "Bills"
  | "Security Alerts"
  | "Announcements";

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  date: string;
  read: boolean;
  reference?: string;
}

export interface CustomerStatement {
  id: string;
  accountId: string;
  accountName: string;
  period: string;
  dateGenerated: string;
  documentName: string;
  size: string;
}

export interface CustomerSupportTicket {
  id: string;
  referenceNumber: string;
  subject: string;
  department: string;
  message: string;
  date: string;
  status: "Open" | "In Review" | "Resolved";
  priority: "Standard" | "High" | "Urgent";
}

export type UtilityCategory =
  | "Electricity"
  | "Water"
  | "Internet"
  | "Cable Television"
  | "Mobile Airtime"
  | "Mobile Data"
  | "Other Supported Utilities";

export interface UtilityProvider {
  id: string;
  category: UtilityCategory;
  name: string;
  serviceId: string;
  fee: number;
  logoColor: string;
}
