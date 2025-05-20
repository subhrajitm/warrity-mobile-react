import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';
import { Warranty } from '@/types';

interface WarrantyContextType {
  warranties: Warranty[];
  expiringWarranties: Warranty[];
  isLoading: boolean;
  error: string | null;
  totalWarranties: number;
  totalPages: number;
  currentPage: number;
  fetchWarranties: (page?: number, limit?: number, search?: string, category?: string, status?: string) => Promise<void>;
  fetchExpiringWarranties: (days?: number) => Promise<void>;
  getWarrantyById: (id: string) => Promise<Warranty | null>;
  createWarranty: (warrantyData: Partial<Warranty>) => Promise<Warranty>;
  updateWarranty: (id: string, warrantyData: Partial<Warranty>) => Promise<Warranty>;
  deleteWarranty: (id: string) => Promise<boolean>;
}

const WarrantyContext = createContext<WarrantyContextType | undefined>(undefined);

export const WarrantyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [expiringWarranties, setExpiringWarranties] = useState<Warranty[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalWarranties, setTotalWarranties] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { token, isAuthenticated } = useAuth();
  const router = useRouter();

  // Fetch warranties with pagination and filtering
  const fetchWarranties = async (
    page: number = 1, 
    limit: number = 10, 
    search: string = '', 
    category: string = '', 
    status: string = ''
  ) => {
    if (!isAuthenticated || !token) {
      setError('You must be logged in to view warranties');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      if (search) queryParams.append('search', search);
      if (category) queryParams.append('category', category);
      if (status) queryParams.append('status', status);
      
      // The API returns an array of warranties directly instead of an object with warranties, total, and pages properties
      const response = await apiClient<Warranty[]>(
        `/warranties?${queryParams.toString()}`,
        { token }
      );
      
      // Check if response is an array (direct warranties data)
      if (Array.isArray(response)) {
        console.log('Received warranties data:', response);
        setWarranties(response);
        setTotalWarranties(response.length);
        // Calculate total pages based on the number of items and limit
        const calculatedPages = Math.ceil(response.length / limit);
        setTotalPages(calculatedPages > 0 ? calculatedPages : 1);
        setCurrentPage(page);
      } else if (response && typeof response === 'object' && 'warranties' in response) {
        // Handle legacy response format if API is updated later
        const typedResponse = response as unknown as { warranties: Warranty[], total: number, pages: number };
        setWarranties(typedResponse.warranties);
        setTotalWarranties(typedResponse.total);
        setTotalPages(typedResponse.pages);
        setCurrentPage(page);
      } else {
        console.error('Unexpected API response format:', response);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      console.error('Error fetching warranties:', err);
      setError('Failed to fetch warranties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch warranties that are expiring soon
  const fetchExpiringWarranties = async (days: number = 30) => {
    if (!isAuthenticated || !token) {
      setError('You must be logged in to view expiring warranties');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // The API returns an array of warranties directly
      const response = await apiClient<Warranty[]>(
        `/warranties/expiring?days=${days}`,
        { token }
      );
      
      // Check if response is an array (direct warranties data)
      if (Array.isArray(response)) {
        console.log('Received expiring warranties data:', response);
        setExpiringWarranties(response);
      } else if (response && typeof response === 'object' && 'warranties' in response) {
        // Handle legacy response format if API is updated later
        const typedResponse = response as unknown as { warranties: Warranty[], total: number };
        setExpiringWarranties(typedResponse.warranties);
      } else {
        console.error('Unexpected API response format for expiring warranties:', response);
        setError('Received unexpected data format from server');
      }
    } catch (err) {
      console.error('Error fetching expiring warranties:', err);
      setError('Failed to fetch expiring warranties. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Get a single warranty by ID
  const getWarrantyById = async (id: string): Promise<Warranty | null> => {
    if (!isAuthenticated || !token) {
      setError('You must be logged in to view warranty details');
      return null;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const warranty = await apiClient<Warranty>(
        `/warranties/${id}`,
        { token }
      );
      
      return warranty;
    } catch (err) {
      console.error('Error fetching warranty details:', err);
      setError('Failed to fetch warranty details. Please try again later.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new warranty
  const createWarranty = async (warrantyData: Partial<Warranty>): Promise<Warranty> => {
    if (!isAuthenticated || !token) {
      throw new Error('You must be logged in to create a warranty');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const newWarranty = await apiClient<Warranty>(
        '/warranties',
        { 
          method: 'POST',
          data: warrantyData,
          token 
        }
      );
      
      // Update the warranties list with the new warranty
      setWarranties(prev => [newWarranty, ...prev]);
      
      return newWarranty;
    } catch (err) {
      console.error('Error creating warranty:', err);
      const errorMessage = 'Failed to create warranty. Please try again later.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing warranty
  const updateWarranty = async (id: string, warrantyData: Partial<Warranty>): Promise<Warranty> => {
    if (!isAuthenticated || !token) {
      throw new Error('You must be logged in to update a warranty');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const updatedWarranty = await apiClient<Warranty>(
        `/warranties/${id}`,
        { 
          method: 'PUT',
          data: warrantyData,
          token 
        }
      );
      
      // Update the warranties list with the updated warranty
      setWarranties(prev => 
        prev.map(warranty => 
          warranty._id === id ? updatedWarranty : warranty
        )
      );
      
      // Also update in expiring warranties if present
      setExpiringWarranties(prev => 
        prev.map(warranty => 
          warranty._id === id ? updatedWarranty : warranty
        )
      );
      
      return updatedWarranty;
    } catch (err) {
      console.error('Error updating warranty:', err);
      const errorMessage = 'Failed to update warranty. Please try again later.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a warranty
  const deleteWarranty = async (id: string): Promise<boolean> => {
    if (!isAuthenticated || !token) {
      throw new Error('You must be logged in to delete a warranty');
    }

    setIsLoading(true);
    setError(null);
    
    try {
      await apiClient(
        `/warranties/${id}`,
        { 
          method: 'DELETE',
          token 
        }
      );
      
      // Remove the deleted warranty from the warranties list
      setWarranties(prev => prev.filter(warranty => warranty._id !== id));
      
      // Also remove from expiring warranties if present
      setExpiringWarranties(prev => prev.filter(warranty => warranty._id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting warranty:', err);
      const errorMessage = 'Failed to delete warranty. Please try again later.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchWarranties();
      fetchExpiringWarranties();
    }
  }, [isAuthenticated, token]);

  const value = {
    warranties,
    expiringWarranties,
    isLoading,
    error,
    totalWarranties,
    totalPages,
    currentPage,
    fetchWarranties,
    fetchExpiringWarranties,
    getWarrantyById,
    createWarranty,
    updateWarranty,
    deleteWarranty
  };

  return (
    <WarrantyContext.Provider value={value}>
      {children}
    </WarrantyContext.Provider>
  );
};

export const useWarranty = (): WarrantyContextType => {
  const context = useContext(WarrantyContext);
  if (context === undefined) {
    throw new Error('useWarranty must be used within a WarrantyProvider');
  }
  return context;
};
