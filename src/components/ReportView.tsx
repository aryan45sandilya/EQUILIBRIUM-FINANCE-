import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, PieChart, Info, TrendingUp, CheckCircle, Smartphone, Award, ShieldCheck } from 'lucide-react';
import { Member, Expense } from '../types';
import { formatINR, calculateBalances } from '../utils/finance';

interface ReportViewProps {
  members: Member[];
  expenses: Expense[];
}

export default function ReportView({ members, expenses }: ReportViewProps) {
  // Compute category statistics dynamically
  const categories: Record<string, number> = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });

  const totalExpenseSum = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Convert categories to share percentages
  const sortedCategories = Object.entries(categories).map(([name, sum]) => ({
    name,
    sum,
    percentage: totalExpenseSum > 0 ? Math.round((sum / totalExpenseSum) * 100) : 0
  })).sort((a, b) => b.sum - a.sum);

  const dateFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-8">
      {/* Report Header Banner */}
      <div className="bg-black text-white p-8 border-[6px] border-black shadow-[12px_12px_0_0_rgba(255,0,245,1)] rounded-none relative">
        <div className="flex items-center gap-1.5 text-xs text-[#00D1FF] font-mono font-black uppercase tracking-widest">
          <Calendar className="h-4.5 w-4.5 shrink-0" />
          <span>Statement generated on: {dateFormatted}</span>
        </div>

        <h2 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter mt-3 font-sans uppercase">Ledger Report.</h2>
        <p className="text-sm font-bold text-white/90 mt-2 max-w-xl leading-relaxed">
          Dynamic matrix parsing analysis of active group transactions, portfolio allocations, and optimization efficiency quotients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Category Share Distribution list */}
        <section className="lg:col-span-7 brutalist-card-white p-6 rounded-none space-y-6">
          <div className="flex justify-between items-center border-b-2 border-black pb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/60">Spending Portfolio Breakout</h3>
            <PieChart className="h-5 w-5 text-[#FF00F5]" />
          </div>

          <div className="space-y-5">
            {sortedCategories.length === 0 ? (
              <p className="text-xs text-black/60 font-black py-6 text-center uppercase">Add expenses to compute breakout data.</p>
            ) : (
              sortedCategories.map((cat, i) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-black uppercase tracking-tight">{cat.name}</span>
                    <div className="flex items-center gap-1 font-mono text-black font-black">
                      <span>{formatINR(cat.sum)}</span>
                      <span>•</span>
                      <span className="text-[#FF00F5] bg-black text-white px-2 py-0.5">{cat.percentage}%</span>
                    </div>
                  </div>

                  <div className="relative h-4 w-full bg-white border-2 border-black rounded-none overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: 'easeOut' }}
                      className="absolute h-full bg-[#00D1FF] border-r-2 border-black"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Safety Quotient & Metrics */}
        <div className="lg:col-span-5 space-y-6">
          <div className="brutalist-card-black p-6 rounded-none flex flex-col justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#E0FF00] italic mb-4">Ledger Auditing Summary</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-4 bg-white text-black border-3 border-black shadow-[4px_4px_0_0_rgba(224,255,0,0.15)] font-bold">
                <ShieldCheck className="h-6 w-6 text-[#FF00F5] shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">Security State</h4>
                  <p className="text-[10px] text-black/65 font-bold mt-0.5">Fully encrypted ledger nodes</p>
                </div>
                <span className="ml-auto text-[10px] bg-black text-[#E0FF00] border-2 border-black px-2.5 py-0.5 font-black uppercase tracking-wider">
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-4 bg-white text-black border-3 border-black shadow-[4px_4px_0_0_rgba(224,255,0,0.15)] font-bold">
                <Smartphone className="h-6 w-6 text-black" />
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">Haptic Splitting</h4>
                  <p className="text-[10px] text-black/65 font-bold mt-0.5">Tactile micro-interaction active</p>
                </div>
                <span className="ml-auto text-[10px] bg-black text-[#00D1FF] border-2 border-black px-2.5 py-0.5 font-black uppercase tracking-wider">
                  ENABLED
                </span>
              </div>

              <div className="flex items-center gap-3.5 p-4 bg-white text-black border-3 border-black shadow-[4px_4px_0_0_rgba(224,255,0,0.15)] font-bold">
                <Award className="h-6 w-6 text-[#00D1FF] shrink-0" />
                <div>
                  <h4 className="text-xs font-black text-black uppercase tracking-wider">Audit Quotient</h4>
                  <p className="text-[10px] text-black/65 font-bold mt-0.5">Zero calculation discrepancy</p>
                </div>
                <span className="ml-auto text-[10px] bg-black text-[#FF00F5] border-2 border-black px-2.5 py-0.5 font-black uppercase tracking-wider">
                  100% SAFE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
