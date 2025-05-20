import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';

interface CompanyServiceInfo {
  company: string;
  servicePolicies: {
    warrantyPolicy: string;
    returnPolicy: string;
    repairPolicy: string;
  };
  contactDetails: {
    customerService: string;
    technicalSupport?: string;
    headquarters?: {
      address: string;
      phone: string;
    };
    website: string;
    socialMedia?: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  };
  serviceLocations: Array<{
    name: string;
    address: string;
    phone: string;
    email?: string;
    hours?: string;
  }>;
}

// GET /api/service-info/company/:company - Get service info by company
export async function GET(
  request: NextRequest,
  { params }: { params: { company: string } }
) {
  try {
    // Get authentication token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    // Fetch company service information from the external API
    const serviceInfo = await apiClient<CompanyServiceInfo>(
      `/service-info/company/${encodeURIComponent(params.company)}`, 
      token ? { token } : {}
    );

    return NextResponse.json(serviceInfo);
  } catch (error) {
    console.error('Error fetching company service information:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch company service information' },
      { status: apiError.status || 500 }
    );
  }
}
