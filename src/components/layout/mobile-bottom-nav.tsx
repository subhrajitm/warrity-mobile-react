"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShieldCheck, Plus, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemType { 
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export function MobileBottomNav() {
  const pathname = usePathname();
  
  const navItems: NavItemType[] = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/warranties', label: 'Warranties', icon: ShieldCheck },
    { href: '/products', label: 'Products', icon: ShoppingBag },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-gray-800 bg-black h-12">
      <div className="grid h-full grid-cols-5 items-center">
        {/* First 2 items */}
        {navItems.slice(0, 2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-0.5",
              isActive(item.href) ? "text-lime-400" : "text-gray-400 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-[9px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Central Add Button */}
        <div className="flex justify-center items-center">
          <Link
            href="/warranties/new"
            className="relative flex items-center justify-center">
            <div className="absolute -top-6 bg-lime-500 rounded-full p-3 shadow-lg border-2 border-black">
              <Plus className="h-5 w-5 text-black font-bold" />
            </div>
          </Link>
        </div>

        {/* Last 2 items */}
        {navItems.slice(2).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center space-y-0.5",
              isActive(item.href) ? "text-lime-400" : "text-gray-400 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="text-[9px] font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
