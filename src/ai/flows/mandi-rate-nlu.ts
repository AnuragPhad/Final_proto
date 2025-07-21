// This is a server-side file.
'use server';

/**
 * @fileOverview This file defines a Genkit flow for understanding natural language queries related to mandi rates.
 *
 * - `understandMandiRateQuery`: A function that takes a user's voice query as input and extracts the commodity, market, and date.
 * - `MandiRateQueryInput`: The input type for the `understandMandiRateQuery` function.
 * - `MandiRateQueryOutput`: The output type for the `understandMandiRateQuery` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MandiRateQueryInputSchema = z.object({
  query: z
    .string()
    .describe("The user's natural language query about mandi rates."),
});

export type MandiRateQueryInput = z.infer<typeof MandiRateQueryInputSchema>;

const MandiRateQueryOutputSchema = z.object({
  commodity: z.string().describe('The commodity the user is asking about.'),
  market: z.string().describe('The market the user is asking about.'),
  date: z.string().describe('The date the user is asking about (YYYY-MM-DD).'),
});

export type MandiRateQueryOutput = z.infer<typeof MandiRateQueryOutputSchema>;

export async function understandMandiRateQuery(
  input: MandiRateQueryInput
): Promise<MandiRateQueryOutput> {
  return understandMandiRateQueryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mandiRateNluPrompt',
  input: {schema: MandiRateQueryInputSchema},
  output: {schema: MandiRateQueryOutputSchema},
  prompt: `You are a helpful assistant that extracts information about commodity prices from user queries.

  Your task is to identify the commodity, market, and date from the user's query.
  The date should be in YYYY-MM-DD format. If the date isn't explicitly mentioned, use today's date.

  Here's the user's query:
  {{query}}
  `,
});

const understandMandiRateQueryFlow = ai.defineFlow(
  {
    name: 'understandMandiRateQueryFlow',
    inputSchema: MandiRateQueryInputSchema,
    outputSchema: MandiRateQueryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
