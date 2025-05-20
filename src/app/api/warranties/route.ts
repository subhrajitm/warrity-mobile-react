import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { Warranty } from '@/types';

// GET /api/warranties - Get all warranties for current user
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for pagination and filtering
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const search = url.searchParams.get('search') || '';
    const category = url.searchParams.get('category') || '';
    const status = url.searchParams.get('status') || '';
    
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
    if (category) queryParams.append('category', category);
    if (status) queryParams.append('status', status);
    
    // Fetch warranties from the external API
    const warranties = await apiClient<{ warranties: Warranty[], total: number, pages: number }>(
      `/warranties?${queryParams.toString()}`, 
      { token }
    );

    return NextResponse.json(warranties);
  } catch (error) {
    console.error('Error fetching warranties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch warranties' },
      { status: 500 }
    );
  }
}

// POST /api/warranties - Create a new warranty
export async function POST(request: NextRequest) {
  try {
    // Get authentication token from cookies or headers
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const warrantyData = await request.json();
    
    // Create warranty via external API
    const newWarranty = await apiClient<Warranty>('/warranties', {
      method: 'POST',
      data: warrantyData,
      token
    });

    return NextResponse.json(newWarranty, { status: 201 });
  } catch (error) {
    console.error('Error creating warranty:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to create warranty' },
      { status: apiError.status || 500 }
    );
  }
}
