'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useUIStore } from '@/store/ui.store';
import { joinGroup, leaveGroup } from '@/lib/socket';
import { formatCurrency } from '@/lib/utils';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { MemberList } from '@/components/groups/MemberList';
import { DebtPanel } from '@/components/groups/DebtPanel';

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const setActiveGroup = useUIStore((s) => s.setActiveGroup);

  useEffect(() => {
    setActiveGroup(id);
    joinGroup(id);
    return () => { leaveGroup(id); setActiveGroup(null); };
  }, [id, setActiveGroup]);

  const { data: group } = useQuery({
    queryKey: ['group', id],
    queryFn: () => api.getGroup(id),
  });

  const { data: analytics } = useQuery({
    queryKey: ['analytics', id],
    queryFn: () => api.getAnalytics(id),
    enabled: !!id,
  });

  if (!group) return (
    <div className="brutalist-card p-12 text-center font-black uppercase text-sm">Loading...</div>
  );

  // Supabase returns group_members, normalize to members
  const members: any[] = (group as any).group_members ?? group.members ?? [];
  const totalSpend = analytics?.totalSpend ?? 0;

  // Normalize member shape for components
  const normalizedMembers = members.map((m: any) => ({
    id: m.id,
    role: m.role,
    user: m.user ?? { id: m.user_id, name: m.user_id, avatar: null },
  }));

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-black text-white p-8 border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(255,0,245,1)]">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E0FF00_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute top-4 right-4 text-xs font-black bg-black border-2 border-[#E0FF00] px-3 py-1 text-[#E0FF00]">
          LIVE LEDGER ACTIVE
        </div>
        <div className="relative z-10">
          <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#00D1FF] font-black">Group Destination File</span>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mt-1 uppercase">{group.name}</h2>
          <p className="text-xs text-[#E0FF00] mt-1 uppercase tracking-widest font-black">
            {group.currency} • {normalizedMembers.length} members active
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="brutalist-card p-6">
          <span className="text-[10px] uppercase font-black tracking-widest text-black/60">Total Spend</span>
          <div className="text-3xl font-black font-mono mt-2">{formatCurrency(totalSpend, group.currency)}</div>
        </div>
        <div className="brutalist-card-cyan p-6">
          <span className="text-[10px] uppercase font-black tracking-widest">Transactions</span>
          <div className="text-3xl font-black font-mono mt-2">{analytics?.totalTransactions ?? 0}</div>
        </div>
        <div className="bg-[#E0FF00] border-5 border-black shadow-brutalist p-6">
          <span className="text-[10px] uppercase font-black tracking-widest text-black/60">Members</span>
          <div className="text-3xl font-black font-mono mt-2">{normalizedMembers.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <MemberList group={{ ...group, members: normalizedMembers }} />
          <DebtPanel groupId={id} currency={group.currency} />
        </div>
        <div className="lg:col-span-8">
          <ExpenseList groupId={id} currency={group.currency} members={normalizedMembers} />
        </div>
      </div>
    </div>
  );
}
