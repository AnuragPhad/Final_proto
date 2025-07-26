'use server';

/**
 * @fileOverview Defines a voice assistant Genkit flow that can use tools to answer user queries.
 *
 * - `voiceAssistant`: A function that takes a user's query, optional location, and language, and returns an AI-generated response.
 * - `VoiceAssistantInputSchema`: The Zod schema for the input.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getWeather } from '../tools/weather-tool';
import { getMandiRatesForCommodity } from '../tools/mandi-rates-tool';

export const VoiceAssistantInputSchema = z.object({
  query: z.string().describe("The user's query."),
  language: z.string().describe("The language for the response, e.g., 'en', 'hi', 'mr'."),
  location: z.string().optional().describe("The user's current location as 'City, State'. Use this as context for weather or mandi rates if a location is not specified in the query."),
});

export async function voiceAssistant(input: z.infer<typeof VoiceAssistantInputSchema>): Promise<string> {
  const { query, language, location } = input;

  const llmResponse = await ai.generate({
    prompt: `You are Kisan AI, a helpful farming assistant. Your goal is to answer the user's query.
      - If the user asks for weather, use the getWeather tool. If they do not specify a city, use their current location which is: ${location || 'not available'}.
      - If the user asks for mandi rates or prices for a commodity, use the getMandiRatesForCommodity tool. Use their current location if they do not specify one.
      - ALWAYS generate the final response in this language: ${language}.
      - User's query: "${query}"
      `,
    tools: [getWeather, getMandiRatesForCommodity],
    config: {
      temperature: 0.2, // Lower temperature for more factual, less creative responses
    },
  });

  return llmResponse.text;
}
