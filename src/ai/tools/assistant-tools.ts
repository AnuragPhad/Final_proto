
'use server';
/**
 * @fileOverview This file defines Genkit tools for the Voice Assistant to use.
 * These tools provide real-world data and functionality to the AI model.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getMandiRates, type MandiRate } from '@/data/mandi-rates';
import { format, subDays } from 'date-fns';

// Tool to get the current weather
const WeatherInputSchema = z.object({
    location: z.string().describe("The city and state, e.g., 'Pune, Maharashtra' to get the weather for."),
});

const WeatherOutputSchema = z.object({
  temperature: z.number().describe('The current temperature in Celsius.'),
  condition: z.string().describe('A brief description of the weather condition, e.g., "Clear sky", "Light rain".'),
  humidity: z.number().describe('The current humidity percentage.'),
  windSpeed: z.number().describe('The current wind speed in meters per second.'),
});

export const getWeather = ai.defineTool(
  {
    name: 'getWeather',
    description: 'Get the current weather conditions for a specified city.',
    inputSchema: WeatherInputSchema,
    outputSchema: WeatherOutputSchema,
  },
  async ({ location }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured.');
    }
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data for ${location}. Status: ${response.status}`);
      }
      const data = await response.json();
      return {
        temperature: data.main.temp,
        condition: data.weather[0].description,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
      };
    } catch (error) {
        console.error("Weather API error:", error);
        throw new Error(`Could not retrieve weather for ${location}.`);
    }
  }
);


// Tool to get Mandi Rates
const MandiRateInputSchema = z.object({
    commodity: z.string().describe("The commodity to get the price for, e.g., 'Onion', 'Wheat'."),
    location: z.string().describe("The district and state to get prices for, e.g., 'Pune, Maharashtra'."),
});

const MandiRateOutputSchema = z.object({
    summary: z.string().describe("A concise summary of the price, e.g., 'The price of Onion in Pune is between Rs 1000 and Rs 1200.' or 'No data found for Onion in Pune today.'")
});


export const getMandiRatesForCommodity = ai.defineTool(
    {
        name: 'getMandiRatesForCommodity',
        description: "Get the latest mandi (market) price for a specific agricultural commodity in a given district.",
        inputSchema: MandiRateInputSchema,
        outputSchema: MandiRateOutputSchema,
    },
    async ({ commodity, location }) => {
        const [district, state] = location.split(',').map(s => s.trim());

        if (!state || !district) {
            return { summary: "I need both a district and a state to find mandi rates." };
        }

        const allRates = await getMandiRates(state, district);
        
        if (!allRates || allRates.length === 0) {
            return { summary: `I couldn't find any market data for ${district}, ${state}.` };
        }
        
        const today = new Date();
        const todaysRates = allRates.filter(rate => {
            const [day, month, year] = rate.arrival_date.split('/');
            const apiDate = new Date(Number(year), Number(month) - 1, Number(day));
            return format(apiDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') &&
                   rate.commodity.toLowerCase().includes(commodity.toLowerCase());
        });

        if (todaysRates.length === 0) {
            return { summary: `No rates found for ${commodity} in ${district} today.`};
        }

        // Find the average min, max, and modal prices
        const avgMinPrice = Math.round(todaysRates.reduce((acc, r) => acc + r.minPrice, 0) / todaysRates.length);
        const avgMaxPrice = Math.round(todaysRates.reduce((acc, r) => acc + r.maxPrice, 0) / todaysRates.length);
        const avgModalPrice = Math.round(todaysRates.reduce((acc, r) => acc + r.modalPrice, 0) / todaysRates.length);

        return {
            summary: `Today in ${district}, the price for ${commodity} is typically between Rs ${avgMinPrice} and Rs ${avgMaxPrice} per quintal, with an average price around Rs ${avgModalPrice}.`
        };
    }
)
