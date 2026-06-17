import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X, Users, MessageSquareCode, Sparkles, Send, Coins, CheckSquare } from 'lucide-react';
import { Member } from '../types';
import { formatINR } from '../utils/finance';

interface RequestSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onAddExpense: (expense: { title: string; amount: number; paidBy: string; splitWith: string[]; category: string }) => void;
}

export default function RequestSplitModal({ isOpen, onClose, members, onAddExpense }: RequestSplitModalProps) {
  const [amount, setAmount] = useState('1200');
  const [description, setDescription] = useState('Starbucks Roastery & Brunch');
  const [shares, setShares] = useState<Record<string, number>>(() => {
    const initialShares: Record<string, number> = {};
    members.forEach(m => {
      initialShares[m.id] = 1; // 1 share initially (equal split weight)
    });
    return initialShares;
  });
  const [customEnabled, setCustomEnabled] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const parsedAmount = parseFloat(amount) || 0;
  const totalShares = (Object.values(shares) as number[]).reduce((sum, s) => sum + s, 0) || 1;

  const handleShareChange = (mId: string, value: number) => {
    setShares(prev => ({
      ...prev,
      [mId]: Math.max(0, value)
    }));
  };

  const handleSendRequest = () => {
    if (parsedAmount <= 0) return;

    // Filter members with non-zero shares
    const splitWith = members.filter(m => shares[m.id] > 0).map(m => m.id);
    if (splitWith.length === 0) return;

    onAddExpense({
      title: description.trim() || 'Split Group Request',
      amount: parsedAmount,
      paidBy: 'alex', // Alexis is the initiator
      splitWith: splitWith,
      category: 'Food'
    });

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 2200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative z-10 w-full max-w-lg overflow-hidden bg-white text-black border-[6px] border-black p-6 md:p-8 rounded-none shadow-[12px_12px_0_0_rgba(0,0,0,1)]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-5 top-5 border-2 border-black bg-[#FF00F5] text-white p-1 hover:bg-black hover:text-white transition-all cursor-pointer rounded-none"
            >
              <X className="h-4 w-4 font-black" />
            </button>

            {sentSuccess ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="relative mb-6 flex h-20 w-20 items-center justify-center bg-[#E5FF00] text-black border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] rounded-none">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute inset-[2px] border-2 border-dashed border-black"
                  />
                  <Send className="h-10 w-10 relative z-10" />
                </div>
                <h4 className="text-2xl font-black text-black font-sans tracking-tight uppercase italic">Split Sent!</h4>
                <p className="mt-2 max-w-sm text-xs font-bold text-black/75 leading-relaxed">
                  Calculated transaction shares. Group balances are being modified and an instant alert has been pushed to members' ledger feeds.
                </p>
                <div className="mt-6 font-mono text-[11px] font-black text-white bg-black border-2 border-black px-4 py-2 rounded-none">
                  Total split value: {formatINR(parsedAmount)}
                </div>
              </motion.div>
            ) : (
              <div>
                {/* Header */}
                <div className="flex items-center gap-2 border-b-4 border-black pb-4">
                  <div className="bg-[#E0FF00] border-2 border-black p-2 text-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic tracking-tighter text-black uppercase">Instant Split</h3>
                    <p className="text-xs text-black/60 font-bold mt-0.5">Apportion bill automatically with Weighted Ratio</p>
                  </div>
                </div>

                {/* Form fields */}
                <div className="mt-6 space-y-5">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#000000]/60">Short description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="mt-2 w-full border-3 border-black bg-white px-4 py-3 placeholder-black/45 text-black font-black text-sm focus:border-[#FF00F5] focus:outline-none rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-[#000000]/60">Bill Total (₹)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="mt-2 w-full border-3 border-black bg-white px-4 py-3 text-black font-black text-sm focus:border-[#FF00F5] focus:outline-none rounded-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black uppercase tracking-widest text-[#000000]/60">Split Method</label>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomEnabled(!customEnabled);
                          if (!customEnabled) {
                            const resetWeights: Record<string, number> = {};
                            members.forEach(m => {
                              resetWeights[m.id] = 1;
                            });
                            setShares(resetWeights);
                          }
                        }}
                        className={`mt-2 w-full border-3 border-black px-4 py-3 text-xs font-black uppercase tracking-wider transition-all rounded-none cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)] h-[47px] ${
                          customEnabled
                            ? 'bg-[#FF00F5] text-white'
                            : 'bg-white text-black hover:bg-black hover:text-[#E0FF00]'
                        }`}
                      >
                        {customEnabled ? 'Weighted Ratio/Shares' : 'Equal Split'}
                      </button>
                    </div>
                  </div>

                  {/* Weight shares scaling adjustment */}
                  <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-[#000000]/60 mb-2">
                      Ratio Distribution
                    </label>

                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {members.map(m => {
                        const mShare = (customEnabled ? (shares[m.id] ?? 1) : 1) as number;
                        const mAmount = parsedAmount > 0 
                          ? (parsedAmount * mShare) / (customEnabled ? (totalShares as number) : members.length) 
                          : 0;
                        return (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-none bg-white p-3 border-3 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] text-xs font-black uppercase"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-8 w-8 items-center justify-center border border-black text-xs font-black text-white ${m.color}`}>
                                {m.initial}
                              </div>
                              <span className="text-xs font-black text-black">
                                {m.name === 'Alex' ? 'Alex (You)' : m.name}
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              {customEnabled && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleShareChange(m.id, mShare - 1)}
                                    className="h-7 w-7 bg-white text-black border-2 border-black hover:bg-black hover:text-[#E0FF00] flex items-center justify-center text-sm font-black font-mono cursor-pointer rounded-none"
                                  >
                                    -
                                  </button>
                                  <span className="w-10 text-center text-xs font-black font-mono text-black bg-[#E1FF00] border border-black px-1 py-0.5 mx-1">
                                    {mShare}x
                                  </span>
                                  <button
                                    onClick={() => handleShareChange(m.id, mShare + 1)}
                                    className="h-7 w-7 bg-white text-black border-2 border-black hover:bg-black hover:text-[#E0FF00] flex items-center justify-center text-sm font-black font-mono cursor-pointer rounded-none"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                              <span className="text-xs font-black text-[#FF00F5] font-mono">
                                {formatINR(mAmount)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-4 border-t-3 border-black flex justify-end gap-3 z-10">
                    <button
                      type="button"
                      onClick={onClose}
                      className="rounded-none bg-white text-black border-3 border-black hover:bg-black hover:text-[#E5FF00] font-black px-5 py-3 text-xs uppercase cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSendRequest}
                      className="rounded-none bg-[#FF00F5] text-white border-3 border-black hover:bg-black hover:text-white font-black px-6 py-3 text-xs uppercase tracking-wider shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] flex items-center gap-2 cursor-pointer"
                    >
                      <Coins className="h-4 w-4" /> Trigger Split
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
