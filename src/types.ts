export interface Member {
  id: string;
  name: string;
  avatar: string;
  initial: string;
  color: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidBy: string; // Member ID
  splitWith: string[]; // Member IDs
  date: string;
  category: string;
  groupOnly?: boolean;
}

export interface SimplifiedDebt {
  from: string; // Member ID
  to: string; // Member ID
  amount: number;
  category: string;
}

export type TabType = 'dashboard' | 'groups' | 'simplification' | 'report';
