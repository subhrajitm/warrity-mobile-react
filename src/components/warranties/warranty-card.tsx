
"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Warranty } from '@/types';
import { CalendarClock, FileText, Edit3, Trash2, AlertTriangle, Tag, Store, DollarSign, StickyNote, CalendarDays } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';
import { cn } from '@/lib/utils';

interface WarrantyCardProps {
  warranty: Warranty;
  onDelete?: (id: string) => void;
}

const API_BASE_URL_FOR_FILES = 'https://warrityweb-api-x1ev.onrender.com';

export function WarrantyCard({ warranty, onDelete }: WarrantyCardProps) {
  const purchaseDate = isValid(parseISO(warranty.purchaseDate)) ? format(parseISO(warranty.purchaseDate), 'MMM dd, yyyy') : 'N/A';
  const warrantyEndDate = warranty.warrantyEndDate && isValid(parseISO(warranty.warrantyEndDate)) ? format(parseISO(warranty.warrantyEndDate), 'MMM dd, yyyy') : 'N/A';
  
  let daysRemaining: number | null = null;
  let expiryStatus: 'active' | 'expiring-soon' | 'expired' | 'unknown' = 'unknown';

  if (warranty.warrantyEndDate && isValid(parseISO(warranty.warrantyEndDate))) {
    const endDate = parseISO(warranty.warrantyEndDate);
    daysRemaining = differenceInDays(endDate, new Date());
    if (daysRemaining < 0) {
      expiryStatus = 'expired';
    } else if (daysRemaining <= 30) {
      expiryStatus = 'expiring-soon';
    } else {
      expiryStatus = 'active';
    }
  }

  const getExpiryBadgeVariant = () => {
    switch (expiryStatus) {
      case 'expired': return 'destructive';
      case 'expiring-soon': return 'default'; 
      case 'active': return 'default'; 
      default: return 'outline';
    }
  };
  
  const getExpiryBadgeText = () => {
    if (expiryStatus === 'expired') return 'Expired';
    if (expiryStatus === 'expiring-soon' && daysRemaining !== null) return `Expires in ${daysRemaining}d`;
    if (expiryStatus === 'active' && daysRemaining !== null) return `Expires in ${daysRemaining}d`;
    return 'Ends ' + warrantyEndDate;
  };

  const cardClasses = cn(
    "flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300",
    expiryStatus === 'expiring-soon' && "border-l-4 border-primary",
    expiryStatus === 'expired' && "border-l-4 border-destructive"
  );

  return (
    <Card className={cardClasses}>
      <CardHeader className="px-4 py-3">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg font-semibold mb-0.5 flex-1 min-w-0 truncate" title={warranty.productName}>{warranty.productName}</CardTitle>
          {expiryStatus !== 'unknown' && (
             <Badge variant={getExpiryBadgeVariant()} className="ml-auto shrink-0"> {/* Use ml-auto to push badge to the right if productName is short */}
               {expiryStatus === 'expiring-soon' && <AlertTriangle className="h-3 w-3 mr-1" />}
               {getExpiryBadgeText()}
             </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-4 py-3 space-y-1.5 text-xs">
        {warranty.category && (
          <div className="flex items-center">
            <Tag className="h-3.5 w-3.5 mr-1.5 text-primary" />
            <span>Category: {warranty.category}</span>
          </div>
        )}
        <div className="flex items-center">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5 text-primary" />
          <span>Purchased: {purchaseDate}</span>
        </div>
        <div className="flex items-center">
          <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-primary" />
          <span>Warranty Ends: {warrantyEndDate}</span>
        </div>
        {warranty.retailer && (
          <div className="flex items-center">
            <Store className="h-3.5 w-3.5 mr-1.5 text-primary" />
            <span>Retailer: {warranty.retailer}</span>
          </div>
        )}
        {warranty.purchasePrice != null && ( // Check for null or undefined
          <div className="flex items-center">
            <DollarSign className="h-3.5 w-3.5 mr-1.5 text-primary" />
            <span>Price: ${warranty.purchasePrice.toFixed(2)}</span>
          </div>
        )}
        {warranty.notes && (
           <div className="flex items-start">
            <StickyNote className="h-3.5 w-3.5 mr-1.5 text-primary shrink-0 mt-0.5" />
            <p className="truncate">Notes: <span className="font-normal text-muted-foreground">{warranty.notes}</span></p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center px-4 py-3 border-t">
        <div className="space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/warranties/${warranty._id}`}>
              <Edit3 className="h-4 w-4 md:mr-1.5" />
              <span className="hidden md:inline">View/Edit</span>
              <span className="md:hidden">Edit</span>
            </Link>
          </Button>
          {warranty.documentUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={`${API_BASE_URL_FOR_FILES}${warranty.documentUrl}`} target="_blank" rel="noopener noreferrer" title="View warranty document">
                <FileText className="h-4 w-4 md:mr-1.5" />
                 <span className="hidden md:inline">Document</span>
                 <span className="md:hidden">Doc</span>
              </a>
            </Button>
          )}
        </div>
        {onDelete && (
          <Button variant="destructive" size="icon" onClick={() => onDelete(warranty._id)} className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
