import { create } from 'zustand';

interface UIState {
  activeGroupId: string | null;
  setActiveGroup: (id: string | null) => void;
  addExpenseOpen: boolean;
  setAddExpenseOpen: (v: boolean) => void;
  settleUpOpen: boolean;
  setSettleUpOpen: (v: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeGroupId: null,
  setActiveGroup: (id) => set({ activeGroupId: id }),
  addExpenseOpen: false,
  setAddExpenseOpen: (v) => set({ addExpenseOpen: v }),
  settleUpOpen: false,
  setSettleUpOpen: (v) => set({ settleUpOpen: v }),
}));
