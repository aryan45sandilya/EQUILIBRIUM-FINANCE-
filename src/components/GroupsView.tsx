import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Trash2, Calendar, User, Compass, Info, Plus, Sparkles, Check, CheckCircle2 } from 'lucide-react';
import { Member, Expense } from '../types';
import { calculateBalances, formatINR } from '../utils/finance';

interface GroupsViewProps {
  members: Member[];
  expenses: Expense[];
  onOpenAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
}

export default function GroupsView({
  members,
  expenses,
  onOpenAddExpense,
  onDeleteExpense
}: GroupsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Compute live balances dynamically
  const balances = calculateBalances(members, expenses);
  const alexBalance = balances['alex'] || 0;

  // Calculate statistics
  const totalGroupSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Filter Categories
  const categories = ['All', 'Food', 'Housing', 'Transport', 'Entertainment', 'Shopping', 'Utilities'];

  // Filtered expenses list
  const filteredExpenses = expenses.filter(exp => {
    const matchesSearch = exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          exp.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Group Hero Banner with luxurious deep gradient and modern travel card vibe */}
      <div className="relative overflow-hidden bg-black text-white p-8 border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(255,0,245,1)] rounded-none relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#E0FF00_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="absolute top-4 right-4 text-xs font-black tracking-widest text-[#E0FF00] bg-black border-2 border-[#E0FF00] px-3 py-1 font-bold">
          LIVE LEDGER ACTIVE
        </div>

        <div className="relative z-10">
          <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#00D1FF] font-black">Group Destination File</span>
          <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter mt-1 font-sans uppercase">Europe Trip 2024.</h2>
          <p className="text-xs text-[#E0FF00] mt-1 uppercase tracking-widest font-black">
            International Ledger Base • {members.length} member profiles active
          </p>
        </div>
      </div>

      {/* Bento Stats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="brutalist-card-white rounded-none p-6 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-black tracking-widest text-black/60">Total Group Spend</span>
          <span className="text-3xl font-black text-black mt-2 font-mono">
            {formatINR(totalGroupSpend)}
          </span>
          <p className="text-[10px] text-black font-bold mt-2">Aggregate group transaction pools</p>
        </div>

        <div className={`brutalist-card-white rounded-none p-6 flex flex-col justify-between ${
          alexBalance >= 0 ? '!bg-[#00D1FF]' : '!bg-[#FF00F5] !text-white'
        }`}>
          <span className="text-[10px] uppercase font-black tracking-widest opacity-85">Your Net Balance</span>
          <span className="text-3xl font-black mt-2 font-mono">
            {alexBalance >= 0 ? '+' : ''}{formatINR(alexBalance)}
          </span>
          <p className="text-[10px] font-bold mt-2">
            {alexBalance >= 0 ? 'You are net owed by peer members' : 'You currently owe other peers'}
          </p>
        </div>

        <div className="bg-[#E0FF00] text-black border-[5px] border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-none p-6 flex flex-col justify-between">
          <span className="text-[10px] uppercase font-black tracking-widest text-black/60">Active Since</span>
          <span className="text-3xl font-black text-black mt-2 font-sans italic">June 12, 2026</span>
          <p className="text-[10px] text-black font-bold mt-2">Cycle initialization timestamp</p>
        </div>
      </div>

      {/* Main split-view layout content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Member list sidebar */}
        <div className="lg:col-span-4 brutalist-card-white p-6 rounded-none space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/60">Member Accounts</h3>
            <span className="text-[9px] font-black text-[#FF00F5] bg-black border border-black px-2 py-0.5">MATRIX ONLINE</span>
          </div>

          <div className="space-y-4">
            {members.map(m => {
              const bal = balances[m.id] || 0;
              const isSettled = Math.abs(bal) < 0.1;
              const isOwed = bal > 0.09;

              return (
                <div 
                  key={m.id}
                  className="flex items-center justify-between p-4 bg-white border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center border-2 border-black font-black text-xs text-white ${m.color}`}>
                      {m.initial}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-black">
                        {m.name === 'Alex' ? 'Alex (You)' : m.name}
                      </h4>
                      <p className="text-[10px] font-bold text-black/60 mt-0.5">
                        {isSettled ? 'Fully settled up' : isOwed ? 'Is owed funds' : 'Owes funds'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`text-xs font-black font-mono ${isSettled ? 'text-black/40' : isOwed ? 'text-black font-black bg-[#00D1FF] px-2 py-0.5 border border-black' : 'text-white font-black bg-[#FF00F5] px-2 py-0.5 border border-black'}`}>
                      {isSettled ? '₹0.00' : `${bal > 0 ? '+' : ''}${formatINR(bal)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expenses Feed list main section */}
        <div className="lg:col-span-8 brutalist-card-white p-6 rounded-none space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-black/60">Active Ledger Log</h3>
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
                <input
                  type="text"
                  placeholder="Search ledger entries..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="rounded-none border-3 border-black bg-white text-xs py-2.5 pl-9 pr-4 text-black font-bold focus:border-[#FF00F5] focus:outline-none w-full transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] focus:shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                />
              </div>
            </div>
          </div>

          {/* Categories Pill toggler */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 border-b-2 border-black scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`border-3 border-black text-[11px] font-black uppercase tracking-wide px-4 py-2 shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-black text-[#E0FF00] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                    : 'bg-white text-black hover:bg-black hover:text-[#E0FF00] shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Expenses list cards */}
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {filteredExpenses.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center text-black/60"
                >
                  <Search className="h-8 w-8 text-black mb-3" />
                  <p className="text-xs font-bold uppercase">No matching ledger items found.</p>
                </motion.div>
              ) : (
                filteredExpenses.map((exp, i) => {
                  const m = members.find(m => m.id === exp.paidBy);
                  return (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 bg-white border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        {/* Circle avatar badge or custom icon placeholder */}
                        <div className="h-10 w-10 shrink-0 bg-[#E0FF00] border-2 border-black flex items-center justify-center text-black font-black">
                          <Compass className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-black text-black tracking-tight group-hover:text-[#FF00F5] transition-colors truncate">
                            {exp.title}
                          </h4>
                          <p className="text-xs text-black/70 mt-0.5">
                            Paid by <strong className="text-black">{m?.name === 'Alex' ? 'You' : m?.name}</strong> • Split with {exp.splitWith.length} peers
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-black font-mono text-black">
                            {formatINR(exp.amount)}
                          </div>
                          <p className="text-[9px] text-[#FF00F5] font-black uppercase mt-0.5">{exp.date}</p>
                        </div>
                        
                        {/* Inline Delete trigger */}
                        <button
                          onClick={() => onDeleteExpense(exp.id)}
                          className="p-2 border-2 border-black bg-[#FF00F5] text-white hover:bg-black hover:text-[#FF00F5] transition-all cursor-pointer shadow-[2px_2px_0_0_rgba(0,0,0,1)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="w-full mt-2 py-4 border-4 border-dashed border-black bg-white hover:bg-black hover:text-[#E0FF00] text-xs font-black uppercase tracking-wider text-black transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <Plus className="h-4 w-4 group-hover:scale-110 transition-transform" /> Add New Ledger Expense
          </button>
        </div>
      </div>
    </div>
  );
}
