import { ListeningAudio } from '@prisma/client';

export type IListeningAudio = ListeningAudio;

export interface ICreateListeningAudioPayload {
  title: string;
  audioUrl: string;
  transcript: string;
}

export type IUpdateListeningAudioPayload = Partial<ICreateListeningAudioPayload>;
