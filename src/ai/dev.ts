import { config } from 'dotenv';
config();

import '@/ai/flows/crop-doctor-initial-analysis.ts';
import '@/ai/flows/mandi-rate-nlu.ts';
import '@/ai/flows/mandi-rate-summary.ts';
