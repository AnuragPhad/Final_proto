'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing commodity prices across different markets.
 *
 * - `commodityAnalysisFlow`: A function that takes a commodity and a list of market prices and returns an analysis.
 * - `CommodityAnalysisInput`: The input type for the flow.
 * - `CommodityAnalysisOutput`: The output type for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const MarketPriceSchema = z.object({
  market: z.string().describe('The name of the market (city or district).'),
  price: z.number().describe('The modal price of the commodity in that market.'),
});

const CommodityAnalysisInputSchema = z.object({
  commodity: z.string().describe('The commodity being analyzed.'),
  prices: z.array(MarketPriceSchema).describe('An array of prices from different markets.'),
});
export type CommodityAnalysisInput = z.infer<typeof CommodityAnalysisInputSchema>;

const CommodityAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise, one or two-sentence summary advising the farmer on the best market to sell, highlighting the highest and lowest prices.'),
  highestPriceMarket: z.string().describe('The market with the highest price.'),
  lowestPriceMarket: z.string().describe('The market with the lowest price.'),
});
export type CommodityAnalysisOutput = z.infer<typeof CommodityAnalysisOutputSchema>;


export async function commodityAnalysisFlow(input: CommodityAnalysisInput): Promise<CommodityAnalysisOutput> {
  const prompt = ai.definePrompt({
    name: 'commodityAnalysisPrompt',
    input: { schema: CommodityAnalysisInputSchema },
    output: { schema: CommodityAnalysisOutputSchema },
    prompt: `You are an agricultural market analyst. You are given a list of prices for a commodity from different markets. 
    Your task is to analyze these prices and provide a simple, actionable insight for a farmer.

    Commodity: {{commodity}}
    Market Prices:
    {{#each prices}}
    - {{market}}: Rs {{price}}
    {{/each}}

    First, identify the market with the highest price and the market with the lowest price. Set these in the 'highestPriceMarket' and 'lowestPriceMarket' fields respectively.

    Then, generate a friendly, one or two-sentence summary for a farmer. The summary should clearly state which market is currently offering the best price and which is offering the lowest.
    Example: "For Onions, the best returns are currently in Mumbai at Rs 2550 per quintal. You may want to avoid Solapur, where the price is lowest at Rs 2100."
    
    Keep the summary direct and easy to understand.`,
  });

  const { output } = await prompt(input);
  return output!;
}
