/**
 * Debt Simplification Algorithm
 * ─────────────────────────────
 * Problem: Given N members and M expenses, find the minimum number of
 * transactions needed to settle all debts.
 *
 * Algorithm: Greedy Minimum Cash Flow
 * ────────────────────────────────────
 * 1. Compute each member's NET balance:
 *      net[i] = total_paid_by[i] - total_owed_by[i]
 *    A positive net means the member is a creditor (owed money).
 *    A negative net means the member is a debtor (owes money).
 *
 * 2. Separate into two lists: creditors (net > 0) and debtors (net < 0).
 *    Sort creditors descending by amount, debtors ascending (most negative first).
 *
 * 3. Greedy matching: At each step, match the largest creditor with the
 *    largest debtor. The transaction amount is min(creditor_balance, |debtor_balance|).
 *    Reduce both balances. Advance the pointer of whichever reaches 0.
 *
 * Complexity: O(N log N) for sorting + O(N) for the greedy pass = O(N log N)
 * This produces at most N-1 transactions — provably optimal for the general case.
 *
 * Example:
 *   A owes B ₹100, B owes C ₹50, C owes A ₹30
 *   Net: A = -70, B = +50, C = +20
 *   Result: A pays B ₹50, A pays C ₹20  (2 transactions instead of 3)
 */

export interface BalanceEntry {
  userId: string;
  name: string;
  balance: number; // positive = creditor, negative = debtor
}

export interface SimplifiedTransaction {
  fromUserId: string;
  toUserId: string;
  amount: number;
  fromName: string;
  toName: string;
}

/**
 * Compute net balance for each member across all expenses in a group.
 * Returns a map of userId → net balance.
 */
export function computeNetBalances(
  expenses: Array<{
    paidById: string;
    amount: number;
    splits: Array<{ userId: string; amount: number }>;
  }>
): Map<string, number> {
  const balances = new Map<string, number>();

  const add = (id: string, delta: number) => {
    balances.set(id, (balances.get(id) ?? 0) + delta);
  };

  for (const expense of expenses) {
    // Payer gets credited the full amount
    add(expense.paidById, expense.amount);

    // Each split participant is debited their share
    for (const split of expense.splits) {
      add(split.userId, -split.amount);
    }
  }

  return balances;
}

/**
 * Given a net balance map, produce the minimum set of transactions
 * to settle all debts using the greedy minimum cash flow algorithm.
 */
export function simplifyDebts(
  balanceMap: Map<string, number>,
  nameMap: Map<string, string>
): SimplifiedTransaction[] {
  const EPSILON = 0.01; // ignore sub-cent differences

  // Build mutable arrays of creditors and debtors
  const creditors: Array<{ userId: string; balance: number }> = [];
  const debtors: Array<{ userId: string; balance: number }> = [];

  for (const [userId, balance] of balanceMap.entries()) {
    const rounded = Math.round(balance * 100) / 100;
    if (rounded > EPSILON) creditors.push({ userId, balance: rounded });
    else if (rounded < -EPSILON) debtors.push({ userId, balance: rounded });
  }

  // Sort: largest creditor first, largest debtor (most negative) first
  creditors.sort((a, b) => b.balance - a.balance);
  debtors.sort((a, b) => a.balance - b.balance);

  const transactions: SimplifiedTransaction[] = [];
  let ci = 0; // creditor index
  let di = 0; // debtor index

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    // Amount to transfer: bounded by both parties' remaining balance
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    const rounded = Math.round(amount * 100) / 100;

    if (rounded > EPSILON) {
      transactions.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: rounded,
        fromName: nameMap.get(debtor.userId) ?? debtor.userId,
        toName: nameMap.get(creditor.userId) ?? creditor.userId,
      });
    }

    creditor.balance -= amount;
    debtor.balance += amount;

    if (Math.abs(creditor.balance) < EPSILON) ci++;
    if (Math.abs(debtor.balance) < EPSILON) di++;
  }

  return transactions;
}

/**
 * Full pipeline: expenses → simplified settlement transactions.
 * This is the main entry point used by route handlers.
 */
export function getSimplifiedDebts(
  expenses: Array<{
    paidById: string;
    amount: number;
    splits: Array<{ userId: string; amount: number }>;
  }>,
  members: Array<{ id: string; name: string }>
): SimplifiedTransaction[] {
  const balanceMap = computeNetBalances(expenses);
  const nameMap = new Map(members.map((m) => [m.id, m.name]));
  return simplifyDebts(balanceMap, nameMap);
}
