import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';
import { Warranty } from '@/types';

// GET /api/warranties/:id - Get warranty details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Fetch warranty details from the external API
    const warranty = await apiClient<Warranty>(`/warranties/${params.id}`, { token });

    return NextResponse.json(warranty);
  } catch (error) {
    console.error('Error fetching warranty details:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch warranty details' },
      { status: apiError.status || 500 }
    );
  }
}

// PUT /api/warranties/:id - Update warranty
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Update warranty via external API
    const updatedWarranty = await apiClient<Warranty>(`/warranties/${params.id}`, {
      method: 'PUT',
      data: warrantyData,
      token
    });

    return NextResponse.json(updatedWarranty);
  } catch (error) {
    console.error('Error updating warranty:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to update warranty' },
      { status: apiError.status || 500 }
    );
  }
}

// DELETE /api/warranties/:id - Delete warranty
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Delete warranty via external API
    await apiClient(`/warranties/${params.id}`, {
      method: 'DELETE',
      token
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting warranty:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to delete warranty' },
      { status: apiError.status || 500 }
    );
  }
}
