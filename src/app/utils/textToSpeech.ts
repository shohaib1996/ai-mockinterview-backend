import { OpenAI } from 'openai';
import config from '@/app/config';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export const synthesizeSpeech = async (text: string, voice: string): Promise<Buffer> => {
  const response = await openai.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
  });
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
};
