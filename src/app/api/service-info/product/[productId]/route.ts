import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';

interface ProductServiceInfo {
  warrantyTerms: {
    duration: string;
    coverage: string;
    conditions: string[];
  };
  serviceCenters: Array<{
    name: string;
    address: string;
    phone: string;
    email?: string;
    hours?: string;
  }>;
  contactInformation: {
    customerService: string;
    technicalSupport?: string;
    website: string;
  };
}

// GET /api/service-info/product/:productId - Get service info for specific product
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    // Get authentication token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    // Fetch product service information from the external API
    const serviceInfo = await apiClient<ProductServiceInfo>(
      `/service-info/product/${params.productId}`, 
      token ? { token } : {}
    );

    return NextResponse.json(serviceInfo);
  } catch (error) {
    console.error('Error fetching product service information:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch product service information' },
      { status: apiError.status || 500 }
    );
  }
}
