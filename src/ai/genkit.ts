import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({
    // Make sure to set your Google Cloud project ID in your environment variables.
    // project: process.env.GOOGLE_CLOUD_PROJECT_ID
  })],
  model: 'googleai/gemini-1.5-flash-latest',
});
