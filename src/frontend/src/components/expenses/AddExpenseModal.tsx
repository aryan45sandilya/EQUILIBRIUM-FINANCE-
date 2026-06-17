'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, AlertCircle, Sparkles } from 'lucide-react';
import { api, GroupMember, CreateExpensePayload } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const CATEGORIES = ['Food', 'Housing', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other'];
const SPLIT_TYPES = ['EQUAL', 'PERCENTAGE', 'EXACT', 'SHARES'] as const;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  members: GroupMember[];
  currency: string;
}

export function AddExpenseModal({ isOpen, onClose, groupId, members, currency }: Props) {
  const qc = useQueryClient();

  const defaultPaidBy = members[0]?.user?.id ?? '';

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'Food',
    splitType: 'EQUAL' as const,
    paidById: defaultPaidBy,
    notes: '',
  });
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    members.map((m) => m.user.id).filter(Boolean)
  );
  const [error, setError] = useState('');

  const mutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => api.createExpense(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['expenses', groupId] });
      qc.invalidateQueries({ queryKey: ['debts', groupId] });
      qc.invalidateQueries({ queryKey: ['analytics', groupId] });
      handleClose();
    },
    onError: (err: Error) => setError(err.message),
  });

  const handleClose = () => {
    setForm({ title: '', amount: '', category: 'Food', splitType: 'EQUAL', paidById: defaultPaidBy, notes: '' });
    setSelectedMembers(members.map((m) => m.user.id).filter(Boolean));
    setError('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const amount = parseFloat(form.amount);
    if (!form.title.trim()) { setError('Title is required'); return; }
    if (!amount || amount <= 0) { setError('Enter a valid amount'); return; }

    const validMembers = selectedMembers.filter(Boolean);
    if (validMembers.length === 0) { setError('Select at least one member'); return; }

    console.log('[AddExpenseModal] members prop:', members);
    console.log('[AddExpenseModal] selectedMembers:', selectedMembers);
    console.log('[AddExpenseModal] validMembers (will be in splits):', validMembers);
    console.log('[AddExpenseModal] paidById:', form.paidById);

    const share = Math.round((amount / validMembers.length) * 100) / 100;
    mutation.mutate({
      groupId,
      title: form.title.trim(),
      amount,
      currency,
      category: form.category,
      splitType: form.splitType,
      paidById: form.paidById || members[0]?.user?.id || '',
      notes: form.notes || undefined,
      splits: validMembers.map((userId) => ({ userId, amount: share })),
    });
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative z-10 w-full max-w-lg bg-white border-[6px] border-black p-6 md:p-8 shadow-[12px_12px_0_0_rgba(0,0,0,1)] max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b-4 border-black pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-[#E0FF00] border-2 border-black p-2">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Add Expense</h3>
              </div>
              <button onClick={handleClose} className="border-2 border-black bg-[#FF00F5] text-white p-1 hover:bg-black cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 bg-[#FF00F5] border-3 border-black p-3 text-white text-xs font-black uppercase">
                <AlertCircle className="h-4 w-4 shrink-0" />{error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Category */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button type="button" key={cat}
                      onClick={() => setForm({ ...form, category: cat })}
                      className={`border-3 border-black text-xs font-black uppercase px-3 py-1.5 cursor-pointer ${form.category === cat ? 'bg-[#E0FF00] text-black' : 'bg-white text-black hover:bg-black hover:text-white'}`}
                    >{cat}</button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">Description</label>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Dinner, hotel, taxi..." className="border-3 border-black bg-white px-4 py-3 font-bold text-sm focus:border-[#FF00F5] focus:outline-none rounded-none w-full" required />
              </div>

              {/* Amount + Paid By */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2">Amount ({currency})</label>
                  <input type="number" step="any" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00" className="border-3 border-black bg-white px-4 py-3 font-bold text-sm focus:border-[#FF00F5] focus:outline-none rounded-none w-full" required />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest mb-2">Paid By</label>
                  <select value={form.paidById} onChange={(e) => setForm({ ...form, paidById: e.target.value })}
                    className="border-3 border-black bg-white px-4 py-3 font-bold text-xs focus:border-[#FF00F5] focus:outline-none rounded-none w-full h-[50px]">
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Split type */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest mb-2">Split Type</label>
                <div className="flex gap-2 flex-wrap">
                  {SPLIT_TYPES.map((t) => (
                    <button type="button" key={t}
                      onClick={() => setForm({ ...form, splitType: t })}
                      className={`border-3 border-black text-xs font-black uppercase px-3 py-1.5 cursor-pointer ${form.splitType === t ? 'bg-black text-[#E0FF00]' : 'bg-white text-black hover:bg-black hover:text-[#E0FF00]'}`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {/* Member selection */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs font-black uppercase tracking-widest">Split With</label>
                  <button type="button" onClick={() => setSelectedMembers(
                    selectedMembers.length === members.length ? [] : members.map((m) => m.user.id).filter(Boolean)
                  )} className="text-xs font-black text-[#FF00F5] hover:underline cursor-pointer">
                    {selectedMembers.length === members.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {members.map((m) => {
                    if (!m.user.id) return null;
                    const selected = selectedMembers.includes(m.user.id);
                    const count = selectedMembers.filter(Boolean).length;
                    const share = form.amount && count > 0
                      ? formatCurrency(parseFloat(form.amount) / count, currency)
                      : null;
                    return (
                      <button type="button" key={m.user.id}
                        onClick={() => toggleMember(m.user.id)}
                        className={`flex items-center gap-3 border-3 border-black p-3 text-left cursor-pointer ${selected ? 'bg-[#00D1FF]' : 'bg-white hover:bg-gray-50'}`}
                      >
                        <div className="h-8 w-8 bg-black text-[#E0FF00] border border-black flex items-center justify-center text-xs font-black shrink-0">
                          {m.user.name?.[0] ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black truncate">{m.user.name}</p>
                          {selected && share && <p className="text-[10px] font-bold">{share}</p>}
                        </div>
                        <div className={`h-5 w-5 border-2 border-black flex items-center justify-center text-xs font-black ${selected ? 'bg-black text-[#E0FF00]' : 'bg-white'}`}>
                          {selected ? '✓' : ''}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t-3 border-black flex justify-end gap-3">
                <button type="button" onClick={handleClose} className="border-3 border-black font-black uppercase text-xs px-5 py-3 bg-white hover:bg-black hover:text-[#E0FF00] cursor-pointer">Cancel</button>
                <button type="submit" disabled={mutation.isPending}
                  className="border-3 border-black font-black uppercase text-xs px-6 py-3 bg-[#FF00F5] text-white hover:bg-black flex items-center gap-2 cursor-pointer shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <Plus className="h-4 w-4" /> {mutation.isPending ? 'Adding...' : 'Add to Ledger'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
