import { Member, Expense, SimplifiedDebt } from '../types';

export const MEMBERS: Member[] = [
  { id: 'alex', name: 'Alex', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150', initial: 'A', color: 'from-emerald-500 to-teal-600' },
  { id: 'sarah', name: 'Sarah', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150', initial: 'S', color: 'from-pink-500 to-rose-600' },
  { id: 'mike', name: 'Mike', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150', initial: 'M', color: 'from-blue-500 to-indigo-600' },
  { id: 'john', name: 'John', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150', initial: 'J', color: 'from-amber-500 to-orange-600' }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp1',
    title: 'Late Night Pizza',
    amount: 1450,
    paidBy: 'mike',
    splitWith: ['alex', 'sarah', 'mike', 'john'],
    date: '2026-06-13',
    category: 'Food',
    groupOnly: true
  },
  {
    id: 'exp2',
    title: 'Trattoria Dinner',
    amount: 3250,
    paidBy: 'sarah',
    splitWith: ['alex', 'sarah', 'john'],
    date: '2026-06-12',
    category: 'Food',
    groupOnly: true
  },
  {
    id: 'exp3',
    title: 'Airbnb Luxury Loft',
    amount: 12500,
    paidBy: 'alex',
    splitWith: ['alex', 'sarah', 'mike', 'john'],
    date: '2026-06-11',
    category: 'Housing'
  },
  {
    id: 'exp4',
    title: 'Eurostar Express Train',
    amount: 4200,
    paidBy: 'alex',
    splitWith: ['alex', 'sarah', 'mike'],
    date: '2026-06-10',
    category: 'Transport'
  },
  {
    id: 'exp5',
    title: 'Louvre Art Passes',
    amount: 1800,
    paidBy: 'john',
    splitWith: ['alex', 'sarah', 'john', 'mike'],
    date: '2026-06-09',
    category: 'Entertainment'
  },
  {
    id: 'exp6',
    title: 'Espresso Bar Shots',
    amount: 600,
    paidBy: 'sarah',
    splitWith: ['sarah', 'mike', 'john'],
    date: '2026-06-08',
    category: 'Food'
  }
];

export function calculateBalances(members: Member[], expenses: Expense[]): Record<string, number> {
  const balances: Record<string, number> = {};
  
  // Initialize balances to 0
  members.forEach(m => {
    balances[m.id] = 0;
  });
  
  // Calculate raw cash flow adjustments
  expenses.forEach(exp => {
    const totalAmount = exp.amount;
    const paidBy = exp.paidBy;
    const splitWith = exp.splitWith;
    
    if (splitWith.length === 0) return;
    
    const share = totalAmount / splitWith.length;
    
    // The person who paid gets credit for the full amount
    balances[paidBy] += totalAmount;
    
    // Everyone splitting owes their share
    splitWith.forEach(mId => {
      if (balances[mId] !== undefined) {
        balances[mId] -= share;
      }
    });
  });
  
  return balances;
}

export function simplifyDebts(members: Member[], expenses: Expense[]): SimplifiedDebt[] {
  const balancesObj = calculateBalances(members, expenses);
  
  // Convert map to array of tuples [id, balance]
  const balances = Object.entries(balancesObj).map(([id, balance]) => ({
    id,
    balance: Math.round(balance * 100) / 100
  }));
  
  const debtors = balances
    .filter(b => b.balance < -0.01)
    .sort((a, b) => a.balance - b.balance); // Most negative first
    
  const creditors = balances
    .filter(b => b.balance > 0.01)
    .sort((a, b) => b.balance - a.balance); // Most positive first
    
  const debts: SimplifiedDebt[] = [];
  
  let dIdx = 0;
  let cIdx = 0;
  
  // Work with copies to avoid mutating original values
  const debtorsCopy = debtors.map(d => ({ ...d }));
  const creditorsCopy = creditors.map(c => ({ ...c }));
  
  while (dIdx < debtorsCopy.length && cIdx < creditorsCopy.length) {
    const debtor = debtorsCopy[dIdx];
    const creditor = creditorsCopy[cIdx];
    
    const dueAmount = Math.min(Math.abs(debtor.balance), creditor.balance);
    
    if (dueAmount > 0.01) {
      debts.push({
        from: debtor.id,
        to: creditor.id,
        amount: Math.round(dueAmount * 100) / 100,
        category: 'Simplified Balance Adjustment'
      });
    }
    
    debtor.balance += dueAmount;
    creditor.balance -= dueAmount;
    
    if (Math.abs(debtor.balance) < 0.01) {
      dIdx++;
    }
    if (Math.abs(creditor.balance) < 0.01) {
      cIdx++;
    }
  }
  
  return debts;
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}
