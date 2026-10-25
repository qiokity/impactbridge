export type LedgerEventType = "DONATION_CONFIRMED" | "REFUND" | "EXPENSE_APPROVED" | "ADJUSTMENT";

export type LedgerEvent = {
  type: LedgerEventType;
  amount: number;
  isSimulated?: boolean;
};

export type LedgerSummary = {
  confirmedDonations: number;
  refunds: number;
  recordedExpenses: number;
  adjustments: number;
  remainingFunds: number;
};

/**
 * Derives public accounting totals from immutable events. Simulated events are
 * retained for development auditability but cannot be counted as real funds.
 */
export function summarizeLedger(entries: readonly LedgerEvent[]): LedgerSummary {
  let confirmedDonations = 0;
  let refunds = 0;
  let recordedExpenses = 0;
  let adjustments = 0;

  for (const entry of entries) {
    if (entry.isSimulated) continue;
    if (entry.type === "DONATION_CONFIRMED") confirmedDonations += entry.amount;
    if (entry.type === "REFUND") refunds += Math.abs(entry.amount);
    if (entry.type === "EXPENSE_APPROVED") recordedExpenses += Math.abs(entry.amount);
    if (entry.type === "ADJUSTMENT") adjustments += entry.amount;
  }

  return {
    confirmedDonations,
    refunds,
    recordedExpenses,
    adjustments,
    remainingFunds: confirmedDonations - refunds - recordedExpenses + adjustments,
  };
}

export function isValidLedgerAmount(type: LedgerEventType, amount: number) {
  if (!Number.isSafeInteger(amount) || amount === 0) return false;
  if (type === "DONATION_CONFIRMED") return amount > 0;
  if (type === "REFUND" || type === "EXPENSE_APPROVED") return amount < 0;
  return true;
}
