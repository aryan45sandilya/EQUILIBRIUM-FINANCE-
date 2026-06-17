'use client';

import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  groupId: string;
  currency: string;
}

export function DebtPanel({ groupId, currency }: Props) {
  // Use the backend /me endpoint — auth store user is null when using Clerk auth
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: api.getMe });

  const { data: debts = [] } = useQuery({
    queryKey: ['debts', groupId],
    queryFn: () => api.getGroupDebts(groupId),
  });

  const myDebts = debts.filter((d) => d.fromUserId === me?.id || d.toUserId === me?.id);

  return (
    <div className="brutalist-card-black p-6 space-y-4">
      <h3 className="text-[10px] font-black uppercase tracking-widest text-[#E0FF00]">Your Balances</h3>

      {myDebts.length === 0 ? (
        <div className="flex items-center gap-2 text-xs font-bold text-white/70">
          <CheckCircle2 className="h-5 w-5 text-[#E0FF00]" />
          All settled up!
        </div>
      ) : (
        <div className="space-y-3">
          {myDebts.map((d, i) => {
            const isOwing = d.fromUserId === me?.id;
            return (
              <div key={i} className="flex items-center justify-between p-3 border-2 border-white/20 bg-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-white">
                  <span className={isOwing ? 'text-[#FF00F5]' : 'text-[#00D1FF]'}>
                    {isOwing ? `You → ${d.toName}` : `${d.fromName} → You`}
                  </span>
                </div>
                <span className="font-black font-mono text-sm text-white">
                  {formatCurrency(d.amount, currency)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <Link
        href="/simplification"
        className="w-full flex items-center justify-center gap-2 brutalist-btn bg-[#E0FF00] text-black hover:bg-white text-xs py-3"
      >
        Full Simplification <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
