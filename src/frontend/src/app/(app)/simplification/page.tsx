'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { Check, RefreshCw, CheckCircle2 } from 'lucide-react';
import { api, SimplifiedTransaction } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function SimplificationPage() {
  const qc = useQueryClient();
  const [resolvingKey, setResolvingKey] = useState<string | null>(null);

  // Use the backend /me endpoint — auth store user is null when using Clerk auth
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: api.getMe });

  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: api.getGroups });
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const activeGroupId = selectedGroupId || groups[0]?.id || '';

  const { data: debts = [], isLoading } = useQuery({
    queryKey: ['debts', activeGroupId],
    queryFn: () => api.getGroupDebts(activeGroupId),
    enabled: !!activeGroupId,
  });

  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const settleMutation = useMutation({
    mutationFn: ({ toId, amount }: { toId: string; amount: number }) =>
      api.createSettlement({ groupId: activeGroupId, toId, amount }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['debts', activeGroupId] });
      qc.invalidateQueries({ queryKey: ['debts'] });
      setResolvingKey(null);
    },
    onError: (err: Error) => {
      console.error('[settle] error:', err.message);
      setResolvingKey(null);
      alert(`Settlement failed: ${err.message}`);
    },
  });

  const handleSettle = (debt: SimplifiedTransaction, key: string) => {
    setResolvingKey(key);
    settleMutation.mutate({ toId: debt.toUserId, amount: debt.amount });
  };

  const totalVolume = debts.reduce((s, d) => s + d.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-black text-white p-8 border-[6px] border-black shadow-[12px_12px_0_0_rgb(255,0,245)]">
        <div className="flex items-center gap-1.5 text-xs text-[#E0FF00] font-mono font-black uppercase tracking-widest mb-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute h-full w-full rounded-full bg-[#E0FF00] opacity-75" />
            <span className="relative h-2.5 w-2.5 rounded-full bg-[#E0FF00]" />
          </span>
          Matrix Synced • Greedy Min-Cash-Flow Algorithm Active
        </div>
        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase">Debt Simplification.</h2>
        <p className="text-sm font-bold mt-3 text-white/90 max-w-xl">
          {debts.length} optimal settlement paths computed from {groups.length} group{groups.length !== 1 ? 's' : ''}.
          Total outstanding: <strong className="text-[#00D1FF]">{formatCurrency(totalVolume, activeGroup?.currency)}</strong>
        </p>
      </div>

      {/* Group selector */}
      {groups.length > 1 && (
        <div className="flex gap-3 flex-wrap">
          {groups.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGroupId(g.id)}
              className={`brutalist-btn py-2 ${activeGroupId === g.id ? 'bg-black text-[#E0FF00]' : 'bg-white text-black hover:bg-black hover:text-[#E0FF00]'}`}
            >
              {g.name}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Debt cards */}
        <section className="lg:col-span-7 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest px-1">Required Actions</h3>
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div className="brutalist-card p-12 text-center font-black uppercase text-sm">Computing...</div>
            ) : debts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="brutalist-card p-16 text-center">
                <CheckCircle2 className="h-12 w-12 text-[#FF00F5] mx-auto mb-3" />
                <h4 className="text-sm font-black uppercase">All Settled!</h4>
                <p className="text-xs mt-2 font-bold text-black/60">No outstanding balances in this group.</p>
              </motion.div>
            ) : (
              debts.map((debt, i) => {
                const key = `${debt.fromUserId}-${debt.toUserId}-${i}`;
                const isMe = debt.fromUserId === me?.id;
                const isResolving = resolvingKey === key;
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: i * 0.05 }}
                    className="brutalist-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                        {[debt.fromName, debt.toName].map((name, ni) => (
                          <div key={ni} className={`h-10 w-10 flex items-center justify-center border-2 border-black text-xs font-black text-white ${ni === 0 ? 'bg-[#FF00F5]' : 'bg-[#00D1FF] text-black'}`}>
                            {name[0]}
                          </div>
                        ))}
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase">
                          <strong className="text-[#FF00F5]">{isMe ? 'You' : debt.fromName}</strong>
                          {' → '}
                          <strong className="text-[#00D1FF]">{debt.toUserId === me?.id ? 'You' : debt.toName}</strong>
                        </h4>
                        <p className="text-[10px] text-black/60 font-black uppercase mt-0.5">Optimized Settlement Path</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black font-mono">{formatCurrency(debt.amount, activeGroup?.currency)}</span>
                      {isMe ? (
                        <button
                          onClick={() => handleSettle(debt, key)}
                          disabled={isResolving}
                          className={`brutalist-btn py-2 px-4 ${isResolving ? 'bg-black text-[#E0FF00]' : 'bg-[#FF00F5] text-white hover:bg-black'}`}
                        >
                          {isResolving ? <RefreshCw className="h-3 w-3 animate-spin inline mr-1" /> : null}
                          {isResolving ? 'Settling...' : 'Mark Paid'}
                        </button>
                      ) : (
                        <span className="brutalist-btn py-2 px-4 bg-white text-black/40 cursor-not-allowed text-[10px]">
                          Peer Settling
                        </span>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </section>

        {/* Algo explanation panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="brutalist-card p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/60">Optimization Metrics</h3>
            <div className="flex justify-between text-xs font-bold">
              <span>Pending Settlements</span>
              <span className="font-black font-mono">{debts.length}</span>
            </div>
            <div className="flex justify-between text-xs font-bold">
              <span>Total to Settle</span>
              <span className="font-black font-mono text-[#FF00F5]">{formatCurrency(totalVolume, activeGroup?.currency)}</span>
            </div>
          </div>

          <div className="brutalist-card-black p-6 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#E0FF00]">Algorithm: Greedy Min-Cash-Flow</h3>
            <div className="space-y-3 text-xs text-white/90 font-bold leading-relaxed">
              <div className="flex gap-2.5">
                <Check className="h-4 w-4 text-[#E0FF00] shrink-0 border-2 border-[#E0FF00] mt-0.5" />
                <p>Computes net balance per member across all expenses</p>
              </div>
              <div className="flex gap-2.5">
                <Check className="h-4 w-4 text-[#E0FF00] shrink-0 border-2 border-[#E0FF00] mt-0.5" />
                <p>Separates into creditors (net+) and debtors (net−)</p>
              </div>
              <div className="flex gap-2.5">
                <Check className="h-4 w-4 text-[#E0FF00] shrink-0 border-2 border-[#E0FF00] mt-0.5" />
                <p>Greedy match: largest creditor ↔ largest debtor each step</p>
              </div>
              <div className="flex gap-2.5">
                <Check className="h-4 w-4 text-[#E0FF00] shrink-0 border-2 border-[#E0FF00] mt-0.5" />
                <p>Produces at most N−1 transactions — provably optimal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
