
import { SessionType } from '@prisma/client';

export type IConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type IChatPayload = {
  sessionId: string;
  sessionType: SessionType;
  conversation: IConversationMessage[];
};
