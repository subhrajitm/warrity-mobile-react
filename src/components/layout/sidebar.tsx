"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShieldCheck, 
  ShoppingBag, 
  Wrench, 
  Calendar, 
  UserCircle, 
  Settings,
  ChevronRight,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NavItemType { 
  href: string;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  subItems?: { href: string; label: string }[];
}

const navItems: NavItemType[] = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { 
    href: '/warranties', 
    label: 'Warranties', 
    icon: ShieldCheck,
    subItems: [
      { href: '/warranties/new', label: 'Add Warranty' },
      { href: '/warranties', label: 'All Warranties' }
    ]
  },
  { 
    href: '/products', 
    label: 'Products', 
    icon: ShoppingBag,
  },
  { 
    href: '/service', 
    label: 'Service', 
    icon: Wrench,
  },
  { 
    href: '/calendar', 
    label: 'Calendar', 
    icon: Calendar,
  },
  { 
    href: '/profile', 
    label: 'Profile', 
    icon: UserCircle,
  },
  { 
    href: '/settings', 
    label: 'Settings', 
    icon: Settings,
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Listen for custom toggle event from the header
  useEffect(() => {
    const handleToggleSidebar = () => {
      setMobileMenuOpen(prev => !prev);
    };
    
    // Add event listener
    document.addEventListener('toggle-sidebar', handleToggleSidebar);
    
    // Clean up
    return () => {
      document.removeEventListener('toggle-sidebar', handleToggleSidebar);
    };
  }, []);
  
  // Close sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleItem = (href: string) => {
    setOpenItems(prev => ({
      ...prev,
      [href]: !prev[href]
    }));
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="px-3 py-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.href} className="space-y-1">
              <div className="flex items-center">
                {item.subItems ? (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start text-white hover:bg-gray-800 rounded-md mb-1 transition-colors",
                      isActive(item.href) && "bg-gray-800 text-lime-400 font-medium"
                    )}
                    onClick={() => toggleItem(item.href)}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.label}
                    <ChevronRight 
                      className={cn(
                        "ml-auto h-4 w-4 transition-transform",
                        openItems[item.href] && "rotate-90"
                      )} 
                    />
                  </Button>
                ) : (
                  <Link href={item.href} className="w-full">
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-white hover:bg-gray-800 rounded-md mb-1 transition-colors",
                        isActive(item.href) && "bg-gray-800 text-lime-400 font-medium"
                      )}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )}
              </div>
              
              {item.subItems && openItems[item.href] && (
                <div className="ml-4 space-y-1">
                  {item.subItems.map((subItem) => (
                    <Link key={subItem.href} href={subItem.href} className="w-full">
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start pl-7 text-gray-300 hover:bg-gray-800 rounded-md text-sm transition-colors",
                          pathname === subItem.href && "bg-gray-800 text-lime-400 font-medium"
                        )}
                      >
                        {subItem.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden border-r border-gray-800 bg-black text-white h-screen w-64 fixed left-0 top-0 lg:block z-50">
        <div className="p-2 flex items-center border-b border-gray-800">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center mr-2">
            <ShieldCheck className="h-4 w-4 text-black" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            <span className="text-lime-400">War</span>rity
          </h2>
        </div>
        <ScrollArea className="h-[calc(100vh-44px)]">
          <SidebarContent />
        </ScrollArea>
      </aside>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        mobileMenuOpen ? "block" : "hidden"
      )}>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/80" 
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-black border-r border-gray-800 overflow-hidden">
          <div className="flex justify-between items-center p-2 border-b border-gray-800">
            <div className="flex items-center">
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center mr-2">
                <ShieldCheck className="h-4 w-4 text-black" />
              </div>
              <h2 className="text-lg font-bold tracking-tight text-white">
                <span className="text-lime-400">War</span>rity
              </h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="overflow-auto h-[calc(100vh-44px)]">
            <SidebarContent />
          </div>
        </div>
      </div>
    </>
  );
}
