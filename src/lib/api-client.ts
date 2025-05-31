import type { ApiErrorResponse } from '@/types';

// Determine if we're in development mode
const isDevelopment = process.env.NODE_ENV === 'development';

// Use localhost in development, production URL otherwise
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:5001/api'
  : 'https://warrity-api-800252372993.asia-south1.run.app/api';

interface RequestOptions extends RequestInit {
  data?: unknown;
  token?: string | null;
}

interface ApiError extends Error {
  status: number;
  data: ApiErrorResponse;
}

async function apiClient<T>(
  endpoint: string,
  { data, token, headers: customHeaders, ...customConfig }: RequestOptions = {}
): Promise<T> {
  const config: RequestInit = {
    method: data ? 'POST' : 'GET',
    body: data ? JSON.stringify(data) : null,
    ...customConfig,
    headers: {
      'Content-Type': data ? 'application/json' : '',
      'Accept': 'application/json',
      ...customHeaders,
    },
    // Add timeout configuration
    signal: AbortSignal.timeout(30000), // 30 second timeout
  };

  if (token) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  // Remove Content-Type for FormData, browser will set it with boundary
  if (customConfig.body instanceof FormData) {
    delete (config.headers as Record<string, string>)['Content-Type'];
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const errorData: ApiErrorResponse = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status} ${response.statusText} on ${endpoint}`,
      }));
      
      // Enhanced error logging
      console.error(`API Error (${response.status}) on ${endpoint}:`, {
        error: errorData,
        endpoint,
        status: response.status,
        statusText: response.statusText
      });

      // Create a proper ApiError object with the required properties
      const error = new Error(errorData.message || 'An unknown API error occurred') as ApiError;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Handle cases where response might be empty (e.g., 204 No Content for DELETE)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return undefined as T; 
    }
    
    try {
      const data = await response.json();
      console.log(`API Response for ${endpoint}:`, data);
      return data;
    } catch (error) {
      const jsonError = error as Error;
      console.error(`Error parsing JSON from ${endpoint}:`, jsonError);
      throw new Error(`Failed to parse API response as JSON: ${jsonError.message}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      // Enhanced error handling for timeout
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timed out. Please try again.') as ApiError;
        timeoutError.status = 408;
        timeoutError.data = { message: 'Request timed out' };
        throw timeoutError;
      }
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

export default apiClient;
