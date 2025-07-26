
'use server';

/**
 * @fileOverview This file defines a Genkit flow for a conversational chatbot.
 *
 * - `conversationalChat`: A function that takes a user's query and language, and returns a text response by calling a custom Vertex AI endpoint.
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
  const url = 'https://genai-app-agriculturalassistantchat-1-17535471072-32985753477.us-central1.run.app/api/predict';

  const requestBody = {
    data: [
      { text: input.query, files: [] }, // Corresponds to `message`
      input.language,                   // Corresponds to `param_2`
      input.query,                      // Corresponds to `param_3` -> Re-using query here as per user's finding.
    ]
  };
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    
    // Gradio APIs typically return data in a "data" array.
    if (result && Array.isArray(result.data) && result.data.length > 0) {
      // The actual response text is the first element in the data array
      return result.data[0];
    } else {
      // Fallback for unexpected response format.
      return "Sorry, I received an unexpected response from the assistant.";
    }

  } catch (error: any) {
    console.error('Error calling the custom Vertex AI API:', error);
    throw new Error('Failed to get a response from the assistant API.');
  }
}
