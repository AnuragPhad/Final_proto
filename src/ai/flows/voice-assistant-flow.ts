
'use server';

/**
 * @fileOverview This file defines the main Genkit flow for the Voice Assistant.
 * It acts as an orchestrator, using tools to answer user queries about weather,
 * government schemes, and community hub posts.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getWeather, getMandiRatesForCommodity } from '@/ai/tools/assistant-tools';
import { run } from 'genkit';

const VoiceAssistantInputSchema = z.object({
  query: z.string().describe("The user's transcribed query."),
  location: z.string().optional().describe("The user's current location as 'City, State'. Use this as context for the query."),
  language: z.string().describe("The language for the response, e.g., 'en', 'hi', 'mr'."),
});

export type VoiceAssistantInput = z.infer<typeof VoiceAssistantInputSchema>;
export type VoiceAssistantOutput = string;

export async function voiceAssistant(input: VoiceAssistantInput): Promise<VoiceAssistantOutput> {
  const prompt = ai.definePrompt({
    name: 'voiceAssistantPrompt',
    input: { schema: VoiceAssistantInputSchema },
    output: { format: 'text' },
    tools: [getWeather, getMandiRatesForCommodity],
    system: `You are Kisan AI, a friendly and expert farming assistant for farmers in India.
- Your primary goal is to answer the user's questions clearly, concisely, and accurately.
- ALWAYS respond in the user's specified language: {{language}}.
- Use the tools provided to answer questions about weather, crop prices (mandi rates), and other farming topics.
- When a tool requires a location and the user hasn't specified one in their query, use their known location: ({{location}}). If you don't have a known location, you MUST ask the user for it.
- If the user's query is general conversation or falls outside the scope of the tools, respond naturally and conversationally.
- Keep your answers to the point. For example, when asked for weather, just give the weather.`,
  });

  const llmResponse = await run('invoke-assistant', async () => {
    return await prompt(input);
  });
  
  if (llmResponse.toolRequest) {
    const toolResponse = await llmResponse.toolRequest.next();
    const finalResponse = await toolResponse.next(toolResponse.output);
    return finalResponse.text;
  }
  
  return llmResponse.text;
}
