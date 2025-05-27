"use client";

import { useParams } from 'next/navigation';
import WarrantyEditForm from '@/components/warranty/warranty-edit-form';
import { WarrantyProvider } from '@/contexts/warranty-context';
import { ProductProvider } from '@/contexts/product-context';
import { ServiceProvider } from '@/contexts/service-context';
import { CalendarProvider } from '@/contexts/calendar-context';
import { Spinner } from '@/components/ui/spinner';
import React, { useEffect, useState } from 'react';

export default function EditWarrantyPage() {
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
      <ProductProvider>
        <ServiceProvider>
          <CalendarProvider>
            <div className="container mx-auto py-6 px-4">
              <h1 className="text-2xl font-bold mb-6">Edit Warranty</h1>
              <WarrantyEditForm warrantyId={warrantyId} />
            </div>
          </CalendarProvider>
        </ServiceProvider>
      </ProductProvider>
    </WarrantyProvider>
  );
}
