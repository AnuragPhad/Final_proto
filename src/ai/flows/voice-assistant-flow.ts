'use server';

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getWeather, getMandiRatesForCommodity } from '@/ai/tools/assistant-tools';
import { run } from 'genkit';

const VoiceAssistantInputSchema = z.object({
  query: z.string().describe("The user's transcribed query."),
  language: z.string().describe("The user's selected language (e.g., 'en', 'hi', 'mr')."),
  location: z.string().describe("The user's current location as 'City, State'. Use this as the default location for any queries unless the user specifies another."),
});

export async function voiceAssistant(input: z.infer<typeof VoiceAssistantInputSchema>): Promise<string> {
  
  const llmResponse = await run('ask-llm', async () => {
    return await ai.generate({
        prompt: `You are Kisan AI, a helpful farming assistant.
          Your goal is to answer the user's query.
          Use the provided tools to answer questions about real-time data like weather or mandi prices.
          If you use a tool, provide a concise and clear summary of the tool's output. Do not just output the raw data.
          The user's location is ${input.location}. Use this as the default for any tool that requires a location, unless the user specifies a different one in their query.
          IMPORTANT: The user is speaking in ${input.language}. Your final response MUST be in the same language.
          
          User Query: "${input.query}"`,
        model: 'googleai/gemini-2.0-flash',
        tools: [getWeather, getMandiRatesForCommodity],
    });
  });

  if (llmResponse.isToolRequest()) {
    const toolRequest = llmResponse.toolRequest();
    
    const toolResponse = await run('run-tool', async () => {
        if (toolRequest.name === 'getWeather') {
            return await getWeather(toolRequest.input);
        } else if (toolRequest.name === 'getMandiRatesForCommodity') {
            return await getMandiRatesForCommodity(toolRequest.input);
        } else {
            throw new Error(`Unsupported tool: ${toolRequest.name}`);
        }
    });

    const finalResponse = await run('summarize-tool-output', async () => {
        return await ai.generate({
            prompt: `Summarize the following tool output in a user-friendly way. The user's original query was: "${input.query}". The response must be in ${input.language}. Tool Output: ${JSON.stringify(toolResponse)}`,
            model: 'googleai/gemini-2.0-flash',
        });
    });
    
    return finalResponse.text;
  }

  return llmResponse.text;
}
