import { SessionType } from '@prisma/client';

export interface IConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IChatPayload {
  sessionId: string;
  sessionType: SessionType;
  conversation: IConversationMessage[];
}
