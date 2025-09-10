export interface IConversation {
  role: 'user' | 'assistant';
  content: string;
}

import { AIChatConversation } from '@prisma/client';

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface IChatCompletion {
  sessionId: string;
  conversation: ConversationMessage[];
}

export type IAIChatConversation = AIChatConversation;
