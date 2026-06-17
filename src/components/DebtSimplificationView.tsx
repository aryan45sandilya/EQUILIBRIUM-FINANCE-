import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Info, Sparkles, RefreshCw, Layers, CheckCircle2, Milestone } from 'lucide-react';
import { Member, Expense, SimplifiedDebt } from '../types';
import { simplifyDebts, calculateBalances, formatINR } from '../utils/finance';

interface DebtSimplificationViewProps {
  members: Member[];
  expenses: Expense[];
  onSettleDebt: (from: string, to: string, amount: number) => void;
}

export default function DebtSimplificationView({
  members,
  expenses,
  onSettleDebt
}: DebtSimplificationViewProps) {
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  // Compute simplified debts dynamically
  const simplifiedDebts = simplifyDebts(members, expenses);

  // Calculate stats for the reduction metrics
  const totalVolumeRaw = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalVolumeSettlement = simplifiedDebts.reduce((sum, d) => sum + d.amount, 0);

  // Net reduction percentage
  const reductionPercent = totalVolumeRaw > 0 
    ? Math.max(0, Math.min(100, Math.round(((totalVolumeRaw - totalVolumeSettlement) / totalVolumeRaw) * 1000) / 10))
    : 0;

  const handleSettle = (fromId: string, toId: string, amount: number, idx: number) => {
    const key = `${fromId}-${toId}-${idx}`;
    setResolvingId(key);
    
    setTimeout(() => {
      onSettleDebt(fromId, toId, amount);
      setResolvingId(null);
    }, 800);
  };

  return (
    <div className="space-y-8">
      {/* Dynamic Sync banner header matching screenshot / design style */}
      <div className="bg-black text-white p-8 border-[6px] border-black shadow-[12px_12px_0_0_rgb(255,0,245)] rounded-none relative">
        <div className="flex items-center gap-1.5 text-xs text-[#E0FF00] font-mono font-black uppercase tracking-widest">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E0FF00] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#E0FF00]"></span>
          </span>
          <span>Matrix Synced • Last optimized: Just Now</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter mt-3 font-sans uppercase">Debt Simplification.</h2>
        <p className="text-sm font-bold leading-relaxed mt-3 text-white/90 max-w-xl">
          The algorithm has calculated all <strong className="text-[#00D1FF]">{expenses.length} transaction variables</strong> and nested them into just <strong className="text-[#00D1FF]">{simplifiedDebts.length} optimal clearance directions</strong>, mitigating circular transaction overheads by <strong className="text-[#E0FF00]">{reductionPercent}%</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Required Actions section */}
        <section className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#000000] mb-2 px-1">Required Actions</h3>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {simplifiedDebts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center p-12 text-center rounded-none brutalist-card-white py-16 text-black"
                >
                  <CheckCircle2 className="h-12 w-12 text-[#FF00F5] mb-3" />
                  <h4 className="text-sm font-black uppercase">Consolidation Matrix Settled</h4>
                  <p className="text-xs mt-2 max-w-xs leading-relaxed font-bold">
                    No action needed. All peer-to-peer and circular balance paths are fully satisfied!
                  </p>
                </motion.div>
              ) : (
                simplifiedDebts.map((d, index) => {
                  const debtor = members.find(m => m.id === d.from);
                  const creditor = members.find(m => m.id === d.to);
                  const keyId = `${d.from}-${d.to}-${index}`;
                  const isResolving = resolvingId === keyId;

                  if (!debtor || !creditor) return null;

                  return (
                    <motion.div
                      key={keyId}
                      initial={{ opacity: 0, scale: 0.95, y: 15 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ type: 'spring', duration: 0.4 }}
                      className="p-5 brutalist-card-white rounded-none flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                          <div className={`flex h-10 w-10 items-center justify-center border-2 border-black text-xs font-black text-white ring-2 ring-black ${debtor.color}`}>
                            {debtor.initial}
                          </div>
                          <div className="flex h-10 w-10 items-center justify-center bg-black border-2 border-black text-xs font-black text-[#E0FF00]">
                            →
                          </div>
                          <div className={`flex h-10 w-10 items-center justify-center border-2 border-black text-xs font-black text-white ring-2 ring-black ${creditor.color}`}>
                            {creditor.initial}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-black text-black uppercase tracking-tight">
                            <strong className="text-[#FF00F5]">{debtor.id === 'alex' ? 'You' : debtor.name}</strong> pay <strong className="text-[#00D1FF]">{creditor.id === 'alex' ? 'You' : creditor.name}</strong>
                          </h4>
                          <p className="text-[10px] text-black/60 font-black uppercase tracking-wider mt-1">
                            Circular Reduction Path
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 border-t border-black/10 pt-3 sm:border-0 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <span className="text-sm font-black font-mono text-black">
                            {formatINR(d.amount)}
                          </span>
                          <p className="text-[9px] text-[#FF00F5] font-black uppercase tracking-widest mt-0.5">Optimized Node</p>
                        </div>

                        {d.from === 'alex' ? (
                          <button
                            onClick={() => handleSettle(d.from, d.to, d.amount, index)}
                            disabled={isResolving}
                            className={`rounded-none px-4 py-3 text-xs font-black uppercase tracking-wider cursor-pointer border-3 border-black transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${
                              isResolving
                                ? 'bg-black text-[#E0FF05]'
                                : 'bg-[#FF00F5] text-white hover:bg-black hover:text-white'
                            }`}
                          >
                            {isResolving ? (
                              <span className="flex items-center gap-1.5 px-2">
                                <RefreshCw className="h-3 w-3 animate-spin" /> Settle
                              </span>
                            ) : (
                              'Mark as Paid'
                            )}
                          </button>
                        ) : (
                          <button
                            disabled
                            className="rounded-none bg-white text-black border-2 border-black font-black uppercase tracking-wider px-4 py-3 cursor-not-allowed opacity-60 text-[10px]"
                          >
                            Peer Settling
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Efficiency analytics side pane */}
        <div className="lg:col-span-5 space-y-6">
          {/* Efficiency card */}
          <div className="brutalist-card-white p-6 rounded-none space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/60 px-1">Optimization Metrics</h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-black/80">Raw Ledger Liquidity</span>
                <span className="font-mono text-black font-black">{formatINR(totalVolumeRaw)}</span>
              </div>

              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-black/80">Optimized Loop Liquidity</span>
                <span className="font-mono text-[#FF00F5] font-black">{formatINR(totalVolumeSettlement)}</span>
              </div>

              <div className="pt-3 border-t-3 border-black flex justify-between items-center text-xs">
                <span className="text-black font-black tracking-tight uppercase">Net Loop Reduction</span>
                <span className="font-black text-white bg-black border-2 border-black px-2 py-0.5 mt-0.5">
                  {reductionPercent}% SAVED
                </span>
              </div>

              <div className="mt-2 text-xs">
                <div className="relative h-4 w-full bg-white border-2 border-black rounded-none overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${reductionPercent}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="absolute h-full bg-[#FF00F5] border-r-2 border-black"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ledger Safeguards */}
          <div className="brutalist-card-black p-6 rounded-none space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#E0FF00] italic">Ledger Safeguards Matrix</h3>

            <div className="space-y-3 font-semibold text-xs leading-relaxed text-white">
              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-[#E0FF00] shrink-0 mt-0.5 border-2 border-[#E0FF00]" />
                <p><strong>Removes circular debts:</strong> Clears cyclical splits (A owes B owes C owes A) to reduce cash overheads.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-[#E0FF00] shrink-0 mt-0.5 border-2 border-[#E0FF00]" />
                <p><strong>Condenses transaction count:</strong> Groups separate smaller shared receipts to optimize payment workflows.</p>
              </div>

              <div className="flex items-start gap-2.5">
                <Check className="h-4 w-4 text-[#E0FF00] shrink-0 mt-0.5 border-2 border-[#E0FF00]" />
                <p><strong>Maintains balance safety:</strong> Locks net differences strictly respected inside of modern group variables.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
