import { OpenAI } from 'openai';
import config from '@/app/config';

// Mistral's API is wire-compatible with the OpenAI Chat Completions format,
// so the same SDK works here - just a different base URL, key, and model.
export const mistral = new OpenAI({
  apiKey: config.MISTRAL_API_KEY,
  baseURL: 'https://api.mistral.ai/v1',
});
