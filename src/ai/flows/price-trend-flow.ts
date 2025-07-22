'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing price trends and providing selling advice.
 *
 * - `priceTrendFlow`: A function that takes historical price data and returns a trend analysis and suggestion.
 * - `PriceTrendInput`: The input type for the `priceTrendFlow` function.
 * - `PriceTrendOutput`: The output type for the `priceTrendFlow` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

export const PriceTrendInputSchema = z.object({
  commodity: z.string().describe('The commodity being analyzed.'),
  prices: z.array(z.number()).describe('An array of historical modal prices for the last 30 days.'),
});
export type PriceTrendInput = z.infer<typeof PriceTrendInputSchema>;

export const PriceTrendOutputSchema = z.object({
  trend: z.string().describe("A very short description of the price trend (e.g., 'Prices are rising', 'Prices are falling', 'Prices are stable')."),
  suggestion: z.string().describe('A concise, one-sentence suggestion for the farmer on whether to sell now or wait.'),
});
export type PriceTrendOutput = z.infer<typeof PriceTrendOutputSchema>;


export async function priceTrendFlow(input: PriceTrendInput): Promise<PriceTrendOutput> {
  const prompt = ai.definePrompt({
    name: 'priceTrendPrompt',
    input: { schema: PriceTrendInputSchema },
    output: { schema: PriceTrendOutputSchema },
    prompt: `You are an agricultural market analyst. You are given a list of the last 30 days of prices for a commodity. 
    Analyze the trend and provide a short, actionable suggestion to a farmer.

    Commodity: {{commodity}}
    Prices (past 30 days, oldest to newest): {{#each prices}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}

    First, determine if the overall trend is that prices are rising, falling, or are stable. Set this in the 'trend' field.
    Then, based on this trend, provide a simple, one-sentence suggestion to the farmer. For example:
    - If prices are rising: "Prices have been trending upwards. It might be beneficial to wait a little longer before selling."
    - If prices are falling: "Prices have been declining. It could be a good time to sell now to avoid further drops."
    - If prices are stable: "Prices have been stable. Selling now would be a reasonable choice."
    
    Keep the suggestion clear and directly helpful for making a selling decision.`,
  });

  const { output } = await prompt(input);
  return output!;
}
