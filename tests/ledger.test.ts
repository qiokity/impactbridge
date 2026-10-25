import { describe, expect, it } from "vitest";
import { isValidLedgerAmount, summarizeLedger } from "../lib/ledger";

describe("financial ledger summaries", () => {
  it("excludes simulated entries from genuine totals", () => {
    expect(summarizeLedger([
      { type: "DONATION_CONFIRMED", amount: 10_000 },
      { type: "DONATION_CONFIRMED", amount: 50_000, isSimulated: true },
      { type: "REFUND", amount: -1_500 },
      { type: "EXPENSE_APPROVED", amount: -2_000 },
      { type: "ADJUSTMENT", amount: 250 },
    ])).toEqual({ confirmedDonations: 10_000, refunds: 1_500, recordedExpenses: 2_000, adjustments: 250, remainingFunds: 6_750 });
  });

  it("enforces signed immutable-event conventions", () => {
    expect(isValidLedgerAmount("DONATION_CONFIRMED", 1)).toBe(true);
    expect(isValidLedgerAmount("DONATION_CONFIRMED", -1)).toBe(false);
    expect(isValidLedgerAmount("REFUND", -1)).toBe(true);
    expect(isValidLedgerAmount("REFUND", 1)).toBe(false);
    expect(isValidLedgerAmount("EXPENSE_APPROVED", 0)).toBe(false);
  });
});
