/**
 * @fileOverview This file defines a Genkit tool for fetching real-time weather data.
 * - `getWeather`: A tool that takes a city name and returns the current weather conditions.
 */
import { ai } from '@/ai/genkit';
import { z } from 'zod';

const WeatherInputSchema = z.object({
  city: z.string().describe('The city to get the weather for, e.g., "Pune", "Bengaluru"'),
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
  async ({ city }) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      throw new Error('OpenWeatherMap API key is not configured in .env file.');
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
