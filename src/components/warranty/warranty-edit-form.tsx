import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWarranty } from '@/contexts/warranty-context';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, RefreshCw, AlertCircle, Info } from 'lucide-react';
import WarrantyForm from './warranty-form';
import { Warranty } from '@/types';
import Link from 'next/link';

interface WarrantyEditFormProps {
  warrantyId: string;
}

const WarrantyEditForm: React.FC<WarrantyEditFormProps> = ({ warrantyId }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { getWarrantyById, isLoading, error } = useWarranty();
  const [warranty, setWarranty] = useState<Warranty | null>(null);
  const [isLoadingWarranty, setIsLoadingWarranty] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch warranty data function that can be called for retries
  const fetchWarrantyData = async (showToast = true) => {
    try {
      setIsLoadingWarranty(true);
      setLoadError(null);
      setIsRateLimited(false);
      setIsRetrying(true);
      
      const data = await getWarrantyById(warrantyId);
      
      if (data) {
        setWarranty(data);
        if (retryCount > 0 && showToast) {
          toast({
            title: 'Success',
            description: 'Warranty data loaded successfully',
            variant: 'default',
          });
        }
      } else {
        setLoadError('Warranty not found');
        if (showToast) {
          toast({
            title: 'Error',
            description: 'Warranty not found',
            variant: 'destructive',
          });
        }
      }
    } catch (err: any) {
      console.error('Error fetching warranty:', err);
      
      // Check if rate limited
      if (err?.response?.status === 429) {
        setIsRateLimited(true);
        setLoadError('Server is busy. Please try again in a few moments.');
      } else {
        setLoadError(err?.message || 'Failed to load warranty data');
      }
      
      if (showToast) {
        toast({
          title: 'Error',
          description: err?.response?.status === 429 
            ? 'Server is busy. Please try again in a few moments.'
            : 'Failed to load warranty data',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoadingWarranty(false);
      setIsRetrying(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchWarrantyData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warrantyId]);

  // Handle retry button click
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchWarrantyData(true);
  };

  // Show error toast if there's an error from context
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  if (isLoadingWarranty && !isRetrying) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
        <p className="mt-4 text-muted-foreground">Loading warranty data...</p>
      </div>
    );
  }

  if (loadError && !warranty) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
            Error Loading Warranty
          </CardTitle>
          <CardDescription>
            We encountered a problem while loading the warranty data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant={isRateLimited ? "default" : "destructive"} className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>{isRateLimited ? "Rate Limited" : "Error"}</AlertTitle>
            <AlertDescription>{loadError}</AlertDescription>
          </Alert>
          
          {isRateLimited && (
            <div className="bg-muted p-3 rounded-md mb-4">
              <div className="flex items-start">
                <Info className="h-4 w-4 mr-2 mt-0.5 text-primary" />
                <div className="text-sm">
                  <p className="font-medium">What does this mean?</p>
                  <p className="text-muted-foreground">The server is currently processing too many requests. This is a temporary issue and your data is safe.</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Link href={`/warranties/${warrantyId}`}>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Details
            </Button>
          </Link>
          <Button 
            onClick={handleRetry} 
            disabled={isRetrying}
            className={isRateLimited ? "bg-primary" : ""}
          >
            {isRetrying ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (!warranty) {
    return (
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Warranty Not Found</CardTitle>
          <CardDescription>
            The warranty you're trying to edit could not be found.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">The warranty may have been deleted or you may not have permission to view it.</p>
        </CardContent>
        <CardFooter>
          <Link href="/warranties">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Warranties
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Link href={`/warranties/${warrantyId}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Warranty Details
          </Button>
        </Link>
        
        {isRetrying && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Spinner className="mr-2 h-3 w-3" />
            Refreshing data...
          </div>
        )}
      </div>
      
      {isRateLimited && (
        <Alert variant="default" className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>Using Cached Data</AlertTitle>
          <AlertDescription>
            Due to high server load, we're using cached data. Your changes will be saved locally and synchronized when possible.
          </AlertDescription>
        </Alert>
      )}
      
      <WarrantyForm 
        initialData={warranty} 
        isEditing={true} 
        isOffline={isRateLimited}
      />
    </div>
  );
};

export default WarrantyEditForm;
