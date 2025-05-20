
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, UploadCloud, Sparkles, Loader2, FileText, AlignLeft } from 'lucide-react';
import { cn, fileToDataUri } from '@/lib/utils';
import { format, parseISO, isValid } from 'date-fns';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import type { Warranty, WarrantyFormValues, UploadResponse, ExtractedWarrantyDetails } from '@/types';
import apiClient from '@/lib/api-client';
import { extractWarrantyDetails } from '@/ai/flows/extract-warranty-details'; 
import { summarizeWarrantyDocument } from '@/ai/flows/summarize-warranty-document-flow';
import Image from 'next/image';

const warrantyFormSchema = z.object({
  productName: z.string().min(1, "Product name is required."),
  purchaseDate: z.date({ required_error: "Purchase date is required." }),
  warrantyLength: z.coerce.number().int().positive().optional(), // in months
  warrantyEndDate: z.date().optional(),
  notes: z.string().optional(),
  document: z.instanceof(File).optional().nullable(),
  documentUrl: z.string().optional(),
  category: z.string().optional(),
  retailer: z.string().optional(),
  purchasePrice: z.coerce.number().positive().optional(),
}).refine(data => data.warrantyLength || data.warrantyEndDate, {
  message: "Either warranty length or end date must be provided.",
  path: ["warrantyEndDate"], 
});


interface WarrantyFormProps {
  initialData?: Warranty;
  onSubmitSuccess?: () => void;
}

export function WarrantyForm({ initialData, onSubmitSuccess }: WarrantyFormProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [extractedSummary, setExtractedSummary] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(initialData?.documentUrl || null);

  const defaultValues: Partial<WarrantyFormValues> = initialData ? {
    ...initialData,
    purchaseDate: initialData.purchaseDate && isValid(parseISO(initialData.purchaseDate)) ? parseISO(initialData.purchaseDate) : new Date(),
    warrantyEndDate: initialData.warrantyEndDate && isValid(parseISO(initialData.warrantyEndDate)) ? parseISO(initialData.warrantyEndDate) : undefined,
    document: null,
  } : {
    purchaseDate: new Date(),
  };
  
  const form = useForm<WarrantyFormValues>({
    resolver: zodResolver(warrantyFormSchema),
    defaultValues,
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setValue('document', file);
      setExtractedSummary(null); // Clear previous summary if new file is selected
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null); 
      }
    }
  };

  const handleAIExtraction = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please select a document to extract details.", variant: "destructive" });
      return;
    }
    setIsExtracting(true);
    try {
      const dataUri = await fileToDataUri(selectedFile);
      const extractedData = await extractWarrantyDetails({ documentDataUri: dataUri });
      
      form.setValue('productName', extractedData.productName || form.getValues('productName'));
      if (extractedData.purchaseDate && isValid(new Date(extractedData.purchaseDate))) {
         form.setValue('purchaseDate', new Date(extractedData.purchaseDate));
      }
      if (extractedData.warrantyExpiration && isValid(new Date(extractedData.warrantyExpiration))) {
         form.setValue('warrantyEndDate', new Date(extractedData.warrantyExpiration));
      }
      if(extractedData.otherDetails){
        const currentNotes = form.getValues('notes') || "";
        form.setValue('notes', `${currentNotes}\nAI Extracted Details: ${extractedData.otherDetails}`.trim());
      }
      toast({ title: "Details Extracted", description: "AI has populated some fields. Please review." });
    } catch (error) {
      console.error("AI Extraction Error:", error);
      toast({ title: "AI Extraction Failed", description: (error as Error).message || "Could not extract details.", variant: "destructive" });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleAISummarize = async () => {
    if (!selectedFile) {
      toast({ title: "No file selected", description: "Please select a document to summarize.", variant: "destructive" });
      return;
    }
    setIsSummarizing(true);
    setExtractedSummary(null);
    try {
      const dataUri = await fileToDataUri(selectedFile);
      const result = await summarizeWarrantyDocument({ documentDataUri: dataUri });
      setExtractedSummary(result.summary);
      toast({ title: "Summary Generated", description: "AI has summarized the document." });
    } catch (error) {
      console.error("AI Summarization Error:", error);
      toast({ title: "AI Summarization Failed", description: (error as Error).message || "Could not summarize document.", variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  const onSubmit = async (values: WarrantyFormValues) => {
    setIsSubmitting(true);
    let documentUrl = initialData?.documentUrl;

    if (values.document) {
      const formData = new FormData();
      formData.append('file', values.document);
      try {
        const uploadResponse = await apiClient<UploadResponse>('/upload', {
          method: 'POST',
          body: formData,
          token,
        });
        const API_HOST_URL = 'https://warrityweb-api-x1ev.onrender.com';
        documentUrl = API_HOST_URL + uploadResponse.filePath;
      } catch (error) {
        toast({ title: "File Upload Failed", description: (error as Error).message, variant: "destructive" });
        setIsSubmitting(false);
        return;
      }
    }
    
    const warrantyDataToSubmit = {
      ...values,
      purchaseDate: values.purchaseDate ? format(values.purchaseDate, 'yyyy-MM-dd') : undefined,
      warrantyEndDate: values.warrantyEndDate ? format(values.warrantyEndDate, 'yyyy-MM-dd') : undefined,
      documentUrl: documentUrl,
      document: undefined, 
    };

    try {
      if (initialData?._id) {
        await apiClient<Warranty>(`/warranties/${initialData._id}`, {
          method: 'PUT',
          data: warrantyDataToSubmit,
          token,
        });
        toast({ title: "Success", description: "Warranty updated successfully." });
      } else {
        await apiClient<Warranty>('/warranties', {
          method: 'POST',
          data: warrantyDataToSubmit,
          token,
        });
        toast({ title: "Success", description: "Warranty added successfully." });
      }
      if (onSubmitSuccess) onSubmitSuccess();
      else form.reset(defaultValues); 
      setSelectedFile(null);
      setFilePreview(null);
      setExtractedSummary(null);
    } catch (error) {
      toast({ title: "Submission Failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{initialData ? 'Edit Warranty' : 'Add New Warranty'}</CardTitle>
        <CardDescription>
          {initialData ? 'Update the details of your warranty.' : 'Fill in the details of your new warranty. You can also use AI to extract info or summarize a document.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="productName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SuperBlend Blender X1000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Purchase Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="warrantyEndDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Warranty End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick an end date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>If not set, will be calculated from warranty length.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="warrantyLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warranty Length (Months)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 12 for 1 year" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                  </FormControl>
                  <FormDescription>Provide if end date is not specified.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="document"
              render={({ field }) => ( /* field is not directly used for input type file with react-hook-form custom register */
                <FormItem>
                  <FormLabel>Warranty Document (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*,.pdf,.doc,.docx" 
                      onChange={handleFileChange}
                      className="flex-grow"
                    />
                  </FormControl>
                  {filePreview && filePreview.startsWith('data:image') && (
                     <Image src={filePreview} alt="Document preview" width={100} height={100} className="mt-2 rounded-md object-cover" data-ai-hint="receipt warranty" />
                  )}
                  {filePreview && !filePreview.startsWith('data:image') && filePreview.includes('/uploads/') && (
                    <a href={filePreview} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center mt-2">
                      <FileText className="h-4 w-4 mr-1" /> View Current Document
                    </a>
                  )}
                  {selectedFile && !selectedFile.type.startsWith('image/') && (
                    <p className="text-sm text-muted-foreground mt-1">{selectedFile.name}</p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="space-y-2 sm:space-y-0 sm:flex sm:space-x-2">
                {selectedFile && (
                  <Button type="button" variant="outline" onClick={handleAIExtraction} disabled={isExtracting || isSummarizing} className="w-full sm:w-auto">
                    {isExtracting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                    Extract Details with AI
                  </Button>
                )}
                {selectedFile && (
                   <Button type="button" variant="outline" onClick={handleAISummarize} disabled={isSummarizing || isExtracting} className="w-full sm:w-auto">
                    {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlignLeft className="mr-2 h-4 w-4" />}
                    Summarize with AI
                  </Button>
                )}
            </div>

            {isSummarizing && (
              <div className="space-y-2">
                <Label>AI Summary (Loading...)</Label>
                <Skeleton className="h-24 w-full" />
              </div>
            )}

            {extractedSummary && !isSummarizing && (
              <FormField
                name="aiSummaryDisplay" // Not part of form submission, just for display
                control={form.control} // Needs to be part of form for RHF structure, but won't be submitted
                render={() => (
                  <FormItem>
                    <FormLabel>AI Generated Summary</FormLabel>
                    <FormControl>
                      <Textarea
                        readOnly
                        value={extractedSummary}
                        className="bg-muted/50"
                        rows={6}
                      />
                    </FormControl>
                    <FormDescription>This summary is AI-generated. Please review for accuracy.</FormDescription>
                  </FormItem>
                )}
              />
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Electronics, Appliance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="retailer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Retailer (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Best Buy, Amazon" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (Optional)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="e.g., 199.99" {...field} onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any additional details, serial number, etc." {...field} rows={4} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting || isExtracting || isSummarizing}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {initialData ? 'Update Warranty' : 'Add Warranty'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
