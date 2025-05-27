import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWarranty } from '@/contexts/warranty-context';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
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

  // Fetch warranty data when component mounts with simplified error handling
  useEffect(() => {
    // Flag to prevent state updates if component unmounts
    let isMounted = true;
    
    const fetchWarrantyData = async () => {
      try {
        setIsLoadingWarranty(true);
        const data = await getWarrantyById(warrantyId);
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        if (data) {
          setWarranty(data);
        } else {
          toast({
            title: 'Error',
            description: 'Warranty not found',
            variant: 'destructive',
          });
          // Don't automatically redirect - let user navigate back manually
        }
      } catch (err: any) {
        console.error('Error fetching warranty:', err);
        
        // Check if component is still mounted
        if (!isMounted) return;
        
        // Show appropriate error message without redirecting
        toast({
          title: 'Error',
          description: err?.response?.status === 429 
            ? 'Server is busy. Please try again in a few moments.'
            : 'Failed to load warranty data',
          variant: 'destructive',
        });
      } finally {
        if (isMounted) {
          setIsLoadingWarranty(false);
        }
      }
    };

    fetchWarrantyData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [warrantyId, getWarrantyById, toast]);

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

  if (isLoadingWarranty) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!warranty) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2">Warranty Not Found</h3>
            <p className="text-muted-foreground mb-4">The warranty you're trying to edit could not be found.</p>
            <Link href="/warranties">
              <Button>Back to Warranties</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href={`/warranties/${warrantyId}`}>
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Warranty Details
          </Button>
        </Link>
      </div>
      
      <WarrantyForm 
        initialData={warranty} 
        isEditing={true} 
      />
    </div>
  );
};

export default WarrantyEditForm;
