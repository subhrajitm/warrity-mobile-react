import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useWarranty } from '@/contexts/warranty-context';
import { useProduct } from '@/contexts/product-context';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { CustomSelect, Option } from '@/components/ui/custom-select';
import { DatePicker } from '@/components/ui/date-picker';
import { Spinner } from '@/components/ui/spinner';
import { Warranty } from '@/types';
import { format } from 'date-fns';

// Validation schema for warranty form
const warrantyFormSchema = z.object({
  productName: z.string().min(2, { message: 'Product name must be at least 2 characters' }),
  productBrand: z.string().min(2, { message: 'Brand must be at least 2 characters' }),
  productCategory: z.string().min(2, { message: 'Please select a category' }),
  productModel: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.date({ required_error: 'Purchase date is required' }),
  expiryDate: z.date({ required_error: 'Expiry date is required' }),
  retailer: z.string().optional(),
  purchasePrice: z.string().optional(),
  warrantyProvider: z.string().optional(),
  warrantyTerms: z.string().optional(),
  receiptImage: z.any().optional(),
  warrantyImage: z.any().optional(),
  notes: z.string().optional(),
});

type WarrantyFormValues = z.infer<typeof warrantyFormSchema>;

interface WarrantyFormProps {
  initialData?: Warranty;
  isEditing?: boolean;
}

const WarrantyForm: React.FC<WarrantyFormProps> = ({ initialData, isEditing = false }) => {
  const router = useRouter();
  const { toast } = useToast();
  const { createWarranty, updateWarranty, isLoading, error } = useWarranty();
  const { categories, fetchCategories } = useProduct();
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [warrantyFile, setWarrantyFile] = useState<File | null>(null);

  // Initialize form with default values or existing warranty data
  const form = useForm<WarrantyFormValues>({
    resolver: zodResolver(warrantyFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      purchaseDate: new Date(initialData.purchaseDate),
      expiryDate: new Date(initialData.expiryDate),
      purchasePrice: initialData.purchasePrice?.toString() || '',
    } : {
      productName: '',
      productBrand: '',
      productCategory: '',
      productModel: '',
      serialNumber: '',
      purchaseDate: new Date(),
      expiryDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Default 1 year warranty
      retailer: '',
      purchasePrice: '',
      warrantyProvider: '',
      warrantyTerms: '',
      notes: '',
    },
  });

  // Fetch product categories when component mounts
  useEffect(() => {
    fetchCategories();
  }, []);

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

  // Handle file uploads
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  const handleWarrantyUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setWarrantyFile(e.target.files[0]);
    }
  };

  // Handle form submission
  const onSubmit = async (data: WarrantyFormValues) => {
    try {
      // Prepare form data for API
      const warrantyData: Partial<Warranty> = {
        ...data,
        purchaseDate: format(data.purchaseDate, 'yyyy-MM-dd'),
        expiryDate: format(data.expiryDate, 'yyyy-MM-dd'),
        purchasePrice: data.purchasePrice ? parseFloat(data.purchasePrice) : undefined,
      };

      // Create or update warranty
      if (isEditing && initialData) {
        await updateWarranty(initialData._id, warrantyData);
        toast({
          title: 'Success',
          description: 'Warranty updated successfully',
        });
      } else {
        await createWarranty(warrantyData);
        toast({
          title: 'Success',
          description: 'Warranty created successfully',
        });
      }

      // Redirect to warranties page
      router.push('/warranties');
    } catch (err) {
      console.error('Error submitting warranty:', err);
      toast({
        title: 'Error',
        description: 'Failed to save warranty. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Warranty' : 'Add New Warranty'}</CardTitle>
        <CardDescription>
          {isEditing 
            ? 'Update your warranty information below.' 
            : 'Enter your product warranty details to keep track of it.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Product Information</h3>
                
                <FormField
                  control={form.control}
                  name="productName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Samsung TV" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productBrand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand*</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Samsung" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="productCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category*</FormLabel>
                        <FormControl>
                          <CustomSelect
                            value={field.value || ''}
                            onChange={field.onChange}
                            placeholder="Select a category"
                            options={categories.length > 0 
                              ? categories.map(category => ({ label: category, value: category }))
                              : [
                                  { label: 'Electronics', value: 'electronics' },
                                  { label: 'Appliances', value: 'appliances' },
                                  { label: 'Furniture', value: 'furniture' },
                                  { label: 'Automotive', value: 'automotive' },
                                  { label: 'Other', value: 'other' }
                                ]
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Model Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. UN55TU8000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="serialNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serial Number</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. XYZ123456789" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Warranty Information */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Warranty Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="purchaseDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Purchase Date*</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Expiry Date*</FormLabel>
                        <FormControl>
                          <DatePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="retailer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Retailer</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Best Buy" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="purchasePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Purchase Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="e.g. 499.99" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="warrantyProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Provider</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Samsung or Extended Warranty Provider" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="warrantyTerms"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Warranty Terms</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter warranty terms and conditions..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Document Uploads */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Documentation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Receipt Image</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleReceiptUpload} 
                      />
                    </FormControl>
                    <FormDescription>
                      Upload a photo or scan of your receipt.
                    </FormDescription>
                  </FormItem>
                  
                  <FormItem>
                    <FormLabel>Warranty Document</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        accept="image/*,.pdf" 
                        onChange={handleWarrantyUpload} 
                      />
                    </FormControl>
                    <FormDescription>
                      Upload warranty card or document.
                    </FormDescription>
                  </FormItem>
                </div>
              </div>
              
              {/* Additional Notes */}
              <div className="md:col-span-2">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Any additional information about this warranty..." 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/warranties')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Spinner className="mr-2" /> : null}
                {isEditing ? 'Update Warranty' : 'Create Warranty'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WarrantyForm;
