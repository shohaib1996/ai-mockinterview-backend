import { OpenAI } from 'openai';
import config from '@/app/config';
import { IChatCompletion } from './ai-chat.interface';
import { ApiError } from '@/app/errors/apiError';
import httpStatus from 'http-status';
import { ChatCompletionMessageParam } from 'openai/resources/index';
import prisma from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

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
        data: { conversation: updatedConversation as Prisma.InputJsonValue },
      });
    } else {
      // Create new record
      await prisma.aIChatConversation.create({
        data: { sessionId, conversation: updatedConversation as Prisma.InputJsonValue},
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

const analyzeConversation = async (sessionId: string) => {
  try {
    const rawConversation = await getConversationBySessionId(sessionId);

    if (!rawConversation || rawConversation.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found for this session');
    }

    // Type guard to ensure conversation elements are of the expected type
    const isMessageObject = (item: any): item is { role: string; content: string } => {
      return (
        typeof item === 'object' &&
        item !== null &&
        'role' in item &&
        'content' in item &&
        typeof item.role === 'string' &&
        typeof item.content === 'string'
      );
    };

    const conversation: { role: string; content: string }[] =
      rawConversation.filter(isMessageObject);

    if (conversation.length === 0) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'No valid conversation messages found for analysis',
      );
    }

    const analysisPrompt = `
      You are an expert IELTS examiner. Analyze the following conversation from an IELTS Speaking Test.
      Provide a score out of 9 bands for the student's performance, focusing on Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation.
      Also, provide detailed feedback for improvement and highlight areas of appreciation.

      Conversation:
      ${conversation.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}

      Provide the output in the following JSON format:
      {
        "score": <number_out_of_9>,
        "feedback": "<detailed_feedback_text>"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: analysisPrompt }],
      response_format: { type: 'json_object' },
    });

    const aiResponseContent = completion.choices[0]?.message.content;

    if (!aiResponseContent) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'AI did not return analysis content');
    }

    const analysisResult = JSON.parse(aiResponseContent);

    // Update the Session model with the score and feedback
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        score: analysisResult.score,
        feedback: analysisResult.feedback,
      },
    });

    return analysisResult;
  } catch (error) {
    console.error('Error analyzing conversation:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to analyze conversation');
  }
};

export const AiChatServices = {
  createChatCompletion,
  getConversationBySessionId,
  analyzeConversation,
};
