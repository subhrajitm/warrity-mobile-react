import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';

// Mock product data - same as in the main products route
const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'MacBook Pro',
    category: 'Electronics',
    description: 'Powerful laptop for professionals',
    brand: 'Apple',
    modelNumber: 'MBP2023',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'iPhone 15 Pro',
    category: 'Electronics',
    description: 'Latest smartphone with advanced features',
    brand: 'Apple',
    modelNumber: 'IP15P',
    imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Samsung QLED TV',
    category: 'Electronics',
    description: '65-inch 4K Smart TV with Quantum Dot technology',
    brand: 'Samsung',
    modelNumber: 'QN65Q80C',
    imageUrl: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'Dyson V12 Vacuum',
    category: 'Home Appliances',
    description: 'Cordless vacuum cleaner with powerful suction',
    brand: 'Dyson',
    modelNumber: 'V12',
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?q=80&w=1000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'Sony WH-1000XM5',
    category: 'Audio',
    description: 'Wireless noise-cancelling headphones',
    brand: 'Sony',
    modelNumber: 'WH1000XM5',
    imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: '6',
    name: 'LG Refrigerator',
    category: 'Home Appliances',
    description: 'Smart refrigerator with InstaView Door-in-Door',
    brand: 'LG',
    modelNumber: 'LRMVS3006S',
    imageUrl: 'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?q=80&w=1000',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Extract unique categories from mock products
const mockCategories = [...new Set(mockProducts.map(product => product.category))];

// GET /api/products/categories - Get all product categories
export async function GET(request: NextRequest) {
  // Define hardcoded categories to avoid any potential issues with the Set operation
  const categories = ['Electronics', 'Home Appliances', 'Audio'];
  
  // Return a simple response with the categories
  return NextResponse.json({
    categories: categories
  });
}
