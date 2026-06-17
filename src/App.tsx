import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Compass, 
  ArrowLeftRight, 
  Activity, 
  Bell, 
  Menu, 
  Plus, 
  Coins, 
  HeartHandshake, 
  Info,
  Calendar
} from 'lucide-react';

import { TabType, Member, Expense } from './types';
import { MEMBERS, INITIAL_EXPENSES, simplifyDebts } from './utils/finance';

import DashboardView from './components/DashboardView';
import GroupsView from './components/GroupsView';
import DebtSimplificationView from './components/DebtSimplificationView';
import ReportView from './components/ReportView';

import AddExpenseModal from './components/AddExpenseModal';
import RequestSplitModal from './components/RequestSplitModal';
import SettleUpModal from './components/SettleUpModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('equilibrium_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [isSettleOpen, setIsSettleOpen] = useState(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('equilibrium_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Methods
  const handleAddExpense = (newExp: Omit<Expense, 'id'>) => {
    const id = `exp-${Date.now()}`;
    const expWithId: Expense = {
      ...newExp,
      id
    };
    setExpenses(prev => [expWithId, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const handleSettleDebt = (fromId: string, toId: string, amount: number) => {
    // To settle, we enter a positive payment of amount paid from fromId to toId, with split restricted to toId.
    // This perfectly offsets the balance between fromId and toId in the exact standard of a double-entry ledger.
    const settleExp: Expense = {
      id: `settle-${Date.now()}`,
      title: `Settle Balance Node`,
      amount,
      paidBy: fromId,
      splitWith: [toId],
      date: new Date().toISOString().split('T')[0],
      category: 'Settle-Up Adjustment'
    };
    setExpenses(prev => [settleExp, ...prev]);
  };

  // Compute calculated suggested settling paths for the modal
  const suggestedSettles = simplifyDebts(MEMBERS, expenses);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            members={MEMBERS}
            expenses={expenses}
            onOpenAddExpense={() => setIsAddOpen(true)}
            onOpenRequestSplit={() => setIsSplitOpen(true)}
            onOpenSettleUp={() => setIsSettleOpen(true)}
            onTabChange={setActiveTab}
          />
        );
      case 'groups':
        return (
          <GroupsView
            members={MEMBERS}
            expenses={expenses}
            onOpenAddExpense={() => setIsAddOpen(true)}
            onDeleteExpense={handleDeleteExpense}
          />
        );
      case 'simplification':
        return (
          <DebtSimplificationView
            members={MEMBERS}
            expenses={expenses}
            onSettleDebt={handleSettleDebt}
          />
        );
      case 'report':
        return <ReportView members={MEMBERS} expenses={expenses} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#E0FF00] text-black font-sans selection:bg-black selection:text-[#E0FF00] pb-28 md:pb-12 antialiased relative">
      {/* Decorative Brutalist Background Shapes */}
      <div className="absolute top-10 left-10 w-96 h-96 border-[12px] border-black rounded-full opacity-10 pointer-events-none z-0"></div>
      <div className="absolute bottom-40 right-10 w-64 h-64 bg-black/5 rotate-12 pointer-events-none z-0"></div>

      {/* Top Main Navigation Shell Header */}
      <header className="sticky top-0 z-40 bg-white border-b-6 border-black flex items-center justify-between px-6 py-4 shadow-[0_6px_0_0_rgba(0,0,0,1)] text-black">
        <div 
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-3 cursor-pointer group z-10"
        >
          <div className="h-10 w-10 overflow-hidden border-3 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
            <img 
              alt="Alex Finland Fins" 
              className="object-cover h-full w-full"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7U-UrKpJZzP7yjmzOxJ9vm7Q9Z6gZIul179u7nz2cvYaJWaPUcCrrYQcXAb5sfg4-MBRwEkg0cAoMr5PuGHXQhWoSszTyBoizaGz8lc7uuB3NB7xt81a7c6lkfRLApB3zUCzOznENAwkm0O2iK-Dfj8QUQ1XShsatserpBJ6ZUbZpQmaokQhM1eKM8JBiBfBiq7pGgrT_YWUlzzpByNjU7tM4G5D2HtTaAut94MaJ5hJ1ke5PEVQv" 
            />
          </div>
          <span className="font-sans font-black text-2xl tracking-tighter text-black select-none italic uppercase">
            Equilibrium<span className="text-[#FF00F5] font-black text-xs ml-1 tracking-widest bg-black rounded-none px-2 py-1 not-italic">V.4.0.2</span>
          </span>
        </div>

        {/* Desktop navbar links */}
        <div className="hidden md:flex items-center gap-4 z-10">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'groups', label: 'Europe Trip 2024', icon: Compass },
            { id: 'simplification', label: 'Friends Repayments', icon: ArrowLeftRight },
            { id: 'report', label: 'Report Matrix', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer py-2 px-4 border-3 ${
                  isSelected 
                    ? 'bg-black text-[#E0FF00] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]' 
                    : 'bg-white text-black border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-black hover:text-[#E0FF00]'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Action icons status bar */}
        <div className="flex items-center gap-3 z-10">
          <button className="relative p-2.5 border-3 border-black bg-white text-black hover:bg-black hover:text-[#E0FF00] shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF00F5] border border-black" />
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="hidden md:flex items-center gap-2 bg-[#FF00F5] text-white border-3 border-black text-xs font-black uppercase tracking-wider px-5 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Add Expense
          </button>
        </div>
      </header>

      {/* Main Content Layout Container */}
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-16 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Contextual Floating Add Button for Mobile users */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsAddOpen(true)}
        className="md:hidden fixed bottom-24 right-6 h-14 w-14 bg-[#FF00F5] text-white rounded-none border-4 border-black flex items-center justify-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-40 cursor-pointer focus:outline-none"
      >
        <Plus className="h-6 w-6 font-black" />
      </motion.button>

      {/* Bottom navbar mobile tabs */}
      <nav className="md:hidden fixed bottom-0 w-full z-45 py-3.5 px-3 bg-white border-t-6 border-black shadow-[0_-6px_0_0_rgba(0,0,0,1)] flex justify-around items-center">
        {[
          { id: 'dashboard', label: 'Home', icon: Home },
          { id: 'groups', label: 'Groups', icon: Compass },
          { id: 'simplification', label: 'Simplification', icon: ArrowLeftRight },
          { id: 'report', label: 'Report', icon: Activity }
        ].map(item => {
          const Icon = item.icon;
          const isSelected = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`flex flex-col items-center justify-center gap-1 bg-transparent transition-all cursor-pointer ${
                isSelected 
                  ? 'text-[#FF00F5] scale-[1.05] font-black' 
                  : 'text-black'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-black tracking-tight uppercase">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Modal overlays declarations */}
      <AddExpenseModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        members={MEMBERS}
        onAdd={handleAddExpense}
      />

      <RequestSplitModal
        isOpen={isSplitOpen}
        onClose={() => setIsSplitOpen(false)}
        members={MEMBERS}
        onAddExpense={handleAddExpense}
      />

      <SettleUpModal
        isOpen={isSettleOpen}
        onClose={() => setIsSettleOpen(false)}
        members={MEMBERS}
        onSettle={handleSettleDebt}
        suggestedSettles={suggestedSettles}
      />
    </div>
  );
}
