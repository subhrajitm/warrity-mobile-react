"use client";

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { Warranty } from '@/types';
import { WarrantyListItem } from '@/components/warranties/warranty-list-item';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, List, ShieldX, Loader2, ShieldCheck, Info, Zap, Calendar, Clock, DollarSign, BarChart3, ChevronRight, CalendarClock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from '@/components/ui/card';
import { useState, useEffect } from 'react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';


export default function DashboardPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [warrantyToDelete, setWarrantyToDelete] = useState<string | null>(null);

  const { data: warrantiesData, isLoading: isLoadingWarranties, error: warrantiesError } = useQuery<{ warranties: Warranty[], expiringWarranties: Warranty[] }, Error>({
    queryKey: ['dashboardData', user?._id],
    queryFn: async () => {
      if (!token || !user) throw new Error("User not authenticated");
      const [warranties, expiringWarranties] = await Promise.all([
        apiClient<Warranty[]>('/warranties', { token }),
        apiClient<Warranty[]>('/warranties/expiring', { token })
      ]);
      return { warranties, expiringWarranties };
    },
    enabled: !!token && !!user,
  });

  const warranties = warrantiesData?.warranties;
  const expiringWarranties = warrantiesData?.expiringWarranties;
  const isLoadingExpiring = isLoadingWarranties; 

  const stats = (() => {
    if (!warranties) return {
      totalWarranties: 0,
      totalValue: 0,
      totalEvents: 0,
      topCategories: [],
      expiringCount: 0
    };
    
    const totalWarranties = warranties.length;
    const totalValue = warranties.reduce((sum, w) => sum + (w.purchasePrice || 0), 0);
    // Get total events count (using a placeholder value since we don't have actual events API data yet)
    const totalEvents = 0; // This will be replaced with actual API call when events endpoint is ready
    
    // Group warranties by category
    const categoryCounts: Record<string, number> = {};
    warranties.forEach(w => {
      const category = w.category || 'Uncategorized';
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });
    
    // Find top categories
    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
      
    return {
      totalWarranties,
      totalValue,
      totalEvents,
      topCategories,
      expiringCount: expiringWarranties?.length || 0
    };
  })();

  useEffect(() => {
    if (expiringWarranties && expiringWarranties.length > 0 && !isLoadingExpiring && !warrantiesError) {
      const expiringProductNames = expiringWarranties.map(w => w.productName).slice(0, 2).join(', ');
      const additionalItemsCount = expiringWarranties.length - 2;
      let description = `Your warranty for ${expiringProductNames}`;
      if (expiringWarranties.length === 1) {
        description = `Your warranty for ${expiringWarranties[0].productName}`;
      }
      
      if (additionalItemsCount > 0) {
        description += ` and ${additionalItemsCount} other item(s) are expiring soon.`;
      } else if (expiringWarranties.length > 1) {
        description += ` are expiring soon.`;
      } else {
         description += ` is expiring soon.`;
      }
      
      const lastShownKey = `expiringToastLastShown_${user?._id}`;
      const lastShownTimestamp = sessionStorage.getItem(lastShownKey);
      const now = Date.now();
      const oneHour = 60 * 60 * 1000; 

      if (!lastShownTimestamp || (now - parseInt(lastShownTimestamp, 10) > oneHour)) {
        toast({
          title: 'Expiring Warranties!',
          description: description,
          variant: 'default', 
          duration: 10000, 
        });
        sessionStorage.setItem(lastShownKey, now.toString());
      }
    }
  }, [expiringWarranties, isLoadingExpiring, warrantiesError, toast, user?._id]);


  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (warrantyId: string) => apiClient(`/warranties/${warrantyId}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData', user?._id] });
      toast({ title: 'Success', description: 'Warranty deleted successfully.' });
      setWarrantyToDelete(null);
    },
    onError: (error) => {
      toast({ title: 'Error', description: `Failed to delete warranty: ${error.message}`, variant: 'destructive' });
      setWarrantyToDelete(null);
    },
  });

  const handleDeleteWarranty = (id: string) => {
    deleteMutation.mutate(id);
  };
  
  const activeWarranties = warranties?.filter(w => {
    // If no end date, consider it active
    if (!w.warrantyEndDate) return true;
    
    try {
      // Check if the warranty hasn't expired yet
      return differenceInDays(parseISO(w.warrantyEndDate), new Date()) >= 0;
    } catch (error) {
      console.error('Error parsing date:', error, w.warrantyEndDate);
      return true; // Include warranties with invalid dates as active
    }
  });


  if (isLoadingWarranties) {
    return (
      <div className="space-y-6 p-4">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Skeleton className="h-5 w-40 mb-2" /> 
            <Skeleton className="h-6 w-32 mb-1" />
            <Skeleton className="h-4 w-48" /> 
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        {/* Stats Card Skeleton */}
        <Skeleton className="h-40 rounded-xl bg-primary/30" />
        {/* Action Buttons Skeleton */}
        <div className="grid grid-cols-4 gap-3 mt-[-2rem] px-4 relative z-10">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        {/* Lists Skeleton */}
        <div className="pt-4">
          <Skeleton className="h-6 w-36 mb-3 ml-4" />
          <Skeleton className="h-16 rounded-lg mb-2 mx-4" />
          <Skeleton className="h-16 rounded-lg mb-2 mx-4" />
        </div>
        <div className="pt-2">
          <Skeleton className="h-6 w-48 mb-3 ml-4" />
          <Skeleton className="h-16 rounded-lg mb-2 mx-4" />
        </div>
      </div>
    );
  }

  if (warrantiesError) {
    return (
      <div className="text-center py-10 px-4">
        <ShieldX className="mx-auto h-16 w-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground mb-4">{warrantiesError?.message}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboardData', user?._id] })}>
          Try Again
        </Button>
      </div>
    );
  }

  const showExpiringSectionContent = expiringWarranties && expiringWarranties.length > 0;
  const showAllClearMessage = expiringWarranties && expiringWarranties.length === 0 && !isLoadingExpiring;
  const showActiveWarrantiesContent = activeWarranties && activeWarranties.length > 0;

  return (
    <div className="pb-20">
      {/* Dashboard Header */}
      <div className="px-4 py-2 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Link href="/warranties/add">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Warranty
          </Link>
        </Button>
      </div>
      
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 p-4">
          {/* Total Warranties */}
          <Card className="bg-gradient-to-br from-lime-500/20 to-lime-600/10 border-lime-500/20">
            <CardContent className="p-4 flex items-center">
              <ShieldCheck className="h-8 w-8 mr-3 text-lime-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Warranties</p>
                <h3 className="text-2xl font-bold">{stats.totalWarranties}</h3>
              </div>
            </CardContent>
          </Card>
          
          {/* Expiring Soon */}
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/20">
            <CardContent className="p-4 flex items-center">
              <Clock className="h-8 w-8 mr-3 text-amber-500" />
              <div>
                <p className="text-xs text-muted-foreground">Expiring Soon</p>
                <h3 className="text-2xl font-bold">{stats.expiringCount}</h3>
              </div>
            </CardContent>
          </Card>
          
          {/* Total Value */}
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/20">
            <CardContent className="p-4 flex items-center">
              <DollarSign className="h-8 w-8 mr-3 text-blue-500" />
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <h3 className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
          
          {/* Total Events */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                  <h3 className="text-2xl font-bold">{stats.totalEvents}</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Category Breakdown */}
      {stats && stats.topCategories.length > 0 && (
        <div className="px-4 pt-2 pb-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" /> 
                  Top Categories
                </h3>
              </div>
              <div className="space-y-3">
                {stats.topCategories.map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{category}</span>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{count}</span>
                      <div className="h-2 bg-primary/20 rounded-full w-24 overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full" 
                          style={{ width: `${(count / stats.totalWarranties) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Expiring Soon Section */}
      {(showExpiringSectionContent || showAllClearMessage) && (
        <section className="px-4 pt-4" id="expiring-soon">
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center">
            <Zap className="mr-2 h-5 w-5 text-primary" /> Expiring Soon
          </h2>
          {showExpiringSectionContent && (
            <div className="space-y-0">
              {expiringWarranties?.map((warranty) => (
                <WarrantyListItem key={warranty._id} warranty={warranty} />
              ))}
            </div>
          )}
          {showAllClearMessage && (
            <div className="text-center py-8 my-4 bg-card rounded-lg shadow">
              <ShieldCheck className="mx-auto h-12 w-12 text-primary mb-3" />
              <h3 className="text-md font-semibold text-foreground">All Clear!</h3>
              <p className="text-xs text-muted-foreground">No warranties expiring in the next 30 days.</p>
            </div>
          )}
        </section>
      )}
      
       {/* Separator */}
      {showExpiringSectionContent && showActiveWarrantiesContent && (
        <div className="px-4">
          <Separator className="my-4 bg-border/50" />
        </div>
      )}


      {/* All Active Warranties Section */}
      <section className="px-4" id="all-active">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center">
            <List className="mr-2 h-5 w-5 text-primary"/> All Active Warranties
          </h2>
          <Link href="/warranties/all">
            <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/90">
              View All <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
        
        {(!activeWarranties || activeWarranties.length === 0) && !isLoadingWarranties && (
          <div className="bg-gradient-to-br from-card to-card/50 rounded-xl shadow-sm border border-border/40 p-6 text-center">
            <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Info className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-md font-semibold text-foreground mb-1">No Active Warranties</h3>
            <p className="text-xs text-muted-foreground mb-4">Add your first warranty to get started!</p>
            <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-4">
              <Link href="/warranties/add">
                <PlusCircle className="mr-2 h-4 w-4" /> Add First Warranty
              </Link>
            </Button>
          </div>
        )}
        
        {activeWarranties && activeWarranties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {activeWarranties.slice(0, 6).map((warranty) => (
              <Link href={`/warranties/${warranty._id}`} key={warranty._id} className="group">
                <div className="bg-card hover:bg-accent/5 rounded-xl p-3 border border-border/40 shadow-sm transition-all duration-200 hover:shadow-md h-full flex flex-col">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                        {warranty.product && typeof warranty.product === 'object' && warranty.product.name
                          ? warranty.product.name
                          : warranty.productName || 'Unnamed Product'}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {warranty.product && typeof warranty.product === 'object' && warranty.product.brand
                          ? warranty.product.brand
                          : warranty.productBrand || ''} 
                        {warranty.product && typeof warranty.product === 'object' && warranty.product.category
                          ? warranty.product.category
                          : warranty.productCategory || warranty.category || ''}
                      </p>
                    </div>
                    <div className="ml-2">
                      {(() => {
                        if (!warranty.warrantyEndDate) return null;
                        const endDate = parseISO(warranty.warrantyEndDate);
                        const daysRemaining = differenceInDays(endDate, new Date());
                        
                        if (daysRemaining < 0) {
                          return <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Expired</Badge>;
                        } else if (daysRemaining <= 30) {
                          return <Badge variant="outline" className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0">Expires soon</Badge>;
                        } else {
                          return <Badge variant="outline" className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0">Active</Badge>;
                        }
                      })()}
                    </div>
                  </div>
                  
                  <div className="mt-auto pt-2 flex justify-between items-center text-[10px] text-muted-foreground">
                    <div className="flex items-center">
                      <CalendarClock className="h-3 w-3 mr-1 text-primary/70" />
                      <span>
                        {warranty.warrantyEndDate 
                          ? format(parseISO(warranty.warrantyEndDate), 'MMM dd, yyyy')
                          : 'No end date'}
                      </span>
                    </div>
                    <ChevronRight className="h-3 w-3 text-primary/70 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {activeWarranties && activeWarranties.length > 6 && (
          <div className="mt-4 text-center">
            <Link href="/warranties/all">
              <Button variant="outline" size="sm" className="rounded-full">
                View All {activeWarranties.length} Warranties
              </Button>
            </Link>
          </div>
        )}
      </section>

      {warrantyToDelete && (
        <AlertDialog open={!!warrantyToDelete} onOpenChange={(open) => !open && setWarrantyToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the warranty.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setWarrantyToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteWarranty(warrantyToDelete)}
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
