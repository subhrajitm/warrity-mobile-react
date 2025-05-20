
"use client";

import { useParams } from 'next/navigation';
import WarrantyDetail from '@/components/warranty/warranty-detail';
import { WarrantyProvider } from '@/contexts/warranty-context';
import { ServiceProvider } from '@/contexts/service-context';
import { CalendarProvider } from '@/contexts/calendar-context';
import { Spinner } from '@/components/ui/spinner';
import React, { useEffect, useState } from 'react';


export default function WarrantyDetailPage() {
  const params = useParams();
  const warrantyId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for data fetching
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <WarrantyProvider>
      <ServiceProvider>
        <CalendarProvider>
          <WarrantyDetail warrantyId={warrantyId} />
        </CalendarProvider>
      </ServiceProvider>
    </WarrantyProvider>
  );
}
