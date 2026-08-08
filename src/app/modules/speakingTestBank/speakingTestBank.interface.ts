import { Difficulty } from '@prisma/client';

export interface ICreateSpeakingTestPayload {
  part1Topic: string;
  part1Questions: string[];
  cueCardTopic: string;
  cueCardBullets: string[];
  part2FollowUpQuestions: string[];
  part3Questions: string[];
  difficulty?: Difficulty;
}
