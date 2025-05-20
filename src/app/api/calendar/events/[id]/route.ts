import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';

interface CalendarEvent {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location?: string;
  type: 'warranty' | 'service' | 'reminder' | 'other';
  relatedItemId?: string; // ID of warranty or service item
  createdAt: string;
  updatedAt: string;
}

// GET /api/calendar/events/:id - Get calendar event details
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

    // Fetch calendar event details from the external API
    const event = await apiClient<CalendarEvent>(`/calendar/events/${params.id}`, { token });

    return NextResponse.json(event);
  } catch (error) {
    console.error('Error fetching calendar event details:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch calendar event details' },
      { status: apiError.status || 500 }
    );
  }
}

// PUT /api/calendar/events/:id - Update calendar event
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
    const eventData = await request.json();
    
    // Update calendar event via external API
    const updatedEvent = await apiClient<CalendarEvent>(`/calendar/events/${params.id}`, {
      method: 'PUT',
      data: eventData,
      token
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error('Error updating calendar event:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to update calendar event' },
      { status: apiError.status || 500 }
    );
  }
}

// DELETE /api/calendar/events/:id - Delete calendar event
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
    
    // Delete calendar event via external API
    await apiClient(`/calendar/events/${params.id}`, {
      method: 'DELETE',
      token
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to delete calendar event' },
      { status: apiError.status || 500 }
    );
  }
}
