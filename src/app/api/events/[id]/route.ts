import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';

// GET /api/events/:id - Get event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const event = await apiClient(`/events/${params.id}`, {
      token,
    });
    
    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

// PUT /api/events/:id - Update event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    const updatedEvent = await apiClient(`/events/${params.id}`, {
      method: 'PUT',
      token,
      data: body,
    });
    
    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// DELETE /api/events/:id - Delete event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await apiClient(`/events/${params.id}`, {
      method: 'DELETE',
      token,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
