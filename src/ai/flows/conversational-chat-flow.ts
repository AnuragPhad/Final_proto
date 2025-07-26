
'use server';

/**
 * @fileOverview This file defines a Genkit flow for a conversational chatbot.
 *
 * - `conversationalChat`: A function that takes a user's query and language, and returns a text response.
 * - `ChatInput`: The input type for the `conversationalChat` function.
 * - `ChatOutput`: The output type for the `conversationalChat` function.
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
  const url = 'https://genai-app-agriculturalassistantchat-1-17535471072-32985753477.us-central1.run.app/?key=0epa65s5kopbicmp';
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: input.query,
        language: input.language,
        location: input.location,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    // Assuming the API returns an object like { response: "..." }
    if (result && result.response) {
      return result.response;
    } else {
      // Fallback if the response format is unexpected
      return JSON.stringify(result);
    }

  } catch (error: any) {
    console.error('Error calling the custom Vertex AI API:', error);
    throw new Error('Failed to get a response from the assistant API.');
  }
}
