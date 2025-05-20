
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { AppHeader } from '@/components/layout/app-header';
import { MobileBottomNav } from '@/components/layout/mobile-bottom-nav';
import { Sidebar } from '@/components/layout/sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
          <div className="space-y-6">
            <Skeleton className="h-12 w-1/2" />
            <Skeleton className="h-40 rounded-lg bg-primary/20" /> 
            <div className="grid grid-cols-1 gap-4">
              <Skeleton className="h-20 rounded-lg" />
              <Skeleton className="h-20 rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-black text-white">
        <Sidebar />
        <div className="flex flex-col flex-1 lg:pl-64 w-full">
          <AppHeader />
          <main className={`flex-grow ${isDashboard ? 'p-0' : 'px-4 pt-4 pb-20 max-w-7xl mx-auto w-full'}`}>
            {children}
          </main>
          <MobileBottomNav />
        </div>
      </div>
    </SidebarProvider>
  );
}
