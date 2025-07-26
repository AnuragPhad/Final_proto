'use server';

/**
 * @fileOverview This file defines a Genkit flow for fetching and summarizing mandi rates for a specific commodity.
 *
 * - `mandiRateSummary`: A function that takes a commodity, state, and district, fetches the rates, and generates a summary.
 * - `MandiRateSummaryInput`: The input type for the `mandiRateSummary` function.
 * - `MandiRateSummaryOutput`: The output type for the `mandiRateSummary` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { format } from 'date-fns';

const MandiRateDataSchema = z.object({
  market: z.string(),
  minPrice: z.number(),
  maxPrice: z.number(),
  modalPrice: z.number(),
});

const MandiRateSummaryInputSchema = z.object({
  commodity: z.string().describe('The commodity to get rates for.'),
  district: z.string().describe('The district where the market is located.'),
  date: z.string().describe("The date for the rates in 'do MMMM yyyy' format."),
  rates: z.array(MandiRateDataSchema).optional().describe('The list of market rates for the given commodity and location.'),
  language: z.string().optional().describe("The language for the response, e.g., 'en', 'hi', 'mr'."),
});

export type MandiRateSummaryInput = z.infer<typeof MandiRateSummaryInputSchema>;

const MandiRateSummaryOutputSchema = z.object({
  summary: z.string().describe("A concise, friendly summary of the market rates. For example, 'Today in Pune, the price for Onion is between Rs X and Rs Y, with an average price of Rs Z per quintal.' or 'No rates found for Onion in Pune today.'"),
});

export type MandiRateSummaryOutput = z.infer<typeof MandiRateSummaryOutputSchema>;

export async function mandiRateSummary(
  input: MandiRateSummaryInput
): Promise<MandiRateSummaryOutput> {
  return mandiRateSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'mandiRateSummaryPrompt',
  input: {
    schema: MandiRateSummaryInputSchema,
  },
  output: {schema: MandiRateSummaryOutputSchema},
  prompt: `You are a helpful assistant for farmers. Your task is to provide a clear and concise summary of commodity prices in the requested language.
  
  The user wants to know the price of "{{commodity}}" in "{{district}}" for {{date}}.
  The response MUST be in this language: {{language}}.

  {{#if rates}}
  Based on the available data, here is the summary:
  Today in {{district}}, the price for {{commodity}} is between Rs {{rates.0.minPrice}} and Rs {{rates.0.maxPrice}}, with a modal price of Rs {{rates.0.modalPrice}} per quintal in the {{rates.0.market}} market.
  {{else}}
  I could not find any rates for "{{commodity}}" in "{{district}}" for {{date}}. The market may be closed or data may not be available.
  {{/if}}

  Provide a friendly, one-sentence summary based on the information above. If there are rates, state the min, max, and modal price clearly. If not, say that you could not find any.
  `,
});

const mandiRateSummaryFlow = ai.defineFlow(
  {
    name: 'mandiRateSummaryFlow',
    inputSchema: MandiRateSummaryInputSchema,
    outputSchema: MandiRateSummaryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
