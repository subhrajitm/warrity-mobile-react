"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductDetail from '@/components/product/product-detail';
import { ProductProvider } from '@/contexts/product-context';
import { ServiceProvider } from '@/contexts/service-context';
import { WarrantyProvider } from '@/contexts/warranty-context';
import { Spinner } from '@/components/ui/spinner';

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;
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
    <ProductProvider>
      <ServiceProvider>
        <WarrantyProvider>
          <ProductDetail productId={productId} />
        </WarrantyProvider>
      </ServiceProvider>
    </ProductProvider>
  );
}
