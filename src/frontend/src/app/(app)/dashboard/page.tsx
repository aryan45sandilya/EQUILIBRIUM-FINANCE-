'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, Plus, TrendingUp, RefreshCw, Layers, Receipt } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useUIStore } from '@/store/ui.store';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const setAddExpenseOpen = useUIStore((s) => s.setAddExpenseOpen);
  const setSettleUpOpen = useUIStore((s) => s.setSettleUpOpen);

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: api.getGroups,
  });

  // Aggregate balances across all groups
  const firstGroup = groups[0];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 brutalist-card p-8">
        <div>
          <h2 className="text-4xl font-black text-black tracking-tight font-sans italic uppercase">
            Welcome back, <span className="text-[#FF00F5] underline decoration-wavy">{user?.name?.split(' ')[0]}</span>
          </h2>
          <p className="text-sm font-bold mt-2 max-w-md leading-relaxed text-black">
            Your Equilibrium optimization engine is active. Debt simplification matrix is stable.
          </p>
        </div>
        <div className="bg-black text-[#E0FF00] p-5 border-4 border-black shadow-brutalist flex flex-col min-w-[220px] rotate-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#00D1FF]">Active Groups</span>
          <div className="text-4xl font-black font-mono mt-1 text-white">{groups.length}</div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#00D1FF] font-mono font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>Ledger nodes online</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4">Quick Actions</h3>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => {
              if (groups.length > 0) window.location.href = `/groups/${groups[0].id}`;
              else window.location.href = '/groups/new';
            }}
            className="flex flex-col items-center gap-3 p-6 brutalist-card hover:bg-black hover:text-[#E0FF00] group cursor-pointer text-center"
          >
            <div className="h-12 w-12 bg-[#FF00F5] text-white border-2 border-black flex items-center justify-center group-hover:bg-white group-hover:text-black">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Add Expense</span>
          </button>

          <Link href="/groups" className="flex flex-col items-center gap-3 p-6 brutalist-card hover:bg-black hover:text-[#E0FF00] group cursor-pointer text-center">
            <div className="h-12 w-12 bg-[#00D1FF] text-black border-2 border-black flex items-center justify-center group-hover:bg-white group-hover:text-black">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Groups</span>
          </Link>

          <button
            onClick={() => window.location.href = '/simplification'}
            className="flex flex-col items-center gap-3 p-6 brutalist-card hover:bg-black hover:text-[#E0FF00] group cursor-pointer text-center"
          >
            <div className="h-12 w-12 bg-[#E0FF00] text-black border-2 border-black flex items-center justify-center group-hover:bg-white group-hover:text-black">
              <RefreshCw className="h-6 w-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Settle Up</span>
          </button>
        </div>
      </div>

      {/* Groups list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-black">Your Groups</h3>
          <Link href="/groups/new" className="brutalist-btn bg-[#FF00F5] text-white hover:bg-black py-2">
            + New Group
          </Link>
        </div>

        {groups.length === 0 ? (
          <div className="brutalist-card p-12 text-center">
            <p className="text-sm font-black uppercase text-black/60">No groups yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <motion.div
                  whileHover={{ x: -2, y: -2 }}
                  className="brutalist-card p-6 cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-black text-base uppercase tracking-tight">{group.name}</h4>
                      {group.description && (
                        <p className="text-xs text-black/60 font-bold mt-0.5 line-clamp-1">{group.description}</p>
                      )}
                    </div>
                    <span className="text-[10px] font-black bg-black text-[#E0FF00] px-2 py-0.5 border border-black">
                      {group.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-black/60">{((group as any).group_members ?? group.members ?? []).length} members</span>
                    <span className="text-black/60">{group._count?.expenses ?? 0} expenses</span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
