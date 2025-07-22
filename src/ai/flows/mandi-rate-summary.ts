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
import { getMandiRates, MandiRate } from '@/data/mandi-rates';
import { format } from 'date-fns';

const MandiRateSummaryInputSchema = z.object({
  commodity: z.string().describe('The commodity to get rates for.'),
  state: z.string().describe('The state where the market is located.'),
  district: z.string().describe('The district where the market is located.'),
  date: z.string().describe("The date for the rates in 'yyyy-MM-dd' format."),
});

export type MandiRateSummaryInput = z.infer<typeof MandiRateSummaryInputSchema>;

const MandiRateSummaryOutputSchema = z.object({
  summary: z.string().describe("A concise, friendly summary of the market rates. For example, 'Today in Pune, the price for Onion is between X and Y, with an average price of Z per quintal.' or 'No rates found for Onion in Pune today.'"),
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
    schema: z.object({
      commodity: z.string(),
      district: z.string(),
      date: z.string(),
      rates: z.array(z.object({
        market: z.string(),
        minPrice: z.number(),
        maxPrice: z.number(),
        modalPrice: z.number(),
      })).optional(),
    })
  },
  output: {schema: MandiRateSummaryOutputSchema},
  prompt: `You are a helpful assistant for farmers. Your task is to provide a clear and concise summary of commodity prices.
  The user wants to know the price of "{{commodity}}" in "{{district}}" for {{date}}.

  {{#if rates}}
  Based on the available data, here is the summary:
  Today in {{district}}, the price for {{commodity}} is between ₹{{rates.0.minPrice}} and ₹{{rates.0.maxPrice}}, with a modal price of ₹{{rates.0.modalPrice}} per quintal in the {{rates.0.market}} market.
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
    const allRates = await getMandiRates(input.state, input.district);
    
    const selectedDate = new Date(input.date);

    const filteredRates = allRates.filter(rate => {
        if (!rate.arrival_date) return false;
        const [day, month, year] = rate.arrival_date.split('/');
        if (!day || !month || !year) return false;
        try {
            const apiDate = new Date(Number(year), Number(month) - 1, Number(day));
            return format(apiDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
        } catch (e) {
            return false;
        }
    }).filter(rate => rate.commodity.toLowerCase().includes(input.commodity.toLowerCase()));

    const { output } = await prompt({
      commodity: input.commodity,
      district: input.district,
      date: format(selectedDate, 'do MMMM yyyy'),
      rates: filteredRates.length > 0 ? filteredRates.map(r => ({
        market: r.market,
        minPrice: r.minPrice,
        maxPrice: r.maxPrice,
        modalPrice: r.modalPrice,
      })) : undefined,
    });

    return output!;
  }
);
