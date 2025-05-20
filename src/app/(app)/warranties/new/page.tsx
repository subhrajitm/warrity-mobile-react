"use client";

import React from 'react';
import WarrantyForm from '@/components/warranty/warranty-form';
import { WarrantyProvider } from '@/contexts/warranty-context';
import { ProductProvider } from '@/contexts/product-context';
import { useSearchParams } from 'next/navigation';

export default function NewWarrantyPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId');

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Warranty</h1>
      <WarrantyProvider>
        <ProductProvider>
          <WarrantyForm isEditing={false} />
        </ProductProvider>
      </WarrantyProvider>
    </div>
  );
}
