'use server';

/**
 * @fileOverview An AI agent that extracts warranty details from uploaded documents.
 *
 * - extractWarrantyDetails - A function that handles the warranty details extraction process.
 * - ExtractWarrantyDetailsInput - The input type for the extractWarrantyDetails function.
 * - ExtractWarrantyDetailsOutput - The return type for the extractWarrantyDetails function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractWarrantyDetailsInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A warranty document (receipt, warranty card) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractWarrantyDetailsInput = z.infer<typeof ExtractWarrantyDetailsInputSchema>;

const ExtractWarrantyDetailsOutputSchema = z.object({
  productName: z.string().describe('The name of the product covered by the warranty.'),
  purchaseDate: z.string().describe('The date the product was purchased (YYYY-MM-DD).'),
  warrantyExpiration: z
    .string()
    .describe('The date the warranty expires (YYYY-MM-DD).'),
  otherDetails: z.string().optional().describe('Any other relevant warranty details.'),
});
export type ExtractWarrantyDetailsOutput = z.infer<typeof ExtractWarrantyDetailsOutputSchema>;

export async function extractWarrantyDetails(
  input: ExtractWarrantyDetailsInput
): Promise<ExtractWarrantyDetailsOutput> {
  return extractWarrantyDetailsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractWarrantyDetailsPrompt',
  input: {schema: ExtractWarrantyDetailsInputSchema},
  output: {schema: ExtractWarrantyDetailsOutputSchema},
  prompt: `You are an AI assistant specialized in extracting warranty details from documents.

  Given the following document, extract the key warranty details, including product name, purchase date, and warranty expiration date.  If possible extract any other details that might be relevant to the warranty.

  Document: {{media url=documentDataUri}}

  Please format the dates as YYYY-MM-DD.
  `,
});

const extractWarrantyDetailsFlow = ai.defineFlow(
  {
    name: 'extractWarrantyDetailsFlow',
    inputSchema: ExtractWarrantyDetailsInputSchema,
    outputSchema: ExtractWarrantyDetailsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
