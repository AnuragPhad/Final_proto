'use server';

/**
 * @fileOverview This file defines a Genkit flow for a conversational chatbot.
 *
 * - `conversationalChat`: A function that takes a user's query and language, and returns a text response.
 * - `ChatInput`: The input type for the `conversationalChat` function.
 * - `ChatOutput`: The output type for the `conversationalChat` function.
 */

import { ai } from '@/ai/genkit';
import { getWeather } from '@/ai/tools/weather-tool';
import { z } from 'zod';

const ChatInputSchema = z.object({
  query: z.string().describe("The user's query."),
  language: z.string().describe("The language for the response, e.g., 'en', 'hi', 'mr', 'kn', 'ta'."),
  location: z.string().optional().describe("The user's current location as 'City, State'. Use this as context for the query."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.string().describe('The chatbot\'s response to the query.');
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function conversationalChat(input: ChatInput): Promise<ChatOutput> {
  const prompt = ai.definePrompt({
    name: 'conversationalChatPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    tools: [getWeather],
    prompt: `You are Kisan AI, a friendly and helpful agricultural assistant for Indian farmers. 
    Your goal is to answer the user's questions clearly and concisely.

    The user's current location is {{location}}. Use this information to provide location-specific answers when relevant. If the user asks for weather and has not provided a location, use this location.
    
    If you need to find out real-time information, like the weather, use the provided tools.
    
    IMPORTANT: You MUST generate the entire response in the following language: {{language}}.

    User's query: "{{query}}"
    
    Your response:`,
  });

  const { output } = await prompt(input);
  return output!;
}
