import cron from 'node-cron';
import { ReadingTestServices } from '@/app/modules/readingTest/readingTest.services';
import { Difficulty } from '@prisma/client';

const DIFFICULTIES: Difficulty[] = ['LOW', 'MEDIUM', 'HIGH'];

const topUpAllPools = async () => {
  for (const difficulty of DIFFICULTIES) {
    await ReadingTestServices.ensurePool(difficulty);
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
