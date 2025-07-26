/**
 * @fileOverview This file defines a Genkit tool for fetching mandi rates for a specific commodity.
 * - `getMandiRatesForCommodity`: A tool that takes a commodity name and an optional location, and returns the latest price.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getMandiRates as getMandiRatesFromApi, type MandiRate } from '@/data/mandi-rates';
import { states, districts } from '@/data/locations';
import { format } from 'date-fns';

const MandiRateToolInputSchema = z.object({
  commodity: z.string().describe('The name of the commodity to get the price for, e.g., "Onion", "Potato"'),
  location: z.string().optional().describe('The location (District, State) to get the rates for. e.g., "Pune, Maharashtra"'),
});

const MandiRateToolOutputSchema = z.object({
    price: z.number().describe('The most recent modal price for the commodity in the given location.'),
    market: z.string().describe('The specific market where the price was recorded.'),
    date: z.string().describe('The date the price was recorded.'),
});

export const getMandiRatesForCommodity = ai.defineTool(
  {
    name: 'getMandiRatesForCommodity',
    description: 'Gets the most recent mandi price for a given agricultural commodity in a specific location.',
    inputSchema: MandiRateToolInputSchema,
    outputSchema: MandiRateToolOutputSchema,
  },
  async ({ commodity, location }) => {
    if (!location) {
        throw new Error('Location must be provided to get mandi rates.');
    }
    
    const [district, state] = location.split(',').map(s => s.trim());
    
    if (!state || !district || !states.includes(state) || !districts[state]?.includes(district)) {
        throw new Error(`Invalid or unsupported location: ${location}. Please provide a valid "District, State".`);
    }

    const allRates = await getMandiRatesFromApi(state, district);
    
    const today = new Date();
    const commodityRates = allRates
      .filter(rate => rate.commodity.toLowerCase().includes(commodity.toLowerCase()))
      .sort((a, b) => {
         const dateA = new Date(a.arrival_date.split('/').reverse().join('-'));
         const dateB = new Date(b.arrival_date.split('/').reverse().join('-'));
         return dateB.getTime() - dateA.getTime();
      });

    const latestRate = commodityRates[0];

    if (!latestRate) {
      throw new Error(`No rates found for ${commodity} in ${location} for today.`);
    }

    return {
      price: latestRate.modalPrice,
      market: latestRate.market,
      date: latestRate.arrival_date,
    };
  }
);
