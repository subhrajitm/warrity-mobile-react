"use client";

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import type { Warranty } from '@/types';
import Link from 'next/link';
import { WarrantyListItem } from '@/components/warranties/warranty-list-item';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2, ShieldCheck, List } from 'lucide-react';
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
import { useState } from 'react';

export default function AllWarrantiesPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [warrantyToDelete, setWarrantyToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { data: warranties, isLoading, error } = useQuery<Warranty[], Error>({
    queryKey: ['warranties', user?._id],
    queryFn: async () => {
      if (!token || !user) throw new Error("User not authenticated");
      return apiClient<Warranty[]>('/warranties', { token });
    },
    enabled: !!token && !!user,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (warrantyId: string) => apiClient(`/warranties/${warrantyId}`, { method: 'DELETE', token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warranties', user?._id] });
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

  // Format date to display in a user-friendly way
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Calculate days remaining until warranty expiration
  const getDaysRemaining = (endDateString?: string) => {
    if (!endDateString) return null;
    
    const endDate = new Date(endDateString);
    const today = new Date();
    
    // Reset time part for accurate day calculation
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  // Get status color based on days remaining
  const getStatusColor = (daysRemaining: number | null) => {
    if (daysRemaining === null) return 'bg-gray-500';
    if (daysRemaining <= 0) return 'bg-red-500';
    if (daysRemaining <= 30) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Filter warranties based on active tab and search query
  const filteredWarranties = warranties?.filter(warranty => {
    // First filter by tab
    const warrantyEndDate = warranty.warrantyEndDate ? new Date(warranty.warrantyEndDate) : null;
    const isActive = warrantyEndDate ? warrantyEndDate > new Date() : false;
    
    if (activeTab === 'active' && !isActive) return false;
    if (activeTab === 'expired' && isActive) return false;
    
    // Then filter by search query
    if (searchQuery.trim() === '') return true;
    
    const query = searchQuery.toLowerCase();
    return (
      warranty.productName.toLowerCase().includes(query) ||
      (warranty.retailer?.toLowerCase().includes(query) || false) ||
      (warranty.category?.toLowerCase().includes(query) || false)
    );
  });

  if (isLoading) {
    return (
      <div className="text-white px-4 py-6">
        <div className="flex justify-center mt-4">
          <div className="flex space-x-2">
            {['all', 'active', 'expired'].map((tab, index) => (
              <div key={index} className="px-4 py-2 rounded-full bg-gray-800 text-gray-400">
                {tab}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 px-2">
          <div className="relative">
            <Skeleton className="h-10 w-full rounded-full bg-gray-800" />
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-4">Warranties</h2>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-xl p-4">
                <Skeleton className="h-16 w-full rounded-md bg-gray-800" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white px-4 py-6">
        <div className="text-center py-10">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Data</h2>
          <p className="text-gray-400 mb-4">{error.message}</p>
          <Button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['warranties', user?._id] })}
            className="bg-lime-300 text-black hover:bg-lime-400"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white px-4">
      {/* Search bar - moved to top for better UX */}
      <div className="mt-4 px-1">
        <div className="relative group">
          <input
            type="text"
            placeholder="Search warranties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800/80 backdrop-blur-sm text-white rounded-xl px-4 py-3 pl-11 text-sm focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all duration-200 border border-gray-700 focus:border-lime-300 shadow-sm"
          />
          <div className="absolute left-3.5 top-3 text-gray-400 group-focus-within:text-lime-300 transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tab navigation - styled with glass effect */}
      <div className="mt-5">
        <div className="flex justify-between items-center bg-gray-800/40 backdrop-blur-sm rounded-xl p-1.5 border border-gray-700/50 shadow-inner">
          {[
            { id: 'all', label: 'All', count: warranties?.length || 0 },
            { id: 'active', label: 'Active', count: warranties?.filter(w => {
              const endDate = w.warrantyEndDate ? new Date(w.warrantyEndDate) : null;
              return endDate ? endDate > new Date() : false;
            }).length || 0 },
            { id: 'expired', label: 'Expired', count: warranties?.filter(w => {
              const endDate = w.warrantyEndDate ? new Date(w.warrantyEndDate) : null;
              return endDate ? endDate <= new Date() : false;
            }).length || 0 }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'active' | 'expired')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab.id 
                ? 'bg-lime-300 text-black shadow-md' 
                : 'text-gray-300 hover:bg-gray-700/50'}`}
            >
              <span>{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id 
                ? 'bg-black/20' 
                : 'bg-gray-700'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Warranties section */}
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">
          {activeTab === 'expired' ? 'Expired Warranties' : activeTab === 'active' ? 'Active Warranties' : 'All Warranties'}
          {filteredWarranties && <span className="text-gray-400 text-sm font-normal ml-2">({filteredWarranties.length})</span>}
        </h2>
        
        {!filteredWarranties || filteredWarranties.length === 0 ? (
          <div className="text-center py-10 bg-gray-900 rounded-xl">
            <ShieldCheck className="mx-auto h-12 w-12 text-gray-600 mb-3" />
            <h3 className="text-md font-semibold mb-1">No Warranties Found</h3>
            <p className="text-xs text-gray-500">
              {searchQuery ? 'Try a different search term.' : activeTab !== 'all' ? 'No items to display in this category.' : 'You haven\'t added any warranties yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredWarranties.map((warranty) => {
              const daysRemaining = getDaysRemaining(warranty.warrantyEndDate);
              const statusColor = getStatusColor(daysRemaining);
              
              return (
                <div key={warranty._id} className="bg-gray-900 rounded-xl p-4 hover:bg-gray-800 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full ${statusColor} flex items-center justify-center text-white font-medium border-2 border-black`}>
                        {warranty.productName ? warranty.productName.charAt(0).toUpperCase() : 'W'}
                      </div>
                      <div>
                        <div className="font-bold text-white">{warranty.productName}</div>
                        <div className="text-xs text-gray-400 flex items-center">
                          {warranty.category && (
                            <span className="mr-2">{warranty.category}</span>
                          )}
                          {warranty.retailer && (
                            <span className="flex items-center">
                              <span className="mx-1 text-gray-600">•</span>
                              {warranty.retailer}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Link 
                      href={`/warranties/${warranty._id}`} 
                      className="w-8 h-8 bg-black rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                      </svg>
                    </Link>
                  </div>
                  
                  <div className="mt-3 flex justify-between text-xs border-t border-gray-800 pt-3">
                    <div>
                      <div className="text-gray-400">Purchase Date</div>
                      <div className="text-white">{formatDate(warranty.purchaseDate)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Warranty End</div>
                      <div className="text-white">{formatDate(warranty.warrantyEndDate)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Status</div>
                      <div className={`${daysRemaining && daysRemaining > 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                        {daysRemaining === null ? 'Unknown' : 
                         daysRemaining <= 0 ? 'Expired' : 
                         `${daysRemaining} days left`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {warrantyToDelete && (
        <AlertDialog open={!!warrantyToDelete} onOpenChange={(open) => !open && setWarrantyToDelete(null)}>
          <AlertDialogContent className="bg-gray-900 text-white border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete the warranty.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setWarrantyToDelete(null)} className="bg-gray-800 text-white hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleDeleteWarranty(warrantyToDelete)}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
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
