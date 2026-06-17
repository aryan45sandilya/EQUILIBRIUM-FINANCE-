import React from 'react';
import { motion } from 'motion/react';
import { ArrowDownLeft, ArrowUpRight, Plus, HelpCircle, TrendingUp, Sparkles, Receipt, RefreshCw, Layers } from 'lucide-react';
import { Member, Expense } from '../types';
import { calculateBalances, formatINR } from '../utils/finance';

interface DashboardViewProps {
  members: Member[];
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onOpenRequestSplit: () => void;
  onOpenSettleUp: () => void;
  onTabChange: (tab: any) => void;
}

export default function DashboardView({
  members,
  expenses,
  onOpenAddExpense,
  onOpenRequestSplit,
  onOpenSettleUp,
  onTabChange
}: DashboardViewProps) {
  // Compute balances dynamically
  const balances = calculateBalances(members, expenses);
  
  // Alex's individual balance
  const alexBalance = balances['alex'] || 0;
  
  let receivable = 0;
  let payable = 0;
  
  if (alexBalance > 0) {
    receivable = alexBalance;
    payable = 0;
  } else {
    receivable = 0;
    payable = Math.abs(alexBalance);
  }

  // Calculate total outstanding volume
  const totalVolume = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Dynamic mock-stable efficiency based on transaction count
  const efficiency = Math.min(96, Math.max(68, 70 + (expenses.length % 5) * 4));

  return (
    <div className="space-y-8">
      {/* Welcome Message banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 brutalist-card-white p-8 rounded-none">
        <div>
          <h2 className="text-4xl font-black text-black tracking-tight font-sans italic uppercase">
            Welcome back, <span className="text-[#FF00F5] underline decoration-black decoration-wavy">Alex</span>
          </h2>
          <p className="text-sm text-black font-bold mt-2 max-w-md leading-relaxed">
            Your Equilibrium optimization engine has successfully resolved circular payment loops. Current matrix status is stable.
          </p>
        </div>
        
        {/* Total Net Balance Card */}
        <div className="bg-black text-[#E0FF00] p-5 border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] flex flex-col justify-center min-w-[220px] rotate-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-[#00D1FF]">Portfolio Net Worth</span>
          <div className="text-3xl font-black font-mono mt-1 text-white">
            {alexBalance >= 0 ? '+' : ''}{formatINR(alexBalance)}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#00D1FF] font-mono font-bold">
            <TrendingUp className="h-4 w-4" />
            <span>+12.4% vs last cycle</span>
          </div>
        </div>
      </div>

      {/* Bento balance cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Receivable Card */}
        <div 
          onClick={() => onTabChange('simplification')}
          className="group relative overflow-hidden brutalist-card-cyan rounded-none p-8 cursor-pointer"
        >
          <div className="absolute top-2 right-2 p-4 opacity-10 group-hover:scale-110 transition-transform text-black">
            <ArrowDownLeft className="h-28 w-28" />
          </div>

          <div className="flex justify-between items-start">
            <div className="bg-white p-3.5 border-3 border-black text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <ArrowDownLeft className="h-6 w-6 font-black" />
            </div>
            <span className="bg-black text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black">
              Receivable
            </span>
          </div>

          <div className="mt-8 relative z-10">
            <p className="text-xs font-black text-black uppercase tracking-wider">Total You Are Owed</p>
            <h3 className="mt-2 text-5xl font-black tracking-tighter text-black font-sans">
              {formatINR(receivable)}
            </h3>
            <p className="mt-2 text-xs font-bold text-black opacity-80 leading-relaxed">
              Fully optimized circular splitting paths automatically applied.
            </p>
          </div>
        </div>

        {/* Payable Card */}
        <div 
          onClick={() => onTabChange('simplification')}
          className="group relative overflow-hidden brutalist-card-pink rounded-none p-8 cursor-pointer text-white"
        >
          <div className="absolute top-2 right-2 p-4 opacity-10 group-hover:scale-110 transition-transform text-black">
            <ArrowUpRight className="h-28 w-28" />
          </div>

          <div className="flex justify-between items-start">
            <div className="bg-white p-3.5 border-3 border-black text-black shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
              <ArrowUpRight className="h-6 w-6 font-black" />
            </div>
            <span className="bg-black text-[#E0FF00] px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-[#E0FF00]">
              Payable
            </span>
          </div>

          <div className="mt-8 relative z-10">
            <p className="text-xs font-black text-white uppercase tracking-wider">Total You Owe</p>
            <h3 className="mt-2 text-5xl font-black tracking-tighter text-white font-sans">
              {formatINR(payable)}
            </h3>
            <p className="mt-2 text-xs font-bold text-white opacity-90 leading-relaxed">
              Verify outstanding debt nodes below to guarantee credit score stability.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Shortcuts Panel */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-widest text-black mb-4 px-1">Quick Ledger Actions</h3>
        <div className="grid grid-cols-3 gap-4 md:gap-6">
          <button 
            onClick={onOpenAddExpense}
            className="flex flex-col items-center gap-3 p-6 brutalist-card-white rounded-none hover:bg-black hover:text-[#E0FF00] group text-center cursor-pointer"
          >
            <div className="h-12 w-12 bg-[#FF00F5] text-white border-2 border-black flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <Plus className="h-6 w-6 font-black" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Add Expense</span>
          </button>

          <button 
            onClick={onOpenRequestSplit}
            className="flex flex-col items-center gap-3 p-6 brutalist-card-white rounded-none hover:bg-black hover:text-[#E0FF00] group text-center cursor-pointer"
          >
            <div className="h-12 w-12 bg-[#00D1FF] text-black border-2 border-black flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <Layers className="h-6 w-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Request Split</span>
          </button>

          <button 
            onClick={onOpenSettleUp}
            className="flex flex-col items-center gap-3 p-6 brutalist-card-white rounded-none hover:bg-black hover:text-[#E0FF00] group text-center cursor-pointer"
          >
            <div className="h-12 w-12 bg-[#E0FF00] text-black border-2 border-black flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              <RefreshCw className="h-6 w-6" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider">Settle Up</span>
          </button>
        </div>
      </div>

      {/* Monthly trends and details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Speedometer Donut chart */}
        <div className="lg:col-span-5 flex flex-col brutalist-card-white p-6 rounded-none">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-black">Optimization Matrix</h3>
            <HelpCircle className="h-4 w-4 text-black cursor-pointer hover:scale-110 transition-transform" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div id="donut-speedo" className="relative w-44 h-44">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Black solid track */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#000000"
                  strokeWidth="3.5"
                />
                {/* Active Neon magenta colored arc */}
                <motion.circle
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${efficiency}, 100` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="#FF00F5"
                  strokeWidth="3.8"
                  strokeLinecap="square"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[10px] font-black text-black uppercase tracking-widest">Efficiency</span>
                <span className="text-4xl font-extrabold text-black tracking-tighter mt-1">{efficiency}%</span>
                <span className="text-[9px] font-black text-white bg-black border border-black px-2 py-0.5 mt-2 rounded-none">
                  OPTIMIZED
                </span>
              </div>
            </div>

            <div className="flex justify-center gap-8 w-full mt-6">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-[#FF00F5] border-2 border-black" />
                <span className="text-xs font-black uppercase tracking-wider text-black">Settled Nodes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 bg-white border-2 border-black" />
                <span className="text-xs font-black uppercase tracking-wider text-black">Pending Clear</span>
              </div>
            </div>

            <div className="w-full mt-6 pt-5 border-t-2 border-black text-center">
              <p className="text-xs leading-relaxed font-bold text-black">
                <span className="text-[#FF00F5] font-black">EXCELLENT STATUS.</span> Multi-route splits are executing 12.4% faster than average benchmarks.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic transaction list snippet summary */}
        <div className="lg:col-span-7 brutalist-card-black p-6 rounded-none flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-white/20 pb-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-white italic">Recent Ledger Activity</h3>
              <button 
                onClick={() => onTabChange('groups')}
                className="text-xs font-black uppercase text-[#E0FF00] hover:underline"
              >
                View Feed
              </button>
            </div>

            <div className="divide-y divide-white/10 max-h-[220px] overflow-y-auto pr-1">
              {expenses.length === 0 ? (
                <p className="text-xs text-white/50 text-center py-6 font-bold uppercase">No transactions logged yet.</p>
              ) : (
                expenses.slice(0, 4).map(exp => {
                  const payingMember = members.find(m => m.id === exp.paidBy);
                  return (
                    <div key={exp.id} className="py-3 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-white border-2 border-black text-black flex items-center justify-center">
                          <Receipt className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#E0FF00] tracking-tight">
                            {exp.title}
                          </h4>
                          <p className="text-[11px] text-white/70">
                            Paid by <strong className="text-white">{payingMember?.name === 'Alex' ? 'You' : payingMember?.name}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-black text-white font-mono">{formatINR(exp.amount)}</span>
                        <p className="text-[9px] text-[#00D1FF] font-black uppercase tracking-wider mt-0.5">{exp.date}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/20">
            <button 
              onClick={() => onTabChange('report')}
              className="w-full py-4 bg-[#E0FF00] text-black border-2 border-black font-black text-xs uppercase tracking-widest hover:bg-white cursor-pointer active:translate-x-[2px] active:translate-y-[2px]"
            >
              Analyze Financial Ledger Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
