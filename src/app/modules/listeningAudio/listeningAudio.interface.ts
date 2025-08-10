import { ListeningAudio, Question } from '@prisma/client';

export type IListeningAudio = ListeningAudio;

export type ICreateListeningAudioPayload = {
  title: string;
  audioUrl: string;
  transcript: string;
};

export type IUpdateListeningAudioPayload = Partial<ICreateListeningAudioPayload>;