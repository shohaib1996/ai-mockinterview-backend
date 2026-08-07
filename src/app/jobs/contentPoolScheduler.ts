import cron from 'node-cron';
import { ReadingTestServices } from '@/app/modules/readingTest/readingTest.services';
import { ListeningTestServices } from '@/app/modules/listeningTest/listeningTest.services';
import { WritingTestServices } from '@/app/modules/writingTest/writingTest.services';
import { SpeakingTestServices } from '@/app/modules/speakingTest/speakingTest.services';
import { Difficulty } from '@prisma/client';

const DIFFICULTIES: Difficulty[] = ['LOW', 'MEDIUM', 'HIGH'];

const topUpAllPools = async () => {
  for (const difficulty of DIFFICULTIES) {
    await ReadingTestServices.ensurePool(difficulty);
    await ListeningTestServices.ensurePool(difficulty);
    await WritingTestServices.ensurePool(difficulty);
    await SpeakingTestServices.ensurePool(difficulty);
  }
};

export const startContentPoolScheduler = () => {
  // Every 6 hours, top up any content pool that's running low so users
  // never run out of unseen tests and admins don't have to generate manually.
  cron.schedule('0 */6 * * *', () => {
    topUpAllPools().catch((error) => {
      console.error('Content pool scheduler failed:', error);
    });
  });
};
