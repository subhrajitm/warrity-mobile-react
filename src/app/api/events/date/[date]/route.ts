import { NextRequest, NextResponse } from 'next/server';
import apiClient from '@/lib/api-client';

// GET /api/events/date/:date - Get events for a specific date
export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  // Get the token from the Authorization header
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.replace('Bearer ', '') : null;
  
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const events = await apiClient(`/events/date/${params.date}`, {
      token,
    });
    
    return NextResponse.json(events);
  } catch (error) {
    console.error('Error fetching events by date:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events for the specified date' },
      { status: 500 }
    );
  }
}
