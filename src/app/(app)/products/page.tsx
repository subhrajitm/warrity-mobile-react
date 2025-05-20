"use client";

import React from 'react';
import ProductBrowser from '@/components/product/product-browser';
import { ProductProvider } from '@/contexts/product-context';

export default function ProductsPage() {
  return (
    <ProductProvider>
      <ProductBrowser />
    </ProductProvider>
  );
}
