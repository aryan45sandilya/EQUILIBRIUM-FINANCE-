import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, RefreshCw, Sparkles, Coins, AlertCircle } from 'lucide-react';
import { Member } from '../types';
import { formatINR } from '../utils/finance';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSettle: (from: string, to: string, amount: number) => void;
  suggestedSettles: Array<{ from: string; to: string; amount: number }>;
}

export default function SettleUpModal({
  isOpen,
  onClose,
  members,
  onSettle,
  suggestedSettles
}: SettleUpModalProps) {
  const [fromId, setFromId] = useState('alex');
  const [toId, setToId] = useState('sarah');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsed = parseFloat(amount);
    if (fromId === toId) {
      setError('Cannot settle debts to yourself!');
      return;
    }
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please specify a positive settlement amount');
      return;
    }

    onSettle(fromId, toId, parsed);
    setAmount('');
    onClose();
  };

  const handleApplySuggested = (from: string, to: string, amt: number) => {
    onSettle(from, to, amt);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative z-10 w-full max-w-md overflow-hidden bg-white text-black border-[6px] border-black p-6 md:p-8 rounded-none shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
          >
            <button
              onClick={onClose}
              className="absolute right-5 top-5 border-2 border-black bg-[#FF00F5] text-white p-1 hover:bg-black hover:text-white transition-all cursor-pointer rounded-none"
            >
              <X className="h-4 w-4 font-black" />
            </button>

            <div className="flex items-center gap-2 border-b-4 border-black pb-4">
              <div className="bg-[#E0FF00] border-2 border-black p-2 text-black">
                <RefreshCw className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black italic tracking-tighter text-black uppercase">Settle Nodes</h3>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 border-3 border-black bg-[#FF00F5] p-3 text-xs text-white font-black uppercase">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Suggested Settle-Up list */}
            {suggestedSettles.length > 0 && (
              <div className="mt-5 space-y-2.5">
                <label className="block text-xs font-black uppercase tracking-widest text-black/60 mb-1">
                  Suggested Action Paths
                </label>
                {suggestedSettles.map((s, i) => {
                  const fromM = members.find(m => m.id === s.from);
                  const toM = members.find(m => m.id === s.to);
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 border-3 border-black bg-[#00D1FF] shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-xs font-black uppercase"
                    >
                      <span>
                        <strong className="text-black">{fromM?.id === 'alex' ? 'You' : fromM?.name}</strong> pay{' '}
                        <strong className="text-black">{toM?.id === 'alex' ? 'You' : toM?.name}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplySuggested(s.from, s.to, s.amount)}
                        className="bg-[#FF00F5] border-2 border-black hover:bg-black text-white px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Settle {formatINR(s.amount)}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-black/60">From</label>
                  <select
                    value={fromId}
                    onChange={e => setFromId(e.target.value)}
                    className="mt-2 w-full border-3 border-black bg-white px-4 py-3 text-black font-black text-xs focus:border-[#FF00F5] focus:outline-none rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name === 'Alex' ? 'Alex (You)' : m.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-black/60">To</label>
                  <select
                    value={toId}
                    onChange={e => setToId(e.target.value)}
                    className="mt-2 w-full border-3 border-black bg-white px-4 py-3 text-black font-black text-xs focus:border-[#FF00F5] focus:outline-none rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                  >
                    {members.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name === 'Alex' ? 'Alex (You)' : m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-black/60">Amount (₹)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="mt-2 w-full border-3 border-black bg-white px-4 py-3 text-black font-black text-sm focus:border-[#FF00F5] focus:outline-none rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                />
              </div>

              <div className="pt-4 border-t-3 border-black flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-none bg-white text-black border-3 border-black hover:bg-black hover:text-[#E0FF00] font-black px-5 py-3 text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-none bg-[#FF00F5] text-white border-3 border-black hover:bg-black hover:text-white font-black px-6 py-3 text-xs uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-1.5 cursor-pointer"
                >
                  <Coins className="h-4 w-4" /> Log Payment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
