import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, act } from "@testing-library/react";
import { CustomerProvider, useCustomerBanking } from "../components/bank/customer/customer-state";
import { OverviewView } from "../components/bank/customer/views/OverviewView";

let latestState: ReturnType<typeof useCustomerBanking>;

function TestObserver() {
  latestState = useCustomerBanking();
  return null;
}

function renderCustomerDashboard(children?: React.ReactNode) {
  return render(
    <CustomerProvider>
      <TestObserver />
      {children}
    </CustomerProvider>,
  );
}

describe("Auremont Trust Bank - Customer Online Banking", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with premier customer profile and multi-currency accounts", () => {
    renderCustomerDashboard();

    expect(latestState.profile.firstName).toBe("Arthur");
    expect(latestState.profile.lastName).toBe("Sterling");
    expect(latestState.profile.accountStatus).toBe("Active");
    expect(latestState.profile.kycStatus).toBe("Verified");
    expect(latestState.accounts.length).toBeGreaterThanOrEqual(3);

    const primaryChecking = latestState.accounts.find((a) => a.type === "Premier Checking");
    expect(primaryChecking).toBeDefined();
    expect(primaryChecking?.availableBalance).toBeGreaterThan(0);
  });

  it("renders the dashboard overview summary cards and quick actions", () => {
    renderCustomerDashboard(<OverviewView />);

    // Top Summary Cards
    expect(screen.getByText("Total Balance")).toBeDefined();
    expect(screen.getByText("Savings Overview")).toBeDefined();
    expect(screen.getByText("Monthly Outflows")).toBeDefined();
    expect(screen.getByText("Account Tier")).toBeDefined();

    // Quick Actions
    expect(screen.getByText("Send Money")).toBeDefined();
    expect(screen.getAllByText("Domestic Transfer").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("International Wire").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Pay Bills")).toBeDefined();
    expect(screen.getByText("View Statements")).toBeDefined();
  });

  it("executes a domestic transfer with recipient bank address and debits balance", async () => {
    renderCustomerDashboard();

    const initialBalance = latestState.activeAccount.availableBalance;
    const initialTxCount = latestState.transactions.length;

    let result!: { success: boolean; reference: string };
    await act(async () => {
      result = await latestState.executeDomesticTransfer({
        recipientName: "Evelyn Vance",
        bankName: "Barclays Private Bank",
        bankAddress: {
          street: "1 Churchill Place",
          city: "London",
          state: "Greater London",
          postalCode: "E14 5HP",
          country: "United Kingdom",
        },
        accountNumber: "40928174",
        accountType: "Checking",
        routingNumber: "20-00-00",
        amount: 1500,
        currency: "GBP",
        description: "Legal retainer consultation",
      });
    });

    expect(result.success).toBe(true);
    expect(result.reference).toMatch(/^ATB-DOM-/);
    expect(latestState.activeAccount.availableBalance).toBe(initialBalance - 1500);
    expect(latestState.transactions.length).toBe(initialTxCount + 1);

    const latestTx = latestState.transactions[0];
    expect(latestTx.type).toBe("Domestic Transfer");
    expect(latestTx.amount).toBe(1500);
    expect(latestTx.recipientMerchant).toBe("Evelyn Vance");
    expect(latestTx.recipientBankAddress?.street).toBe("1 Churchill Place");
  });

  it("executes an international wire transfer with locked exchange rate and fee", async () => {
    renderCustomerDashboard();

    const initialBalance = latestState.activeAccount.availableBalance;
    const sendAmount = 5000;
    const lockedFee = 25; // Priority wire fee

    let result!: { success: boolean; reference: string };
    await act(async () => {
      result = await latestState.executeInternationalWire({
        beneficiaryName: "Geneva Capital Partners SA",
        beneficiaryPhone: "+41 22 555 0199",
        beneficiaryAddress: {
          street: "Rue du Rhône 42",
          city: "Geneva",
          state: "Geneva",
          postalCode: "1204",
          country: "Switzerland",
        },
        bankName: "UBS Switzerland AG",
        bankAddress: "Bahnhofstrasse 45",
        bankCity: "Zurich",
        bankCountry: "Switzerland",
        swiftBic: "UBSWCHZH80A",
        ibanOrAccount: "CH9300240240123456789",
        amount: sendAmount,
        sendCurrency: "GBP",
        receiveCurrency: "EUR",
        exchangeRate: 1.174,
        fee: lockedFee,
        convertedAmount: sendAmount * 1.174,
        purpose: "Private Equity Capital Call",
        reference: "PE-GEN-2026-08",
      });
    });

    expect(result.success).toBe(true);
    expect(result.reference).toMatch(/^ATB-WIR-/);
    expect(latestState.activeAccount.availableBalance).toBe(initialBalance - (sendAmount + lockedFee));

    const latestTx = latestState.transactions[0];
    expect(latestTx.type).toBe("International Wire");
    expect(latestTx.fee).toBe(25);
    expect(latestTx.swiftRef).toBeDefined();
    expect(latestTx.convertedAmount).toBeCloseTo(sendAmount * 1.174, 1);
  });

  it("processes utility bill payments across providers and registers transaction", async () => {
    renderCustomerDashboard();

    const initialBalance = latestState.activeAccount.availableBalance;
    const paymentAmount = 185.5;

    let result!: { success: boolean; reference: string };
    await act(async () => {
      result = await latestState.executeUtilityPayment({
        category: "Electricity",
        provider: "British Gas & Electricity",
        customerIdentifier: "BG-849201948",
        customerName: "Arthur Sterling",
        amount: paymentAmount,
        reference: "Oct/Nov Utility Settlement",
      });
    });

    expect(result.success).toBe(true);
    expect(result.reference).toMatch(/^ATB-BIL-/);
    expect(latestState.activeAccount.availableBalance).toBe(initialBalance - paymentAmount);

    const latestTx = latestState.transactions[0];
    expect(latestTx.type).toBe("Bill Payment");
    expect(latestTx.recipientMerchant).toBe("British Gas & Electricity");
  });

  it("allows adding, viewing, and deleting saved beneficiaries", () => {
    renderCustomerDashboard();

    const initialCount = latestState.beneficiaries.length;

    act(() => {
      latestState.addBeneficiary({
        fullName: "Clarissa Montgomery",
        bankName: "Coutts & Co",
        accountNumber: "99887766",
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
        nickname: "Clarissa Family Trust",
      });
    });

    expect(latestState.beneficiaries.length).toBe(initialCount + 1);
    const added = latestState.beneficiaries.find((b) => b.fullName === "Clarissa Montgomery");
    expect(added).toBeDefined();
    expect(added?.bankAddress.street).toBe("440 Strand");

    // Delete beneficiary
    act(() => {
      if (added) {
        latestState.deleteBeneficiary(added.id);
      }
    });
    expect(latestState.beneficiaries.length).toBe(initialCount);
  });

  it("updates personal details and profile avatar smoothly", () => {
    renderCustomerDashboard();

    // Update profile phone & address
    act(() => {
      latestState.updateProfile({
        mobilePhone: "+44 7911 999888",
        residentialAddress: {
          street: "25 Grosvenor Square",
          city: "London",
          state: "Greater London",
          postalCode: "W1K 6JP",
          country: "United Kingdom",
        },
      });
    });

    expect(latestState.profile.mobilePhone).toBe("+44 7911 999888");
    expect(latestState.profile.residentialAddress.street).toBe("25 Grosvenor Square");

    // Avatar update & remove
    act(() => {
      latestState.updateProfileAvatar(
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      );
    });
    expect(latestState.profile.avatarUrl).toContain("data:image/png");

    act(() => {
      latestState.removeProfileAvatar();
    });
    expect(latestState.profile.avatarUrl).toBeNull();
  });

  it("submits authenticated support inquiry tickets with reference generation", () => {
    renderCustomerDashboard();

    let ref!: string;
    act(() => {
      ref = latestState.submitSupportTicket({
        department: "Private Client Banking",
        priority: "High",
        subject: "Request Temporary Daily Transfer Limit Surge",
        message:
          "Kindly adjust our daily domestic transfer limit for an upcoming private property completion.",
      });
    });

    expect(ref).toMatch(/^ATB-SUP-/);
    const created = latestState.tickets.find((t) => t.referenceNumber === ref);
    expect(created).toBeDefined();
    expect(created?.status).toBe("Open");
    expect(created?.priority).toBe("High");
  });

  it("renders notifications with unread tracking and mark all read capability", () => {
    renderCustomerDashboard();

    const unreadCount = latestState.notifications.filter((n) => !n.read).length;
    expect(unreadCount).toBeGreaterThan(0);

    act(() => {
      latestState.markAllNotificationsAsRead();
    });
    const remainingUnread = latestState.notifications.filter((n) => !n.read).length;
    expect(remainingUnread).toBe(0);
  });
});
