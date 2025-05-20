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

// GET /api/calendar/events - Get all calendar events
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate') || '';
    const endDate = url.searchParams.get('endDate') || '';
    const type = url.searchParams.get('type') || '';
    
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
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (type) queryParams.append('type', type);
    
    // Try to fetch calendar events from the external API
    // If the endpoint doesn't exist yet, return an empty array
    let events;
    try {
      events = await apiClient<{ events: CalendarEvent[] }>(
        `/calendar/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`, 
        { token }
      );
    } catch (apiError: any) {
      // If it's a 404 error, the endpoint doesn't exist yet
      if (apiError.status === 404) {
        console.log('Calendar events endpoint not found, returning empty array');
        events = { events: [] };
      } else {
        throw apiError; // Re-throw other errors
      }
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to fetch calendar events' },
      { status: apiError.status || 500 }
    );
  }
}

// POST /api/calendar/events - Create a new calendar event
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
    const eventData = await request.json();
    
    // Try to create calendar event via external API
    // If the endpoint doesn't exist, simulate a successful response
    let newEvent;
    try {
      newEvent = await apiClient<CalendarEvent>('/calendar/events', {
        method: 'POST',
        data: eventData,
        token
      });
    } catch (apiError: any) {
      // If it's a 404 error, the endpoint doesn't exist yet
      if (apiError.status === 404) {
        console.log('Calendar events endpoint not found, simulating successful creation');
        // Create a mock event with the provided data and generated ID
        newEvent = {
          _id: `temp-${Date.now()}`,
          ...eventData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as CalendarEvent;
      } else {
        throw apiError; // Re-throw other errors
      }
    }

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error('Error creating calendar event:', error);
    const apiError = error as Error & { status?: number, data?: { message: string } };
    
    return NextResponse.json(
      { error: apiError.data?.message || 'Failed to create calendar event' },
      { status: apiError.status || 500 }
    );
  }
}
