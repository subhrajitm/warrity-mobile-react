import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // No caching at the edge
export const runtime = 'nodejs'; // Use Node.js runtime for better compatibility

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Reconstruct the path from the array
    const path = params.path.join('/');
    
    // Get the full URL from the request to handle both relative and absolute paths
    let url = '';
    
    // Determine if we're in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Use localhost in development, production URL otherwise
    const API_BASE_URL = isDevelopment 
      ? 'http://localhost:5001'
      : 'https://warrity-api-800252372993.asia-south1.run.app';
    
    // If the path already contains the full URL, use it directly
    if (path.includes('warrity-api-800252372993.asia-south1.run.app') || path.includes('localhost:5001')) {
      url = path;
    } else {
      // Otherwise, construct the URL to the external API
      url = `${API_BASE_URL}/${path}`;
    }
    
    console.log(`Proxying request to: ${url}`);
    
    // Forward the request to the target URL
    const response = await fetch(url, {
      headers: request.headers,
      method: request.method,
    });
    
    // Return the response
    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(JSON.stringify({ error: 'Proxy error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}