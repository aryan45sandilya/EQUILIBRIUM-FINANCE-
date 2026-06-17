'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, ArrowLeftRight, Activity } from 'lucide-react';

const ITEMS = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/groups', label: 'Groups', icon: Compass },
  { href: '/simplification', label: 'Simplify', icon: ArrowLeftRight },
  { href: '/report', label: 'Report', icon: Activity },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 w-full z-40 py-3.5 px-3 bg-white border-t-6 border-black shadow-[0_-6px_0_0_rgba(0,0,0,1)] flex justify-around">
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 transition-all ${
              active ? 'text-[#FF00F5] scale-105' : 'text-black'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-black uppercase">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
