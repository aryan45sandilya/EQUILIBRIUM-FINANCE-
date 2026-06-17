import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Calendar, DollarSign, Sparkles, Plus, AlertCircle } from 'lucide-react';
import { Member, Expense } from '../types';
import { formatINR } from '../utils/finance';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAdd: (expense: Omit<Expense, 'id'>) => void;
}

export default function AddExpenseModal({ isOpen, onClose, members, onAdd }: AddExpenseModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('alex');
  const [category, setCategory] = useState('Food');
  const [selectedSplit, setSelectedSplit] = useState<string[]>(members.map(m => m.id));
  const [error, setError] = useState('');

  const categories = ['Food', 'Housing', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Other'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount);
    if (!title.trim()) {
      setError('Please enter a description or title');
      return;
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }
    if (selectedSplit.length === 0) {
      setError('Please select at least one person to split with');
      return;
    }

    onAdd({
      title: title.trim(),
      amount: parsedAmount,
      paidBy,
      splitWith: selectedSplit,
      date: new Date().toISOString().split('T')[0],
      category
    });

    // Reset fields
    setTitle('');
    setAmount('');
    setPaidBy('alex');
    setCategory('Food');
    setSelectedSplit(members.map(m => m.id));
    onClose();
  };

  const toggleSplitUser = (mId: string) => {
    if (selectedSplit.includes(mId)) {
      setSelectedSplit(selectedSplit.filter(id => id !== mId));
    } else {
      setSelectedSplit([...selectedSplit, mId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedSplit.length === members.length) {
      setSelectedSplit([]);
    } else {
      setSelectedSplit(members.map(m => m.id));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="add-expense-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative z-10 w-full max-w-lg overflow-hidden bg-white text-black border-[6px] border-black p-6 md:p-8 rounded-none shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-4 border-black pb-4">
              <div className="flex items-center gap-2">
                <div className="bg-[#E0FF00] border-2 border-black p-2 text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black italic tracking-tighter text-black uppercase">Add Expense</h3>
              </div>
              <button
                onClick={onClose}
                className="border-2 border-black bg-[#FF00F5] text-white p-1 hover:bg-black hover:text-white transition-colors cursor-pointer rounded-none"
              >
                <X className="h-5 w-5 font-black" />
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 border-3 border-black bg-[#FF00F5] p-3 text-xs text-white font-black uppercase"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Category picker */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-black/60">Category</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`border-3 border-black text-xs font-black uppercase tracking-wide px-4 py-2 transition-all cursor-pointer rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${
                        category === cat
                          ? 'bg-[#E0FF00] text-black shadow-none translate-x-[1px] translate-y-[1px]'
                          : 'bg-white text-black hover:bg-black hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-[#000000]/60">What was this for?</label>
                <input
                  type="text"
                  placeholder="e.g. Fine Dining Table, Uber Cab, Hotel booking"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="mt-2 w-full border-3 border-black bg-white px-4 py-3.5 text-black font-black text-sm placeholder-black/40 focus:border-[#FF00F5] focus:outline-none rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                />
              </div>

              {/* Amount and Submitter Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#000000]/60">Total Amount (₹)</label>
                  <div className="relative mt-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-black">₹</span>
                    <input
                      type="number"
                      step="any"
                      placeholder="0.00"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      className="w-full border-3 border-black bg-white py-3.5 pl-8 pr-4 text-black font-black focus:border-[#FF00F5] focus:outline-none rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-[#000000]/60">Paid By</label>
                  <select
                    value={paidBy}
                    onChange={e => setPaidBy(e.target.value)}
                    className="mt-2 w-full border-3 border-black bg-white px-4 py-3.5 text-black font-black text-xs focus:border-[#FF00F5] focus:outline-none rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] h-[52px]"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name === 'Alex' ? 'Alex (You)' : m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Split select list */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-widest text-[#000000]/60">Split Share With</label>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs font-black uppercase text-[#FF00F5] hover:underline cursor-pointer"
                  >
                    {selectedSplit.length === members.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  {members.map(m => {
                    const isSelected = selectedSplit.includes(m.id);
                    return (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => toggleSplitUser(m.id)}
                        className={`flex items-center gap-3 border-3 border-black p-3 text-left transition-all rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)] cursor-pointer ${
                          isSelected
                            ? 'bg-[#00D1FF] text-black font-black'
                            : 'bg-white text-black hover:border-black'
                        }`}
                      >
                        <div className={`flex h-8 w-8 items-center justify-center border border-black text-xs font-black text-white shadow-sm ${m.color}`}>
                          {m.initial}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="truncate text-xs font-black">{m.name === 'Alex' ? 'You' : m.name}</p>
                          {isSelected && (
                            <p className="text-[10px] text-black font-black">
                              {amount ? formatINR(parseFloat(amount) / selectedSplit.length) : '₹0'}
                            </p>
                          )}
                        </div>
                        <div className={`h-5 w-5 border-2 border-black flex items-center justify-center rounded-none ${isSelected ? 'bg-black text-[#E0FF00] font-sans text-xs font-black' : 'bg-white'}`}>
                          {isSelected && '✓'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="pt-4 border-t-3 border-black flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-none bg-white text-black border-3 border-black hover:bg-black hover:text-[#E5FF00] font-black px-6 py-3.5 text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-none bg-[#FF00F5] text-white border-3 border-black hover:bg-black hover:text-white font-black px-7 py-3.5 text-xs uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4 font-black" /> Add to Ledger
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
