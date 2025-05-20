import React, { useState, useEffect } from 'react';
import { useService } from '@/contexts/service-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CustomSelect } from '@/components/ui/custom-select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pagination } from '@/components/ui/pagination';
import { Spinner } from '@/components/ui/spinner';
import { SearchIcon, FilterIcon, BuildingIcon, PhoneIcon, MailIcon, GlobeIcon } from 'lucide-react';
import Link from 'next/link';

const ServiceDirectory = () => {
  const { 
    serviceInfo, 
    isLoading, 
    error, 
    totalServiceInfo, 
    totalPages, 
    currentPage,
    fetchServiceInfo 
  } = useService();
  
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedServiceType, setSelectedServiceType] = useState('all-service-types');
  const [selectedCompany, setSelectedCompany] = useState('all-companies');
  const [sortOption, setSortOption] = useState('nameAsc');
  const [companies, setCompanies] = useState<string[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Convert special values to empty strings for API
    const serviceType = selectedServiceType === 'all-service-types' ? '' : selectedServiceType;
    const company = selectedCompany === 'all-companies' ? '' : selectedCompany;
    fetchServiceInfo(1, 10, searchTerm, serviceType, company, sortOption);
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    // Convert special values to empty strings for API
    const serviceType = selectedServiceType === 'all-service-types' ? '' : selectedServiceType;
    const company = selectedCompany === 'all-companies' ? '' : selectedCompany;
    fetchServiceInfo(page, 10, searchTerm, serviceType, company, sortOption);
  };
  
  // Handle filter change
  const handleFilterChange = () => {
    // Convert special values to empty strings for API
    const serviceType = selectedServiceType === 'all-service-types' ? '' : selectedServiceType;
    const company = selectedCompany === 'all-companies' ? '' : selectedCompany;
    fetchServiceInfo(1, 10, searchTerm, serviceType, company, sortOption);
  };
  
  // Extract unique companies and service types from service info
  useEffect(() => {
    if (serviceInfo.length > 0) {
      const uniqueCompanies = Array.from(new Set(serviceInfo.map(service => service.company)));
      const uniqueServiceTypes = Array.from(new Set(serviceInfo.map(service => service.serviceType)));
      setCompanies(uniqueCompanies);
      setServiceTypes(uniqueServiceTypes);
    }
  }, [serviceInfo]);
  
  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);
  
  // Fetch service info when component mounts
  useEffect(() => {
    fetchServiceInfo();
  }, []);
  
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Service Directory</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
          <CardDescription>
            Find service providers by name, type, or company.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="Search service providers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <SearchIcon className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex flex-wrap gap-2">
              <CustomSelect
                value={selectedServiceType}
                onChange={(value) => {
                  setSelectedServiceType(value);
                  handleFilterChange();
                }}
                placeholder="All Service Types"
                className="w-[180px]"
                options={[
                  { label: 'All Service Types', value: 'all-service-types' },
                  ...serviceTypes.map(type => ({ label: type, value: type }))
                ]}
              />
              
              <CustomSelect
                value={selectedCompany}
                onChange={(value) => {
                  setSelectedCompany(value);
                  handleFilterChange();
                }}
                placeholder="All Companies"
                className="w-[180px]"
                options={[
                  { label: 'All Companies', value: 'all-companies' },
                  ...companies.map(company => ({ label: company, value: company }))
                ]}
              />
              
              <CustomSelect
                value={sortOption}
                onChange={(value) => {
                  setSortOption(value);
                  handleFilterChange();
                }}
                placeholder="Sort By"
                className="w-[180px]"
                options={[
                  { label: 'Name (A-Z)', value: 'nameAsc' },
                  { label: 'Name (Z-A)', value: 'nameDesc' },
                  { label: 'Company (A-Z)', value: 'companyAsc' },
                  { label: 'Type (A-Z)', value: 'typeAsc' },
                  { label: 'Newest First', value: 'newest' }
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="grid">Grid View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : serviceInfo.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No service providers found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm('');
                setSelectedServiceType('');
                setSelectedCompany('');
                setSortOption('nameAsc');
                fetchServiceInfo();
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {serviceInfo.map((service) => (
                <Card key={service._id} className="overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 md:w-3/4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold">{service.name}</h3>
                          <p className="text-sm text-muted-foreground">{service.company} • {service.serviceType}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm">{service.description}</p>
                      </div>
                    </div>
                    
                    <div className="bg-muted p-6 md:w-1/4">
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2">
                        {service.contactInfo.phone && (
                          <div className="flex items-center text-sm">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            <span>{service.contactInfo.phone}</span>
                          </div>
                        )}
                        {service.contactInfo.email && (
                          <div className="flex items-center text-sm">
                            <MailIcon className="h-4 w-4 mr-2" />
                            <span>{service.contactInfo.email}</span>
                          </div>
                        )}
                        {service.contactInfo.website && (
                          <div className="flex items-center text-sm">
                            <GlobeIcon className="h-4 w-4 mr-2" />
                            <a 
                              href={service.contactInfo.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <Link href={`/service/${service._id}`}>
                          <Button variant="outline" size="sm" className="w-full">View Details</Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="grid">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : serviceInfo.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No service providers found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm('');
                setSelectedServiceType('');
                setSelectedCompany('');
                setSortOption('nameAsc');
                fetchServiceInfo();
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {serviceInfo.map((service) => (
                  <Card key={service._id} className="h-full flex flex-col">
                    <CardHeader>
                      <CardTitle>{service.name}</CardTitle>
                      <CardDescription>
                        {service.company} • {service.serviceType}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                      <div className="space-y-2">
                        {service.contactInfo.phone && (
                          <div className="flex items-center text-sm">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            <span>{service.contactInfo.phone}</span>
                          </div>
                        )}
                        {service.contactInfo.email && (
                          <div className="flex items-center text-sm">
                            <MailIcon className="h-4 w-4 mr-2" />
                            <span>{service.contactInfo.email}</span>
                          </div>
                        )}
                        {service.contactInfo.website && (
                          <div className="flex items-center text-sm">
                            <GlobeIcon className="h-4 w-4 mr-2" />
                            <a 
                              href={service.contactInfo.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/service/${service._id}`} className="w-full">
                        <Button variant="outline" className="w-full">View Details</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceDirectory;
