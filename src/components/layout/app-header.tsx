
"use client";

import React from 'react';
import Link from 'next/link';
import { UserCircle, LogOut, Settings, Menu } from 'lucide-react'; 
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from 'next/navigation';

export function AppHeader() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const isDashboard = pathname === '/dashboard';
  const pageName = getPageName(pathname);
  
  // Function to toggle the mobile sidebar
  const toggleMobileSidebar = () => {
    // Using a custom event to communicate with the sidebar component
    const event = new CustomEvent('toggle-sidebar');
    document.dispatchEvent(event);
  };

  // Get current time for status bar
  const [currentTime, setCurrentTime] = React.useState(() => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  // Update time every minute
  React.useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return names[0].charAt(0).toUpperCase() + names[names.length - 1].charAt(0).toUpperCase();
  };
  
  const API_BASE_URL_FOR_FILES = 'https://warrityweb-api-x1ev.onrender.com';

  // Function to get page name from pathname
  function getPageName(path: string): string {
    if (path === '/dashboard') return 'dashboard';
    if (path.includes('/warranties')) return 'warranties';
    if (path.includes('/products')) return 'products';
    if (path.includes('/service')) return 'service';
    if (path.includes('/calendar')) return 'calendar';
    if (path.includes('/profile')) return 'profile';
    
    // Extract the last part of the path
    const parts = path.split('/');
    const lastPart = parts[parts.length - 1];
    return lastPart || 'dashboard';
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-lime-400 to-lime-300 shadow-md">
      {/* Status bar with realistic mockup */}
      <div className="flex justify-between px-4 py-1 text-xs font-medium text-black bg-black/5">
        <div>{currentTime}</div>
        <div className="flex items-center space-x-2">
          <div className="flex space-x-0.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`h-2 w-0.5 rounded-sm bg-black ${i < 3 ? 'opacity-100' : 'opacity-40'}`} style={{ transform: `scaleY(${0.6 + i * 0.15})` }} />
            ))}
          </div>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M1.371 8.143c5.858-5.857 15.356-5.857 21.213 0a.75.75 0 0 1 0 1.061l-.53.53a.75.75 0 0 1-1.06 0A13.19 13.19 0 0 0 12 6.75c-3.645 0-7.29 1.357-10.024 4.07a.75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06l.984-.984Zm3.927 3.927a8.25 8.25 0 0 1 11.36 0 .75.75 0 0 1 0 1.06l-.53.53a.75.75 0 0 1-1.06 0 6.375 6.375 0 0 0-8.78 0 .75.75 0 0 1-1.06 0l-.53-.53a.75.75 0 0 1 0-1.06Zm3.927 3.927a2.25 2.25 0 0 1 3.182 0 .75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 0 1-1.061 0l-1.061-1.06a.75.75 0 0 1 0-1.061Z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="relative w-5 h-2.5">
            <div className="absolute inset-0 border border-black rounded-sm" />
            <div className="absolute inset-0 m-px bg-black rounded-sm" style={{ width: '70%' }} />
          </div>
        </div>
      </div>
      
      {/* Main header content */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Sidebar toggle button (visible on all screen sizes) */}
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-black hover:bg-lime-500/20" 
            onClick={toggleMobileSidebar}
            aria-label="Open sidebar menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          {/* Page title with better typography */}
          <div className="text-black font-semibold text-sm uppercase tracking-wide">
            {pageName}
          </div>
        </div>
        
        {/* User avatar with improved styling */}
        <div>
          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:bg-transparent">
                  <Avatar className="h-8 w-8 border-2 border-black shadow-sm">
                    <AvatarImage 
                      src={user.profilePicture ? `${API_BASE_URL_FOR_FILES}${user.profilePicture}` : undefined} 
                      alt={user.username} 
                    />
                    <AvatarFallback className="bg-white text-black text-xs font-bold">
                      {getInitials(user.username)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-1 border border-gray-200" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="flex items-center text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !isDashboard && (
              <Button asChild variant="outline" size="sm" className="bg-white text-black border-black hover:bg-gray-100 rounded-full text-xs px-3 py-1 h-7 shadow-sm">
                <Link href="/login">Login</Link>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
