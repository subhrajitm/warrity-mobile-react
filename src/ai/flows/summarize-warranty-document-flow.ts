
'use server';
/**
 * @fileOverview An AI agent that summarizes warranty documents.
 *
 * - summarizeWarrantyDocument - A function that handles the warranty document summarization.
 * - SummarizeWarrantyDocumentInput - The input type for the summarizeWarrantyDocument function.
 * - SummarizeWarrantyDocumentOutput - The return type for the summarizeWarrantyDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeWarrantyDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "The warranty document (e.g., receipt, warranty card) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeWarrantyDocumentInput = z.infer<typeof SummarizeWarrantyDocumentInputSchema>;

const SummarizeWarrantyDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the warranty document, highlighting key terms, coverage periods, and major exclusions.'),
});
export type SummarizeWarrantyDocumentOutput = z.infer<typeof SummarizeWarrantyDocumentOutputSchema>;

export async function summarizeWarrantyDocument(
  input: SummarizeWarrantyDocumentInput
): Promise<SummarizeWarrantyDocumentOutput> {
  return summarizeWarrantyDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeWarrantyDocumentPrompt',
  input: {schema: SummarizeWarrantyDocumentInputSchema},
  output: {schema: SummarizeWarrantyDocumentOutputSchema},
  prompt: `You are an AI assistant skilled in analyzing legal and technical documents.
  Please summarize the key aspects of the following warranty document.
  Focus on:
  - The product or service covered by the warranty.
  - The duration of the warranty or its expiration date.
  - Main points of what is covered under the warranty.
  - Any significant exclusions, limitations, or conditions.
  Present the summary in clear, easy-to-understand language, using bullet points for key details if appropriate.

  Document: {{media url=documentDataUri}}
  `,
});

const summarizeWarrantyDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeWarrantyDocumentFlow',
    inputSchema: SummarizeWarrantyDocumentInputSchema,
    outputSchema: SummarizeWarrantyDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

