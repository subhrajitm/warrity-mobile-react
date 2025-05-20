import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { Warranty } from '@/types';

// GET /api/warranties/expiring - Get warranties expiring soon
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const url = new URL(request.url);
    const days = url.searchParams.get('days') || '30'; // Default to 30 days
    
    // Fetch expiring warranties from the external API
    const expiringWarranties = await apiClient<{ warranties: Warranty[], total: number }>(
      `/warranties/expiring?days=${days}`, 
      { token }
    );

    return NextResponse.json(expiringWarranties);
  } catch (error) {
    console.error('Error fetching expiring warranties:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch expiring warranties' },
      { status: apiError.status || 500 }
    );
  }
}
