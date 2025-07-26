
'use server';

/**
 * @fileOverview This file defines a Genkit flow for converting text to speech.
 *
 * - `textToSpeech`: A function that takes text and returns a data URI for the audio.
 * - `TTSInput`: The input type for the `textToSpeech` function.
 * - `TTSOutput`: The output type for the `textToSpeech` function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import wav from 'wav';

const TTSInputSchema = z.object({
  text: z.string().describe('The text to be converted to speech.'),
});
export type TTSInput = z.infer<typeof TTSInputSchema>;

const TTSOutputSchema = z.object({
    audioDataUri: z.string().describe("A data URI representing the generated WAV audio file. Format: 'data:audio/wav;base64,...'"),
});
export type TTSOutput = z.infer<typeof TTSOutputSchema>;


async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs: any[] = [];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
}

export const textToSpeech = ai.defineFlow(
    {
      name: 'textToSpeech',
      inputSchema: TTSInputSchema,
      outputSchema: TTSOutputSchema,
    },
    async ({ text }) => {
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
        prompt: text,
      });

      if (!media) {
        throw new Error('No audio media was returned from the TTS model.');
      }
      
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );
      
      const wavBase64 = await toWav(audioBuffer);
      
      return {
        audioDataUri: `data:audio/wav;base64,${wavBase64}`,
      };
    }
);
