import { config } from 'dotenv';
config();

import '@/ai/flows/crop-doctor-initial-analysis.ts';
import '@/ai/flows/mandi-rate-nlu.ts';
import '@/ai/flows/mandi-rate-summary.ts';
import '@/ai/flows/price-trend-flow.ts';
import '@/ai/flows/commodity-analysis-flow.ts';
import '@/ai/flows/conversational-chat-flow.ts';
import '@/ai/flows/voice-assistant-flow.ts';
import '@/ai/tools/assistant-tools.ts';
