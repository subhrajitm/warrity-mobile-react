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
    
    // If the path already contains the full URL, use it directly
    if (path.includes('warrityweb-api-x1ev.onrender.com')) {
      url = path;
    } else {
      // Otherwise, construct the URL to the external API
      url = `https://warrityweb-api-x1ev.onrender.com/${path}`;
    }
    
    console.log(`Proxying request to: ${url}`);
    
    // Fetch the resource from the external API
    const response = await fetch(url, {
      headers: {
        // Forward any authorization headers if needed
        ...(request.headers.get('authorization') 
          ? { 'Authorization': request.headers.get('authorization')! } 
          : {}),
      },
      cache: 'no-store', // Ensure we're not using cache
    });
    
    // If the resource doesn't exist, return a 404
    if (!response.ok) {
      console.error(`Proxy error: ${response.status} ${response.statusText} for ${url}`);
      return new NextResponse(null, { status: response.status });
    }
    
    // Get the content type from the response
    const contentType = response.headers.get('content-type') || '';
    
    // Get the response body as an array buffer
    const buffer = await response.arrayBuffer();
    
    // Create a new response with the same body
    const newResponse = new NextResponse(buffer, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*', // Allow all origins
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
    
    return newResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(null, { status: 500 });
  }
}

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
