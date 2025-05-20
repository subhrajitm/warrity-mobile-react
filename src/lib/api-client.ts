import type { ApiErrorResponse } from '@/types';

// Use the external API server
const API_BASE_URL = 'https://warrityweb-api-x1ev.onrender.com/api';

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
      ...customHeaders,
    },
  };

  if (token) {
    (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  // Remove Content-Type for FormData, browser will set it with boundary
  if (customConfig.body instanceof FormData) {
    delete (config.headers as Record<string, string>)['Content-Type'];
  }


  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status} ${response.statusText} on ${endpoint}`,
    }));
    
    // Log the error for easier debugging
    console.error(`API Error (${response.status}) on ${endpoint}:`, errorData);

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
  
  return response.json();
}

export default apiClient;
