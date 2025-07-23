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
  language: z.string().optional().describe("The language for the response, e.g., 'en', 'hi', 'mr'."),
});
export type CropDoctorInitialAnalysisInput = z.infer<typeof CropDoctorInitialAnalysisInputSchema>;

const CropDoctorInitialAnalysisOutputSchema = z.object({
  summary: z.string().describe('A concise AI-generated summary of the potential issues, recommended actions, and potential consequences.'),
  healthStatus: z.string().describe("The overall health status (e.g., 'Healthy', 'Diseased')."),
  organicSolutions: z.array(z.string()).describe('A list of organic solutions.'),
  inorganicSolutions: z.array(z.string()).describe('A list of inorganic solutions.'),
  waterAdvisory: z.string().describe('A brief advisory on watering.'),
  weatherAdvisory: z.string().describe('A brief advisory related to weather.'),
});
export type CropDoctorInitialAnalysisOutput = z.infer<typeof CropDoctorInitialAnalysisOutputSchema>;

export async function cropDoctorInitialAnalysis(input: CropDoctorInitialAnalysisInput): Promise<CropDoctorInitialAnalysisOutput> {
  return cropDoctorInitialAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'cropDoctorInitialAnalysisPrompt',
  input: {schema: CropDoctorInitialAnalysisInputSchema},
  output: {schema: CropDoctorInitialAnalysisOutputSchema},
  prompt: `You are an expert plant pathologist and AI assistant for farmers. You are given a photo of a crop. 
  
  Your tasks are to:
  1.  Identify the crop and any visible diseases or pests.
  2.  Determine the overall health status (e.g., "Healthy", "Early signs of Powdery Mildew", "Severe aphid infestation").
  3.  Provide a concise, one-sentence summary of the potential issues, recommended actions, and potential consequences.
  4.  Suggest 2-3 simple organic solutions.
  5.  Suggest 2-3 simple inorganic (chemical) solutions.
  6.  Provide a short, actionable water advisory.
  7.  Provide a short, actionable weather advisory based on the potential disease.

  VERY IMPORTANT: Generate the entire response (all fields in the output schema) in the following language: {{language}}.

  Example for a diseased plant (in English):
  - healthStatus: "Early signs of Powdery Mildew"
  - summary: "The plant shows early signs of powdery mildew, which can be controlled with the suggested solutions to prevent crop loss."
  - organicSolutions: ["Neem oil spray.", "Milk and water solution."]
  - inorganicSolutions: ["Apply sulfur-based fungicide.", "Use potassium bicarbonate spray."]
  - waterAdvisory: "Ensure proper drainage to avoid root rot. Water early in the morning."
  - weatherAdvisory: "High humidity may increase fungal risk. Ensure good air circulation around plants."

  Example for a healthy plant (in English):
  - healthStatus: "Healthy"
  - summary: "The plant appears to be healthy and thriving. Continue with the current care routine."
  - organicSolutions: ["Maintain regular watering schedule.", "Use compost to enrich the soil."]
  - inorganicSolutions: ["No chemical action needed at this time.", "Monitor for pests preventatively."]
  - waterAdvisory: "Water consistently, allowing the top inch of soil to dry out between waterings."
  - weatherAdvisory: "The current weather is favorable. No special precautions needed."

  Now, analyze the following image.

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
