'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import Link from 'next/link';
import { Plus, Compass } from 'lucide-react';
import { api } from '@/lib/api';

export default function GroupsPage() {
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: api.getGroups,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter">Groups.</h2>
          <p className="text-sm font-bold text-black/60 mt-1">{groups.length} active ledger nodes</p>
        </div>
        <Link href="/groups/new" className="brutalist-btn bg-[#FF00F5] text-white hover:bg-black flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Group
        </Link>
      </div>

      {isLoading ? (
        <div className="brutalist-card p-12 text-center font-black uppercase text-sm">Loading...</div>
      ) : groups.length === 0 ? (
        <div className="brutalist-card p-16 text-center">
          <Compass className="h-12 w-12 mx-auto mb-4 text-black/30" />
          <p className="font-black uppercase text-sm">No groups yet</p>
          <Link href="/groups/new" className="brutalist-btn bg-black text-[#E0FF00] mt-4 inline-flex">
            Create your first group
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group, i) => (
            <Link key={group.id} href={`/groups/${group.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="brutalist-card p-6 cursor-pointer h-full"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="h-12 w-12 bg-[#E0FF00] border-3 border-black flex items-center justify-center">
                    <Compass className="h-6 w-6" />
                  </div>
                  <span className="text-[10px] font-black bg-black text-[#E0FF00] px-2 py-0.5">{group.currency}</span>
                </div>
                <h3 className="font-black uppercase tracking-tight text-lg">{group.name}</h3>
                {group.description && (
                  <p className="text-xs text-black/60 font-bold mt-1 line-clamp-2">{group.description}</p>
                )}
                <div className="mt-4 pt-4 border-t-2 border-black flex justify-between text-xs font-bold text-black/60">
                  <span>{((group as any).group_members ?? group.members ?? []).length} members</span>
                  <span>{group._count?.expenses ?? 0} expenses</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
