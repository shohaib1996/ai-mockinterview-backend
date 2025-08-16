export type IConversation = {
  role: "user" | "assistant";
  content: string;
};

import { AIChatConversation } from '@prisma/client';

export type ConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type IChatCompletion = {
  sessionId: string;
  conversation: ConversationMessage[];
};

export type IAIChatConversation = AIChatConversation;
