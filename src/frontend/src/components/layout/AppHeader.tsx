'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, ArrowLeftRight, Activity, Plus, Coins } from 'lucide-react';
import { UserButton } from '@clerk/nextjs';
import { useUIStore } from '@/store/ui.store';
import { NotificationBell } from './NotificationBell';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/groups', label: 'Groups', icon: Compass },
  { href: '/simplification', label: 'Simplification', icon: ArrowLeftRight },
  { href: '/report', label: 'Report', icon: Activity },
];

export function AppHeader() {
  const pathname = usePathname();
  const setAddExpenseOpen = useUIStore((s) => s.setAddExpenseOpen);

  return (
    <header className="sticky top-0 z-40 bg-white border-b-[6px] border-black flex items-center justify-between px-6 py-4 shadow-[0_6px_0_0_rgba(0,0,0,1)]">
      <Link href="/dashboard" className="flex items-center gap-3 group">
        <div className="h-10 w-10 bg-black border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0_0_rgba(0,0,0,1)] group-hover:scale-105 transition-transform">
          <Coins className="h-5 w-5 text-[#E0FF00]" />
        </div>
        <span className="font-sans font-black text-2xl tracking-tighter text-black italic uppercase">
          Equilibrium
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider py-2 px-4 border-[3px] border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all ${
                active ? 'bg-black text-[#E0FF00]' : 'bg-white text-black hover:bg-black hover:text-[#E0FF00]'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setAddExpenseOpen(true)}
          className="hidden md:flex items-center gap-2 bg-[#FF00F5] text-white border-[3px] border-black text-xs font-black uppercase tracking-wider px-5 py-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-black transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
        <NotificationBell />
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
