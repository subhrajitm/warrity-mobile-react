import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWarranty } from '@/contexts/warranty-context';
import { useService } from '@/contexts/service-context';
import { useCalendar } from '@/contexts/calendar-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CalendarIcon, FileIcon, InfoIcon, TrashIcon, PencilIcon, ClockIcon, CalendarPlusIcon } from 'lucide-react';
import { format, differenceInDays, isBefore, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Warranty } from '@/types';

interface WarrantyDetailProps {
  warrantyId: string;
}

const WarrantyDetail: React.FC<WarrantyDetailProps> = ({ warrantyId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { getWarrantyById, deleteWarranty, isLoading, error } = useWarranty();
  const { fetchProductServiceInfo, productServiceInfo } = useService();
  const { createEvent } = useCalendar();
  
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Fetch warranty details when component mounts
  useEffect(() => {
    const loadWarrantyDetails = async () => {
      const warrantyData = await getWarrantyById(warrantyId);
      if (warrantyData) {
        setWarranty(warrantyData);
        // If warranty has product information, fetch service info
        if (warrantyData.productId) {
          fetchProductServiceInfo(warrantyData.productId);
        }
      }
    };
    
    loadWarrantyDetails();
  }, [warrantyId]);
  
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
  
  // Calculate warranty status
  const getWarrantyStatus = () => {
    if (!warranty) return null;
    
    const today = new Date();
    const expiryDate = getValidDate(warranty.expiryDate);
    
    // If we couldn't get a valid date, show an error badge
    if (!expiryDate) {
      return <Badge variant="outline">Invalid Date</Badge>;
    }
    
    if (isBefore(expiryDate, today)) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    const daysLeft = differenceInDays(expiryDate, today);
    
    if (daysLeft <= 30) {
      return <Badge variant="warning">Expiring Soon</Badge>;
    }
    
    return <Badge variant="success">Active</Badge>;
  };
  
  // Format date for display
  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'N/A';
    
    // Try to parse the date and handle invalid dates
    try {
      const date = new Date(dateString);
      
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Safely get a valid date object or null
  const getValidDate = (dateString: string | undefined | null): Date | null => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };
  
  // Handle warranty deletion
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteWarranty(warrantyId);
      toast({
        title: 'Success',
        description: 'Warranty deleted successfully',
      });
      router.push('/warranties');
    } catch (err) {
      console.error('Error deleting warranty:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete warranty',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Create a reminder event for warranty expiration
  const createExpiryReminder = async () => {
    if (!warranty) return;
    
    try {
      // Create an event 30 days before expiry
      const expiryDate = new Date(warranty.expiryDate);
      const reminderDate = new Date(expiryDate);
      reminderDate.setDate(reminderDate.getDate() - 30);
      
      await createEvent({
        title: `Warranty Expiring: ${warranty.productName}`,
        description: `Your warranty for ${warranty.productName} (${warranty.productBrand}) will expire on ${formatDate(warranty.expiryDate)}.`,
        startDate: reminderDate.toISOString(),
        endDate: reminderDate.toISOString(),
        type: 'warranty',
        relatedItemId: warrantyId
      });
      
      toast({
        title: 'Success',
        description: 'Expiry reminder created successfully',
      });
    } catch (err) {
      console.error('Error creating reminder:', err);
      toast({
        title: 'Error',
        description: 'Failed to create reminder',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (!warranty) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Warranty Not Found</CardTitle>
          <CardDescription>
            The warranty you're looking for could not be found.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/warranties">
            <Button>Back to Warranties</Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <div className="container mx-auto py-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold">{warranty.productName}</h1>
          <p className="text-sm text-muted-foreground">{warranty.productBrand} • {warranty.productCategory}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={createExpiryReminder}>
            <CalendarPlusIcon className="mr-2 h-4 w-4" />
            Add Reminder
          </Button>
          <Link href={`/warranties/${warrantyId}/edit`}>
            <Button variant="secondary">
              <PencilIcon className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <TrashIcon className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the warranty for {warranty.productName}.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? <Spinner className="mr-2" /> : null}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="service">Service</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Warranty Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Product Information</h3>
                      <div className="space-y-1 text-sm">
                        <div className="grid grid-cols-3 gap-1">
                          <span className="font-medium">Name:</span> 
                          <span className="col-span-2">{warranty.productName}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="font-medium">Brand:</span>
                          <span className="col-span-2">{warranty.productBrand}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          <span className="font-medium">Category:</span>
                          <span className="col-span-2">{warranty.productCategory}</span>
                        </div>
                        {warranty.productModel && (
                          <div className="grid grid-cols-3 gap-1">
                            <span className="font-medium">Model:</span>
                            <span className="col-span-2">{warranty.productModel}</span>
                          </div>
                        )}
                        {warranty.serialNumber && (
                          <div className="grid grid-cols-3 gap-1">
                            <span className="font-medium">Serial #:</span>
                            <span className="col-span-2">{warranty.serialNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Purchase Information</h3>
                      <div className="space-y-1 text-sm">
                        <div className="grid grid-cols-3 gap-1">
                          <span className="font-medium">Date:</span>
                          <span className="col-span-2">{formatDate(warranty.purchaseDate)}</span>
                        </div>
                        {warranty.retailer && (
                          <div className="grid grid-cols-3 gap-1">
                            <span className="font-medium">Retailer:</span>
                            <span className="col-span-2">{warranty.retailer}</span>
                          </div>
                        )}
                        {warranty.purchasePrice && (
                          <div className="grid grid-cols-3 gap-1">
                            <span className="font-medium">Price:</span>
                            <span className="col-span-2">${warranty.purchasePrice.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Warranty Information</h3>
                    <div className="space-y-1 text-sm">
                      <div className="grid grid-cols-3 gap-1">
                        <span className="font-medium">Status:</span> 
                        <span className="col-span-2">{getWarrantyStatus()}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1">
                        <span className="font-medium">Expires:</span>
                        <span className="col-span-2">{formatDate(warranty.expiryDate)}</span>
                      </div>
                      {warranty.warrantyProvider && (
                        <div className="grid grid-cols-3 gap-1">
                          <span className="font-medium">Provider:</span>
                          <span className="col-span-2">{warranty.warrantyProvider}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {warranty.warrantyTerms && (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Warranty Terms</h3>
                      <div className="p-3 bg-muted rounded-md text-sm">
                        <p className="whitespace-pre-line">{warranty.warrantyTerms}</p>
                      </div>
                    </div>
                  )}
                  
                  {warranty.notes && (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Additional Notes</h3>
                      <div>
                        <p className="whitespace-pre-line text-sm">{warranty.notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="service">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Service Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {productServiceInfo ? (
                    <div className="space-y-6">
                      {productServiceInfo.warrantyTerms && (
                        <div>
                          <h3 className="text-lg font-medium">Warranty Terms</h3>
                          <div className="mt-2 space-y-2">
                            <div>
                              <span className="font-medium">Duration:</span> {productServiceInfo.warrantyTerms.duration}
                            </div>
                            <div>
                              <span className="font-medium">Coverage:</span> {productServiceInfo.warrantyTerms.coverage}
                            </div>
                            {productServiceInfo.warrantyTerms.conditions.length > 0 && (
                              <div>
                                <span className="font-medium">Conditions:</span>
                                <ul className="list-disc list-inside mt-1">
                                  {productServiceInfo.warrantyTerms.conditions.map((condition, index) => (
                                    <li key={index}>{condition}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {productServiceInfo.serviceCenters && productServiceInfo.serviceCenters.length > 0 && (
                        <div>
                          <h3 className="text-lg font-medium">Service Centers</h3>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {productServiceInfo.serviceCenters.map((center, index) => (
                              <Card key={index} className="overflow-hidden">
                                <CardHeader className="p-4">
                                  <CardTitle className="text-base">{center.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 space-y-2">
                                  <div>
                                    <span className="font-medium">Address:</span> {center.address}
                                  </div>
                                  <div>
                                    <span className="font-medium">Phone:</span> {center.phone}
                                  </div>
                                  {center.email && (
                                    <div>
                                      <span className="font-medium">Email:</span> {center.email}
                                    </div>
                                  )}
                                  {center.hours && (
                                    <div>
                                      <span className="font-medium">Hours:</span> {center.hours}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {productServiceInfo.contactInformation && (
                        <div>
                          <h3 className="text-lg font-medium">Contact Information</h3>
                          <div className="mt-2 space-y-2">
                            <div>
                              <span className="font-medium">Customer Service:</span> {productServiceInfo.contactInformation.customerService}
                            </div>
                            {productServiceInfo.contactInformation.technicalSupport && (
                              <div>
                                <span className="font-medium">Technical Support:</span> {productServiceInfo.contactInformation.technicalSupport}
                              </div>
                            )}
                            <div>
                              <span className="font-medium">Website:</span>{' '}
                              <a 
                                href={productServiceInfo.contactInformation.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {productServiceInfo.contactInformation.website}
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <InfoIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                      <p className="mt-4 text-muted-foreground">No service information available for this product.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Documents</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Receipt</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {warranty.receiptImage ? (
                          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                            <img 
                              src={warranty.receiptImage ? `/api/proxy/${warranty.receiptImage.replace(/^https?:\/\/[^\/]+\//, '')}` : ''} 
                              alt="Receipt" 
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted rounded-md flex flex-col items-center justify-center">
                            <FileIcon className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">No receipt uploaded</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        {warranty.receiptImage && (
                          <a 
                            href={warranty.receiptImage ? `/api/proxy/${warranty.receiptImage.replace(/^https?:\/\/[^\/]+\//, '')}` : ''} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button variant="outline" className="w-full">
                              View Full Size
                            </Button>
                          </a>
                        )}
                      </CardFooter>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Warranty Document</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {warranty.warrantyImage ? (
                          <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                            <img 
                              src={warranty.warrantyImage ? `/api/proxy/${warranty.warrantyImage.replace(/^https?:\/\/[^\/]+\//, '')}` : ''} 
                              alt="Warranty Document" 
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted rounded-md flex flex-col items-center justify-center">
                            <FileIcon className="h-12 w-12 text-muted-foreground" />
                            <p className="mt-2 text-muted-foreground">No warranty document uploaded</p>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter>
                        {warranty.warrantyImage && (
                          <a 
                            href={warranty.warrantyImage ? `/api/proxy/${warranty.warrantyImage.replace(/^https?:\/\/[^\/]+\//, '')}` : ''} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full"
                          >
                            <Button variant="outline" className="w-full">
                              View Full Size
                            </Button>
                          </a>
                        )}
                      </CardFooter>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Warranty Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Status:</span>
                  <span>{getWarrantyStatus()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Purchase Date:</span>
                  <span>{formatDate(warranty.purchaseDate)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Expiry Date:</span>
                  <span>{formatDate(warranty.expiryDate)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span>
                      {(() => {
                        // Validate the date before using it
                        try {
                          const expiryDate = new Date(warranty.expiryDate);
                          
                          // Check if the date is valid
                          if (isNaN(expiryDate.getTime())) {
                            return 'Invalid expiry date';
                          }
                          
                          return isBefore(expiryDate, new Date())
                            ? 'Expired ' + formatDistanceToNow(expiryDate, { addSuffix: true })
                            : 'Expires ' + formatDistanceToNow(expiryDate, { addSuffix: true });
                        } catch (error) {
                          console.error('Error formatting expiry date:', error);
                          return 'Invalid expiry date';
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col space-y-2 pt-2">
              <Button size="sm" className="w-full" onClick={createExpiryReminder}>
                <CalendarIcon className="mr-2 h-3 w-3" />
                Add to Calendar
              </Button>
              <Link href={`/warranties/${warrantyId}/edit`} className="w-full">
                <Button size="sm" variant="outline" className="w-full">
                  <PencilIcon className="mr-2 h-3 w-3" />
                  Edit Warranty
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WarrantyDetail;
