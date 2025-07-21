'use server';
/**
 * @fileOverview This file contains the Genkit flow for providing an initial AI-generated summary of potential issues, recommended actions, and potential consequences for a diseased crop based on a photo upload.
 *
 * - cropDoctorInitialAnalysis - A function that triggers the crop analysis flow.
 * - CropDoctorInitialAnalysisInput - The input type for the cropDoctorInitialAnalysis function.
 * - CropDoctorInitialAnalysisOutput - The return type for the cropDoctorInitialAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CropDoctorInitialAnalysisInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a diseased crop, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type CropDoctorInitialAnalysisInput = z.infer<typeof CropDoctorInitialAnalysisInputSchema>;

const CropDoctorInitialAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise AI-generated summary of the potential issues, recommended actions, and potential consequences.'),
});
export type CropDoctorInitialAnalysisOutput = z.infer<typeof CropDoctorInitialAnalysisOutputSchema>;

export async function cropDoctorInitialAnalysis(input: CropDoctorInitialAnalysisInput): Promise<CropDoctorInitialAnalysisOutput> {
  return cropDoctorInitialAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropDoctorInitialAnalysisPrompt',
  input: {schema: CropDoctorInitialAnalysisInputSchema},
  output: {schema: CropDoctorInitialAnalysisOutputSchema},
  prompt: `You are an AI assistant for farmers. You are given a photo of a diseased crop. Provide a concise, one-sentence summary of the potential issues, recommended actions, and potential consequences.

Photo: {{media url=photoDataUri}}`,
});

const cropDoctorInitialAnalysisFlow = ai.defineFlow(
  {
    name: 'cropDoctorInitialAnalysisFlow',
    inputSchema: CropDoctorInitialAnalysisInputSchema,
    outputSchema: CropDoctorInitialAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
