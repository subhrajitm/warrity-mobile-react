import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';

interface ServiceInfo {
  _id: string;
  name: string;
  company: string;
  serviceType: string;
  description: string;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// GET /api/service-info/user - Browse service information with enhanced features
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination, search, filtering, and sorting
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const search = url.searchParams.get('search') || '';
    const serviceType = url.searchParams.get('serviceType') || '';
    const company = url.searchParams.get('company') || '';
    const sort = url.searchParams.get('sort') || 'nameAsc'; // Default sort
    
    // Get authentication token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Build query string
    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (search) queryParams.append('search', search);
    if (serviceType) queryParams.append('serviceType', serviceType);
    if (company) queryParams.append('company', company);
    queryParams.append('sort', sort);
    
    // Fetch service information from the external API
    const serviceInfo = await apiClient<{ serviceInfo: ServiceInfo[], total: number, pages: number }>(
      `/service-info/user?${queryParams.toString()}`, 
      { token }
    );

    return NextResponse.json(serviceInfo);
  } catch (error) {
    console.error('Error fetching service information:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch service information' },
      { status: apiError.status || 500 }
    );
  }
}
