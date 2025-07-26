'use server';

/**
 * @fileOverview This file defines a Genkit flow for a conversational chatbot.
 *
 * - `conversationalChat`: A function that takes a user's query and language, and returns a text response.
 * - `ChatInput`: The input type for the `conversationalChat` function.
 * - `ChatOutput`: The output type for the `conversationalChat` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChatInputSchema = z.object({
  query: z.string().describe("The user's query."),
  language: z.string().describe("The language for the response, e.g., 'en', 'hi', 'mr', 'kn', 'ta'."),
  location: z.string().optional().describe("The user's current location as 'City, State'. Use this as context for the query."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The chatbot\'s response to the query.'),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function conversationalChat(input: ChatInput): Promise<ChatOutput> {
  const prompt = ai.definePrompt({
    name: 'conversationalChatPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    prompt: `You are Kisan AI, a friendly and helpful agricultural assistant for Indian farmers. 
    Your goal is to answer the user's questions clearly and concisely.

    The user's current location is {{location}}. Use this information to provide location-specific answers when relevant (e.g., for questions about weather, local markets, etc.). If no location is provided, you can ask for it if needed.
    
    IMPORTANT: You MUST generate the entire response in the following language: {{language}}.

    User's query: "{{query}}"
    
    Your response:`,
  });

  const { output } = await prompt(input);
  return output!;
}
