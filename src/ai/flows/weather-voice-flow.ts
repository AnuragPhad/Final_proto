'use server';

/**
 * @fileOverview This file defines a Genkit flow for fetching current weather,
 * generating a summary, and converting it to speech.
 * - getWeatherVoiceSummary - Fetches weather, creates a summary, and returns it as text and audio.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

// Define input schema for the flow
export const WeatherVoiceInputSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  language: z.string().optional().describe("The language for the response, e.g., 'en', 'hi', 'mr'."),
});
export type WeatherVoiceInput = z.infer<typeof WeatherVoiceInputSchema>;

// Define output schema for the flow
export const WeatherVoiceOutputSchema = z.object({
  summary: z.string().describe("A concise, friendly summary of the weather conditions."),
  audioDataUri: z.string().describe("The base64 encoded data URI for the generated audio."),
});
export type WeatherVoiceOutput = z.infer<typeof WeatherVoiceOutputSchema>;


// Helper function to convert PCM buffer to WAV base64
async function toWav(pcmData: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels: 1,
      sampleRate: 24000,
      bitDepth: 16,
    });

    const buffers: Buffer[] = [];
    writer.on('data', (chunk) => buffers.push(chunk));
    writer.on('end', () => resolve(Buffer.concat(buffers).toString('base64')));
    writer.on('error', reject);

    writer.end(pcmData);
  });
}

// Define the main flow
export const getWeatherVoiceSummaryFlow = ai.defineFlow(
  {
    name: 'getWeatherVoiceSummaryFlow',
    inputSchema: WeatherVoiceInputSchema,
    outputSchema: WeatherVoiceOutputSchema,
  },
  async (input) => {
    const weatherApiKey = process.env.GOOGLE_WEATHER_API_KEY;
    if (!weatherApiKey) {
      throw new Error('Google Weather API key is not configured in .env file.');
    }

    // 1. Fetch weather data from Google Weather API
    const weatherUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${weatherApiKey}&location.latitude=${input.latitude}&location.longitude=${input.longitude}`;
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) {
      throw new Error(`Failed to fetch weather data: ${weatherResponse.statusText}`);
    }
    const weatherData = await weatherResponse.json();

    // 2. Generate a text summary using an LLM
    const summaryPrompt = ai.definePrompt({
        name: 'weatherSummaryPrompt',
        prompt: `You are a helpful weather assistant. Based on the following JSON data, provide a short, conversational summary of the current weather conditions. Mention the temperature, condition, wind speed, and humidity. Keep it to one or two sentences.
        
        VERY IMPORTANT: Generate the entire response in the following language: ${input.language || 'en'}.

        Weather Data:
        ${JSON.stringify(weatherData)}
        `,
    });
    
    const summaryResponse = await summaryPrompt();
    const summaryText = summaryResponse.text;
    
    // 3. Convert the text summary to speech
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: summaryText,
    });

    if (!media?.url) {
      throw new Error('Text-to-speech conversion failed to produce audio.');
    }
    
    const audioBuffer = Buffer.from(media.url.substring(media.url.indexOf(',') + 1), 'base64');
    const wavBase64 = await toWav(audioBuffer);

    return {
      summary: summaryText,
      audioDataUri: `data:audio/wav;base64,${wavBase64}`,
    };
  }
);


// Exported wrapper function for client-side use
export async function getWeatherVoiceSummary(input: WeatherVoiceInput): Promise<WeatherVoiceOutput> {
  return getWeatherVoiceSummaryFlow(input);
}
