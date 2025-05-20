import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from '@/contexts/auth-context';
import apiClient from '@/lib/api-client';

interface ServiceCenter {
  name: string;
  address: string;
  phone: string;
  email?: string;
  hours?: string;
}

interface WarrantyTerms {
  duration: string;
  coverage: string;
  conditions: string[];
}

interface ContactInformation {
  customerService: string;
  technicalSupport?: string;
  website: string;
}

interface ProductServiceInfo {
  warrantyTerms: WarrantyTerms;
  serviceCenters: ServiceCenter[];
  contactInformation: ContactInformation;
}

interface CompanyServiceInfo {
  company: string;
  servicePolicies: {
    warrantyPolicy: string;
    returnPolicy: string;
    repairPolicy: string;
  };
  contactDetails: {
    customerService: string;
    technicalSupport?: string;
    headquarters?: {
      address: string;
      phone: string;
    };
    website: string;
    socialMedia?: {
      twitter?: string;
      facebook?: string;
      instagram?: string;
    };
  };
  serviceLocations: ServiceCenter[];
}

interface ServiceInfo {
  _id: string;
  name: string;
  company: string;
  serviceType: string;
  description: string;
  contactInfo: {
    phone?: string;
    email?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ServiceContextType {
  serviceInfo: ServiceInfo[];
  productServiceInfo: ProductServiceInfo | null;
  companyServiceInfo: CompanyServiceInfo | null;
  isLoading: boolean;
  error: string | null;
  totalServiceInfo: number;
  totalPages: number;
  currentPage: number;
  fetchServiceInfo: (page?: number, limit?: number, search?: string, serviceType?: string, company?: string, sort?: string) => Promise<void>;
  fetchProductServiceInfo: (productId: string) => Promise<ProductServiceInfo | null>;
  fetchCompanyServiceInfo: (company: string) => Promise<CompanyServiceInfo | null>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(undefined);

export const ServiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [serviceInfo, setServiceInfo] = useState<ServiceInfo[]>([]);
  const [productServiceInfo, setProductServiceInfo] = useState<ProductServiceInfo | null>(null);
  const [companyServiceInfo, setCompanyServiceInfo] = useState<CompanyServiceInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalServiceInfo, setTotalServiceInfo] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const { token, isAuthenticated } = useAuth();

  // Fetch service information with pagination, filtering, and sorting
  const fetchServiceInfo = async (
    page: number = 1, 
    limit: number = 10, 
    search: string = '', 
    serviceType: string = '', 
    company: string = '',
    sort: string = 'nameAsc'
  ) => {
    if (!isAuthenticated || !token) {
      setError('You must be logged in to view service information');
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
      if (serviceType) queryParams.append('serviceType', serviceType);
      if (company) queryParams.append('company', company);
      queryParams.append('sort', sort);
      
      // Using the correct endpoint as per documentation
      const response = await apiClient<{ serviceInfo: ServiceInfo[], total: number, pages: number }>(
        `/service-info/user?${queryParams.toString()}`,
        { token }
      );
      
      setServiceInfo(response.serviceInfo);
      setTotalServiceInfo(response.total);
      setTotalPages(response.pages);
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching service information:', err);
      setError('Failed to fetch service information. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch product-specific service information
  const fetchProductServiceInfo = async (productId: string): Promise<ProductServiceInfo | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const serviceInfo = await apiClient<ProductServiceInfo>(
        `/service-info/product/${productId}`,
        token ? { token } : {}
      );
      
      setProductServiceInfo(serviceInfo);
      return serviceInfo;
    } catch (err) {
      console.error('Error fetching product service information:', err);
      setError('Failed to fetch product service information. Please try again later.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch company-specific service information
  const fetchCompanyServiceInfo = async (company: string): Promise<CompanyServiceInfo | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const serviceInfo = await apiClient<CompanyServiceInfo>(
        `/service-info/company/${encodeURIComponent(company)}`,
        token ? { token } : {}
      );
      
      setCompanyServiceInfo(serviceInfo);
      return serviceInfo;
    } catch (err) {
      console.error('Error fetching company service information:', err);
      setError('Failed to fetch company service information. Please try again later.');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    serviceInfo,
    productServiceInfo,
    companyServiceInfo,
    isLoading,
    error,
    totalServiceInfo,
    totalPages,
    currentPage,
    fetchServiceInfo,
    fetchProductServiceInfo,
    fetchCompanyServiceInfo
  };

  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = (): ServiceContextType => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error('useService must be used within a ServiceProvider');
  }
  return context;
};
