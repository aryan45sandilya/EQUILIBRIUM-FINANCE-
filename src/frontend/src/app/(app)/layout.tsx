'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileNav } from '@/components/layout/MobileNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSignedIn) router.replace('/sign-in');
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) return null;

  return (
    <div className="min-h-screen bg-[#E0FF00] pb-24 md:pb-0 relative">
      <div className="absolute top-10 left-10 w-96 h-96 border-[12px] border-black rounded-full opacity-10 pointer-events-none z-0" />
      <div className="absolute bottom-40 right-10 w-64 h-64 bg-black/5 rotate-12 pointer-events-none z-0" />
      <AppHeader />
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-8 pb-12 relative z-10">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
