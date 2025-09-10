import { ApiError } from '@/app/errors/apiError';
import prisma from '@/app/lib/prisma';
import httpStatus from 'http-status';
import Papa from 'papaparse';
import { OpenAI } from 'openai';
import config from '@/app/config';
import { ChatCompletionMessageParam } from 'openai/resources/index';
import { IConversationMessage } from './mock-interview.interface';
import { SessionType } from '@prisma/client';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

const uploadQuestions = async (sessionId: string, file: Express.Multer.File) => {
  if (!file) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No file uploaded');
  }

  const csvData = file.buffer.toString('utf-8');

  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  // Assuming the csv has a header 'question'
  const questions = parsed.data as { question: string }[];

  const questionData = questions.map((q) => ({
    text: q.question,
    sessionId: sessionId,
  }));

  await prisma.customQuestion.createMany({
    data: questionData,
  });

  return { message: 'Questions uploaded successfully' };
};

const getSystemPrompt = async (
  sessionType: SessionType,
  sessionId: string,
): Promise<ChatCompletionMessageParam> => {
  let content = '';

  const nextQuestion = await prisma.customQuestion.findFirst({
    where: {
      sessionId,
      asked: false,
    },
    orderBy: {
      id: 'asc',
    },
  });

  if (nextQuestion) {
    content = `Your next question to ask is: "${nextQuestion.text}"`;
    await prisma.customQuestion.update({
      where: {
        id: nextQuestion.id,
      },
      data: {
        asked: true,
      },
    });
  } else {
    const customQuestions = await prisma.customQuestion.findMany({ where: { sessionId } });
    if (customQuestions.length > 0) {
      content =
        'You have asked all the custom questions. The interview is now complete. Please do not ask any further questions.';
    } else {
      // If no custom questions were ever uploaded, use the default system prompt
      switch (sessionType) {
        case SessionType.MOCK_INTERVIEW_BEHAVIORAL:
          content =
            'You are a behavioral interviewer. Ask questions that probe into past behaviors and experiences to predict future performance. Use the STAR method (Situation, Task, Action, Result) as a framework for your questions. Please ask question one by one. Not too many question at a time';
          break;
        case SessionType.MOCK_INTERVIEW_TECHNICAL:
          content =
            "You are a technical interviewer. Your role is to assess the candidate's technical knowledge and problem-solving skills. Ask relevant technical questions. The technical questions would be from (HTML, CSS, JavaScript, React, Next.js, Node.js, Express, PostgreSQL, MongoDB, Mongoose, Prisma). All the question would be Web development related. Please ask question one by one. Not too many question at a time";
          break;
        case SessionType.MOCK_INTERVIEW_INTERPERSONAL:
          content =
            "You are an interviewer assessing interpersonal skills. Ask questions that reveal a candidate's ability to communicate, collaborate, and build relationships with others. Please ask question one by one. Not too many question at a time";
          break;
        default:
          content = 'You are a general interviewer.';
          break;
      }
    }
  }

  return {
    role: 'system',
    content,
  };
};

const chat = async (sessionId: string, conversation: IConversationMessage[]) => {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }

  const systemMessage = await getSystemPrompt(session.type, sessionId);

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

  const updatedConversation = [...conversation, { role: 'assistant', content: aiResponse }];

  const existingSession = await prisma.aIChatConversation.findFirst({
    where: { sessionId },
  });

  if (existingSession) {
    await prisma.aIChatConversation.update({
      where: { id: existingSession.id },
      data: { conversation: updatedConversation },
    });
  } else {
    await prisma.aIChatConversation.create({
      data: { sessionId, conversation: updatedConversation },
    });
  }

  return aiResponse;
};

const getConversationHistory = async (sessionId: string) => {
  const result = await prisma.aIChatConversation.findFirst({
    where: { sessionId },
    orderBy: { createdAt: 'desc' },
  });

  return Array.isArray(result?.conversation) ? result.conversation : [];
};

const analyzeConversation = async (sessionId: string) => {
  try {
    const rawConversation = await getConversationHistory(sessionId);

    if (!rawConversation || rawConversation.length === 0) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Conversation not found for this session');
    }

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
      You are an expert interviewer. Analyze the following conversation from a mock interview.
      Provide a score out of 10 for the candidate's performance, focusing on clarity, relevance, and communication skills.
      Also, provide detailed feedback for improvement and highlight areas of appreciation.

      Conversation:
      ${conversation.map((msg) => `${msg.role}: ${msg.content}`).join('\n')}

      Provide the output in the following JSON format:
      {
        "score": <number_out_of_10>,
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

export const MockInterviewServices = {
  uploadQuestions,
  chat,
  getConversationHistory,
  analyzeConversation,
};
