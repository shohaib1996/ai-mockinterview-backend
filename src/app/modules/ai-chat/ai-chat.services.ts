import { OpenAI } from 'openai';
import config from '@/app/config';
import { IChatCompletion } from './ai-chat.interface';
import { ApiError } from '@/app/errors/apiError';
import httpStatus from 'http-status';
import { ChatCompletionMessageParam } from 'openai/resources/index';
import prisma from '@/app/lib/prisma';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

const createChatCompletion = async (payload: IChatCompletion) => {
  const { sessionId, conversation } = payload;

  try {
    // System message
    const systemMessage: ChatCompletionMessageParam = {
      role: 'system',
      content: `
You are an IELTS Speaking Test examiner.
Ask one question at a time.
Do not answer for the student but make the conversation interactive.
After each student response, continue with the next question in sequence.
      `,
    };

    const messages: ChatCompletionMessageParam[] = [
      systemMessage,
      ...conversation.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
    });

    const aiResponse = completion.choices[0]?.message.content ?? '';

    // Fetch latest conversation for this session
    const existingSession = await prisma.aIChatConversation.findFirst({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });

    const existingConv = Array.isArray(existingSession?.conversation)
      ? existingSession.conversation
      : [];

    const updatedConversation = [
      ...existingConv,
      ...conversation,
      { role: 'assistant', content: aiResponse },
    ];

    if (existingSession) {
      // Update existing record using its id
      await prisma.aIChatConversation.update({
        where: { id: existingSession.id },
        data: { conversation: updatedConversation },
      });
    } else {
      // Create new record
      await prisma.aIChatConversation.create({
        data: { sessionId, conversation: updatedConversation },
      });
    }

    return aiResponse;
  } catch (error) {
    console.error('Error communicating with OpenAI or saving to database:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to get response from AI');
  }
};

// Fetch the full conversation for a session
const getConversationBySessionId = async (sessionId: string) => {
  const result = await prisma.aIChatConversation.findFirst({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
  });

  return Array.isArray(result?.conversation) ? result.conversation : [];
};

export const AiChatServices = {
  createChatCompletion,
  getConversationBySessionId,
};
