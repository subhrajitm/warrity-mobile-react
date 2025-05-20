"use client";

import React from 'react';
import WarrantyDashboard from '@/components/warranty/warranty-dashboard';
import { WarrantyProvider } from '@/contexts/warranty-context';
import { ProductProvider } from '@/contexts/product-context';

export default function WarrantiesPage() {
  return (
    <WarrantyProvider>
      <ProductProvider>
        <WarrantyDashboard />
      </ProductProvider>
    </WarrantyProvider>
  );
}
