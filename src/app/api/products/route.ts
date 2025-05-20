import { NextRequest, NextResponse } from 'next/server';
import { Product } from '@/types';

// Mock product data
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

// GET /api/products - Browse products with enhanced features
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination, search, filtering, and sorting
    const url = new URL(request.url);
    const pageStr = url.searchParams.get('page') || '1';
    const limitStr = url.searchParams.get('limit') || '10';
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const manufacturer = url.searchParams.get('manufacturer') || '';
    const sort = url.searchParams.get('sort') || 'nameAsc'; // Default sort
    
    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);
    
    // Filter products based on search, category, and manufacturer
    let filteredProducts = [...mockProducts];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower)
      );
    }
    
    if (category) {
      filteredProducts = filteredProducts.filter(product => 
        product.category === category
      );
    }
    
    if (manufacturer) {
      filteredProducts = filteredProducts.filter(product => 
        product.brand?.toLowerCase() === manufacturer.toLowerCase()
      );
    }
    
    // Sort products
    switch (sort) {
      case 'nameAsc':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nameDesc':
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'brandAsc':
        filteredProducts.sort((a, b) => (a.brand || '').localeCompare(b.brand || ''));
        break;
      case 'brandDesc':
        filteredProducts.sort((a, b) => (b.brand || '').localeCompare(a.brand || ''));
        break;
      default:
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    // Calculate pagination
    const total = filteredProducts.length;
    const pages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Return paginated results
    return NextResponse.json({
      products: paginatedProducts,
      total,
      pages
    });
  } catch (error) {
    console.error('Error processing products request:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
