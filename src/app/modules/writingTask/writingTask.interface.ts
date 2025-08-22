import { WritingTask, IELTSWritingTaskType, Difficulty } from '@prisma/client';

export type IWritingTask = WritingTask;

export type ICreateWritingTaskPayload = {
  task: IELTSWritingTaskType;
  promptText: string;
  imageUrl?: string;
  difficulty?: Difficulty;
};

export type IUpdateWritingTaskPayload = Partial<ICreateWritingTaskPayload>;

export type IWritingTaskFilters = {
  task?: IELTSWritingTaskType;
  difficulty?: Difficulty;
  page?: number;
  limit?: number;
};