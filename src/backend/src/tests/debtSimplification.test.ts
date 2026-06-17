import { describe, it, expect } from 'vitest';
import {
  computeNetBalances,
  simplifyDebts,
  getSimplifiedDebts,
} from '../services/debtSimplification.service';

describe('computeNetBalances', () => {
  it('returns zero balances when no expenses', () => {
    const result = computeNetBalances([]);
    expect(result.size).toBe(0);
  });

  it('correctly computes a simple two-person split', () => {
    const expenses = [
      {
        paidById: 'alice',
        amount: 100,
        splits: [
          { userId: 'alice', amount: 50 },
          { userId: 'bob', amount: 50 },
        ],
      },
    ];
    const balances = computeNetBalances(expenses);
    expect(balances.get('alice')).toBe(50);  // paid 100, owes 50 → net +50
    expect(balances.get('bob')).toBe(-50);   // owes 50
  });

  it('handles circular debts correctly', () => {
    // A pays B 100, B pays C 100, C pays A 100 — everyone nets to 0
    const expenses = [
      { paidById: 'A', amount: 100, splits: [{ userId: 'B', amount: 100 }] },
      { paidById: 'B', amount: 100, splits: [{ userId: 'C', amount: 100 }] },
      { paidById: 'C', amount: 100, splits: [{ userId: 'A', amount: 100 }] },
    ];
    const balances = computeNetBalances(expenses);
    expect(Math.abs(balances.get('A') ?? 0)).toBeLessThan(0.01);
    expect(Math.abs(balances.get('B') ?? 0)).toBeLessThan(0.01);
    expect(Math.abs(balances.get('C') ?? 0)).toBeLessThan(0.01);
  });
});

describe('simplifyDebts', () => {
  it('returns empty array when all balances are zero', () => {
    const balanceMap = new Map([['alice', 0], ['bob', 0]]);
    const nameMap = new Map([['alice', 'Alice'], ['bob', 'Bob']]);
    expect(simplifyDebts(balanceMap, nameMap)).toHaveLength(0);
  });

  it('produces a single transaction for a two-person debt', () => {
    const balanceMap = new Map([['alice', 50], ['bob', -50]]);
    const nameMap = new Map([['alice', 'Alice'], ['bob', 'Bob']]);
    const result = simplifyDebts(balanceMap, nameMap);

    expect(result).toHaveLength(1);
    expect(result[0].fromUserId).toBe('bob');
    expect(result[0].toUserId).toBe('alice');
    expect(result[0].amount).toBe(50);
  });

  it('minimises transactions for a 3-person chain (A→B→C→A)', () => {
    // Net: A = -70, B = +50, C = +20
    const balanceMap = new Map([['A', -70], ['B', 50], ['C', 20]]);
    const nameMap = new Map([['A', 'A'], ['B', 'B'], ['C', 'C']]);
    const result = simplifyDebts(balanceMap, nameMap);

    // Should be at most 2 transactions (N-1)
    expect(result.length).toBeLessThanOrEqual(2);

    // Total outflow must equal total inflow
    const totalOut = result.reduce((s, t) => s + t.amount, 0);
    expect(Math.abs(totalOut - 70)).toBeLessThan(0.01);
  });

  it('handles 4-person group correctly', () => {
    // From the seed data: Alex paid Airbnb 12500, 4-way equal split
    // Alex net: +12500 - 3125 = +9375
    // Others: -3125 each
    const balanceMap = new Map([
      ['alex', 9375],
      ['sarah', -3125],
      ['mike', -3125],
      ['john', -3125],
    ]);
    const nameMap = new Map([
      ['alex', 'Alex'], ['sarah', 'Sarah'], ['mike', 'Mike'], ['john', 'John'],
    ]);
    const result = simplifyDebts(balanceMap, nameMap);

    // Exactly 3 transactions (N-1 for 4 people)
    expect(result).toHaveLength(3);
    // All payments go to Alex
    result.forEach((t) => expect(t.toUserId).toBe('alex'));
    // Each payment is 3125
    result.forEach((t) => expect(t.amount).toBe(3125));
  });
});

describe('getSimplifiedDebts (full pipeline)', () => {
  it('produces correct output from expenses array', () => {
    const expenses = [
      {
        paidById: 'alex',
        amount: 12500,
        splits: [
          { userId: 'alex', amount: 3125 },
          { userId: 'sarah', amount: 3125 },
          { userId: 'mike', amount: 3125 },
          { userId: 'john', amount: 3125 },
        ],
      },
    ];
    const members = [
      { id: 'alex', name: 'Alex' },
      { id: 'sarah', name: 'Sarah' },
      { id: 'mike', name: 'Mike' },
      { id: 'john', name: 'John' },
    ];

    const result = getSimplifiedDebts(expenses, members);
    expect(result).toHaveLength(3);

    const totalTransferred = result.reduce((s, t) => s + t.amount, 0);
    expect(Math.abs(totalTransferred - 9375)).toBeLessThan(0.01);
  });
});
