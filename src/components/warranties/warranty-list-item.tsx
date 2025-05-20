
"use client";

import Link from 'next/link';
import type { Warranty } from '@/types';
import { FileText, ChevronRight, CalendarClock, AlertTriangle, Tag, Trash2 } from 'lucide-react';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WarrantyListItemProps {
  warranty: Warranty;
  onDeleteClick?: (id: string) => void;
}

export function WarrantyListItem({ warranty, onDeleteClick }: WarrantyListItemProps) {
  const warrantyEndDate = warranty.warrantyEndDate && isValid(parseISO(warranty.warrantyEndDate)) 
    ? parseISO(warranty.warrantyEndDate) 
    : null;

  let daysRemaining: number | null = null;
  let expiryStatus: 'active' | 'expiring-soon' | 'expired' | 'unknown' = 'unknown';
  let expiryText = 'Ends ' + (warrantyEndDate ? format(warrantyEndDate, 'MMM dd, yyyy') : 'N/A');

  if (warrantyEndDate) {
    daysRemaining = differenceInDays(warrantyEndDate, new Date());
    if (daysRemaining < 0) {
      expiryStatus = 'expired';
      expiryText = 'Expired on ' + format(warrantyEndDate, 'MMM dd, yyyy');
    } else if (daysRemaining <= 30) {
      expiryStatus = 'expiring-soon';
      expiryText = `Expires in ${daysRemaining}d`;
    } else {
      expiryStatus = 'active';
      expiryText = `Expires in ${daysRemaining}d`;
    }
  }

  const getStatusColor = () => {
    if (expiryStatus === 'expired') return 'text-destructive';
    if (expiryStatus === 'expiring-soon') return 'text-primary'; // Use primary green for expiring soon
    return 'text-muted-foreground';
  };

  return (
    <div className="mb-3">
      <div className={cn(
        "flex items-center bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200",
        "group-hover:bg-muted/50"
      )}>
        <Link href={`/warranties/${warranty._id}`} className="flex flex-grow items-center group">
          <div className="mr-4 p-2 bg-muted rounded-full">
            {warranty.category?.toLowerCase().includes('electronic') ? 
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>
              : warranty.category?.toLowerCase().includes('appliance') ?
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-primary"><path d="M12 2v4"></path><path d="M12 20v-4"></path><path d="m17 4-3 3"></path><path d="M7 4l3 3"></path><path d="m17 20-3-3"></path><path d="M7 20l3-3"></path><path d="M21.32 15.32a8.002 8.002 0 1 0-14.64 0"></path><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"></path><path d="M12 12h.01"></path></svg>
              : <FileText className="h-5 w-5 text-primary" />
            }
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold text-base text-foreground truncate group-hover:text-primary">{warranty.productName}</h3>
            <p className={cn("text-xs", getStatusColor())}>
              {expiryStatus === 'expiring-soon' && <AlertTriangle className="inline-block h-3 w-3 mr-1" />}
              {expiryText}
            </p>
          </div>
          {warranty.purchasePrice && (
            <div className="text-right ml-2 mr-2 shrink-0">
              <p className="font-semibold text-sm text-foreground">${warranty.purchasePrice.toFixed(2)}</p>
              {/* <p className="text-xs text-muted-foreground">Price</p> */}
            </div>
          )}
          <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
        </Link>
        
        {onDeleteClick && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="ml-2 text-muted-foreground hover:text-destructive" 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(warranty._id);
            }}
            aria-label="Delete warranty"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
