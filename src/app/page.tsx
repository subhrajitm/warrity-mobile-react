"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ShieldCheck } from 'lucide-react'; // Or a custom loader

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/dashboard');
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary p-4">
      <div className="flex flex-col items-center space-y-4">
        <ShieldCheck className="h-24 w-24 text-primary animate-pulse" />
        <p className="text-xl font-semibold text-foreground">Loading Warrity...</p>
      </div>
    </div>
  );
}
