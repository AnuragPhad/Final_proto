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
  commodity: z.string().describe('The commodity the user is asking about. This is the primary subject of the query.'),
  market: z.string().optional().describe('The market (city or district) the user is asking about. This may not be present in the query.'),
  date: z.string().optional().describe('The date the user is asking about (YYYY-MM-DD). If not specified, it is today.'),
  summary: z.string().describe("A concise, friendly summary of the action being taken, for example 'Showing rates for Onion in Pune for today.' or 'Understood you want rates for Potato.'")
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

  Your task is to identify the commodity, and optionally the market and date from the user's query.
  - The commodity is the most important piece of information.
  - The market might be a city or a district name. If no market is mentioned, leave it empty.
  - The date should be in YYYY-MM-DD format. If the date isn't explicitly mentioned, use today's date, but leave the field empty if only the commodity is mentioned.
  - Create a short, friendly summary confirming what you understood. For example: "Showing rates for Apples in Mumbai." or if no location is given, "Finding rates for Potato.".

  User's query: "{{query}}"
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
