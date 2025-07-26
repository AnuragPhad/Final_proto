'use server';

/**
 * @fileOverview This file is deprecated. Its functionality has been moved to voice-assistant-flow.ts
 */

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
    console.warn("DEPRECATED: conversationalChat is deprecated. Use voiceAssistant instead.");
    return "This feature has been upgraded. Please refresh the page.";
}
