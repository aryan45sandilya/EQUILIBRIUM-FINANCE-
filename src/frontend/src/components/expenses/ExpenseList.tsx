'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Compass } from 'lucide-react';
import { api, GroupMember } from '@/lib/api';
import { useUIStore } from '@/store/ui.store';
import { formatCurrency, formatDate } from '@/lib/utils';
import { getSocket } from '@/lib/socket';
import { AddExpenseModal } from './AddExpenseModal';

const CATEGORIES = ['All', 'Food', 'Housing', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

interface Props {
  groupId: string;
  currency: string;
  members: GroupMember[];
}

export function ExpenseList({ groupId, currency, members }: Props) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const addOpen = useUIStore((s) => s.addExpenseOpen);
  const setAddOpen = useUIStore((s) => s.setAddExpenseOpen);

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', groupId],
    queryFn: () => api.getExpenses(groupId),
  });

  // Real-time updates via Socket.IO
  useEffect(() => {
    const socket = getSocket();
    const invalidate = () => qc.invalidateQueries({ queryKey: ['expenses', groupId] });
    socket.on('expense:created', invalidate);
    socket.on('expense:updated', invalidate);
    socket.on('expense:deleted', invalidate);
    return () => {
      socket.off('expense:created', invalidate);
      socket.off('expense:updated', invalidate);
      socket.off('expense:deleted', invalidate);
    };
  }, [groupId, qc]);

  const deleteMutation = useMutation({
    mutationFn: api.deleteExpense,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['expenses', groupId] }),
  });

  const expenses = data?.expenses ?? [];
  const filtered = expenses.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || e.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="brutalist-card p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h3 className="text-xs font-black uppercase tracking-widest text-black/60">Active Ledger Log</h3>
        <div className="relative w-full md:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="brutalist-input pl-9 py-2.5 text-xs"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 border-b-2 border-black scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`brutalist-btn py-1.5 px-3 shrink-0 ${
              category === cat ? 'bg-black text-[#E0FF00]' : 'bg-white text-black hover:bg-black hover:text-[#E0FF00]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <p className="text-xs font-black uppercase text-center py-8 text-black/40">Loading...</p>
          ) : filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
              <Compass className="h-8 w-8 mx-auto mb-3 text-black/30" />
              <p className="text-xs font-black uppercase text-black/60">No matching expenses</p>
            </motion.div>
          ) : (
            filtered.map((exp, i) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center justify-between p-4 bg-white border-3 border-black shadow-brutalist-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-10 w-10 shrink-0 bg-[#E0FF00] border-2 border-black flex items-center justify-center">
                    <Compass className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-black tracking-tight group-hover:text-[#FF00F5] transition-colors truncate">
                      {exp.title}
                    </h4>
                    <p className="text-xs text-black/60 mt-0.5">
                      Paid by <strong className="text-black">{(exp as any).paid_by?.name ?? exp.paidBy?.name ?? 'Unknown'}</strong> · {((exp as any).expense_splits ?? exp.splits ?? []).length} people · {exp.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-black font-mono">{formatCurrency(exp.amount, currency)}</div>
                    <p className="text-[9px] text-[#FF00F5] font-black uppercase mt-0.5">{formatDate(exp.date)}</p>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(exp.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 border-2 border-black bg-[#FF00F5] text-white hover:bg-black transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={() => setAddOpen(true)}
        className="w-full py-4 border-4 border-dashed border-black bg-white hover:bg-black hover:text-[#E0FF00] text-xs font-black uppercase flex items-center justify-center gap-2 group cursor-pointer transition-all"
      >
        <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" /> Add Expense
      </button>

      <AddExpenseModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        groupId={groupId}
        members={members}
        currency={currency}
      />
    </div>
  );
}
