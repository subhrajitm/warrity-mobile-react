"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ServiceProvider } from '@/contexts/service-context';
import { useService } from '@/contexts/service-context';
import { useToast } from '@/hooks/use-toast';
import { PhoneIcon, MailIcon, GlobeIcon, MapPinIcon, ClockIcon } from 'lucide-react';
import Link from 'next/link';

function ServiceDetailContent() {
  const params = useParams();
  const serviceId = params.id as string;
  const { serviceInfo, isLoading, error, fetchServiceInfo } = useService();
  const { toast } = useToast();
  const [service, setService] = useState<any | null>(null);

  useEffect(() => {
    fetchServiceInfo();
  }, [fetchServiceInfo]);

  useEffect(() => {
    if (serviceInfo && serviceInfo.length > 0) {
      const foundService = serviceInfo.find(item => item._id === serviceId);
      setService(foundService || null);
    }
  }, [serviceInfo, serviceId]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!service) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Not Found</CardTitle>
          <CardDescription>
            The service information you're looking for could not be found.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/service">
            <Button>Back to Service Directory</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{service.name}</CardTitle>
                  <CardDescription className="text-base">
                    {service.company} • {service.serviceType}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">About</h3>
                <p className="text-muted-foreground">{service.description}</p>
              </div>
              
              {service.serviceAreas && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Service Areas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {service.serviceAreas.map((area: string, index: number) => (
                      <div key={index} className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{area}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {service.operatingHours && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Operating Hours</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {Object.entries(service.operatingHours).map(([day, hours]: [string, any]) => (
                      <div key={day} className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className="font-medium">{day}:</span>
                        <span className="ml-2">{hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {service.contactInfo?.phone && (
                <div className="flex items-center">
                  <PhoneIcon className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Phone</div>
                    <a href={`tel:${service.contactInfo.phone}`} className="text-primary hover:underline">
                      {service.contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}
              
              {service.contactInfo?.email && (
                <div className="flex items-center">
                  <MailIcon className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Email</div>
                    <a href={`mailto:${service.contactInfo.email}`} className="text-primary hover:underline">
                      {service.contactInfo.email}
                    </a>
                  </div>
                </div>
              )}
              
              {service.contactInfo?.website && (
                <div className="flex items-center">
                  <GlobeIcon className="h-4 w-4 mr-3 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Website</div>
                    <a 
                      href={service.contactInfo.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {service.contactInfo.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                Request Service
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function ServiceDetailPage() {
  return (
    <ServiceProvider>
      <ServiceDetailContent />
    </ServiceProvider>
  );
}
