'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Calendar, PieChart as PieIcon } from 'lucide-react';

const COLORS = ['#FF00F5', '#00D1FF', '#E0FF00', '#000000', '#FF6B6B', '#4ECDC4'];

export default function ReportPage() {
  const { data: groups = [] } = useQuery({ queryKey: ['groups'], queryFn: api.getGroups });
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const activeGroupId = selectedGroupId || groups[0]?.id || '';
  const activeGroup = groups.find((g) => g.id === activeGroupId);

  const { data: analytics } = useQuery({
    queryKey: ['analytics', activeGroupId],
    queryFn: () => api.getAnalytics(activeGroupId),
    enabled: !!activeGroupId,
  });

  const categoryData = Object.entries(analytics?.byCategory ?? {}).map(([name, value]) => ({
    name, value: Number(value),
  })).sort((a, b) => b.value - a.value);

  const monthData = Object.entries(analytics?.byMonth ?? {}).map(([month, value]) => ({
    month, value: Number(value),
  })).sort((a, b) => a.month.localeCompare(b.month));

  const totalSpend = analytics?.totalSpend ?? 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-black text-white p-8 border-[6px] border-black shadow-[12px_12px_0_0_rgba(255,0,245,1)]">
        <div className="flex items-center gap-2 text-xs text-[#00D1FF] font-mono font-black uppercase tracking-widest">
          <Calendar className="h-4 w-4" />
          Statement generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mt-3 uppercase">Ledger Report.</h2>
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

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Spend', value: formatCurrency(totalSpend, activeGroup?.currency) },
          { label: 'Transactions', value: String(analytics?.totalTransactions ?? 0) },
          { label: 'Categories', value: String(categoryData.length) },
          { label: 'Months Active', value: String(monthData.length) },
        ].map((stat) => (
          <div key={stat.label} className="brutalist-card p-5">
            <p className="text-[10px] font-black uppercase tracking-widest text-black/60">{stat.label}</p>
            <p className="text-2xl font-black font-mono mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category breakdown */}
        <div className="brutalist-card p-6 space-y-4">
          <div className="flex items-center justify-between border-b-2 border-black pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/60">Spending by Category</h3>
            <PieIcon className="h-5 w-5 text-[#FF00F5]" />
          </div>
          {categoryData.length === 0 ? (
            <p className="text-xs text-black/60 font-bold py-6 text-center uppercase">No data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#000" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatCurrency(v, activeGroup?.currency)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {categoryData.map((cat, i) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-black">
                      <span className="uppercase">{cat.name}</span>
                      <span className="font-mono">{formatCurrency(cat.value, activeGroup?.currency)}</span>
                    </div>
                    <div className="h-3 w-full bg-white border-2 border-black overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalSpend > 0 ? (cat.value / totalSpend) * 100 : 0}%` }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        className="h-full border-r-2 border-black"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Monthly trend */}
        <div className="brutalist-card p-6 space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-black/60 border-b-2 border-black pb-4">
            Monthly Spend Trend
          </h3>
          {monthData.length === 0 ? (
            <p className="text-xs text-black/60 font-bold py-6 text-center uppercase">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v, activeGroup?.currency)} />
                <Bar dataKey="value" fill="#FF00F5" stroke="#000" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
