'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getMandiRates } from '@/data/mandi-rates';
import { format, subDays } from 'date-fns';

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
    inputSchema: z.object({
      city: z.string().describe('The city to get the weather for, e.g., "Pune", "Bengaluru"'),
    }),
    outputSchema: WeatherOutputSchema,
  },
  async ({ city }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured.');
    }

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch weather data for ${city}. Status: ${response.status}`);
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
        throw new Error(`Could not retrieve weather for ${city}.`);
    }
  }
);


const MandiRateOutputSchema = z.object({
    rates: z.array(z.object({
        market: z.string(),
        commodity: z.string(),
        modalPrice: z.number(),
    })).describe("A list of mandi rates for the specified commodity."),
    message: z.string().describe("A summary message for the user, e.g. 'Found 3 rates for Onion in Pune.' or 'No rates found.'")
});


export const getMandiRatesForCommodity = ai.defineTool(
    {
        name: 'getMandiRatesForCommodity',
        description: 'Gets the latest mandi rates for a given commodity in a specific district.',
        inputSchema: z.object({
            commodity: z.string().describe("The commodity to search for, e.g., 'Onion', 'Potato'"),
            district: z.string().describe("The district to search for rates in, e.g., 'Pune', 'Nashik'"),
            state: z.string().describe("The state where the district is located, e.g., 'Maharashtra'"),
        }),
        outputSchema: MandiRateOutputSchema,
    },
    async ({ commodity, district, state }) => {
        const today = new Date();
        const allRates = await getMandiRates(state, district);

        const filteredRates = allRates.filter(rate => {
            if (!rate.arrival_date) return false;
            const [day, month, year] = rate.arrival_date.split('/');
            if (!day || !month || !year) return false;
            try {
                const apiDate = new Date(Number(year), Number(month) - 1, Number(day));
                return format(apiDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && 
                       rate.commodity.toLowerCase().includes(commodity.toLowerCase());
            } catch {
                return false;
            }
        });

        if (filteredRates.length === 0) {
            return { rates: [], message: `No rates found for ${commodity} in ${district} today.` };
        }

        const ratesResult = filteredRates.map(r => ({
            market: r.market,
            commodity: r.commodity,
            modalPrice: r.modalPrice,
        }));
        
        return {
            rates: ratesResult,
            message: `Found ${ratesResult.length} market rate(s) for ${commodity} in ${district}. The average price is around Rs ${ratesResult[0].modalPrice} per quintal.`
        }
    }
);
