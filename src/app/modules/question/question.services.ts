import { Prisma, Question } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import {
  ICreateQuestionPayload,
  IUpdateQuestionPayload,
  IQuestionFilters,
} from './question.interface';
import OpenAI from 'openai';
import config from '@/app/config';

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

const createQuestion = async (
  payload: ICreateQuestionPayload | ICreateQuestionPayload[],
): Promise<Question | { count: number }> => {
  try {
    if (Array.isArray(payload)) {
      const result = await prisma.question.createMany({
        data: payload,
      });
      return result;
    }
    const result = await prisma.question.create({
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create question(s)');
  }
};

const getAllQuestions = async (
  filters: IQuestionFilters,
): Promise<{ meta: { page: number; limit: number; total: number }; data: Question[] }> => {
  const {
    sessionType,
    listeningAudioId,
    readingPassageId,
    quizAttemptId,
    page = 1,
    limit = 10,
  } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.QuestionWhereInput = {};

  if (sessionType) {
    where.sessionType = sessionType;
  }

  if (listeningAudioId) {
    where.listeningAudioId = listeningAudioId;
  }

  if (readingPassageId) {
    where.readingPassageId = readingPassageId;
  }

  if (quizAttemptId) {
    where.quizAttemptId = quizAttemptId;
  }

  try {
    const result = await prisma.question.findMany({
      where,
      skip,
      take: limit,
    });

    const total = await prisma.question.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve questions');
  }
};

const getSingleQuestion = async (id: string): Promise<Question | null> => {
  try {
    const result = await prisma.question.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve question');
  }
};

const updateQuestion = async (id: string, payload: IUpdateQuestionPayload): Promise<Question> => {
  try {
    const result = await prisma.question.update({
      where: {
        id,
      },
      data: payload,
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to update not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Question not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update question');
  }
};

const deleteQuestion = async (id: string): Promise<Question> => {
  try {
    const result = await prisma.question.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Question not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete question');
  }
};

const generateQuestions = async (
  promptText: string,
  numberOfQuestions: number,
  sessionType: string,
  listeningAudioId?: string,
  readingPassageId?: string,
  quizAttemptId?: string,
): Promise<{ count: number }> => {
  console.log(promptText, numberOfQuestions, 'Generate Questions Service');
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful assistant that generates quiz questions. 
  Always respond ONLY with a valid JSON object in this format:
  { "questions": [
    {
      "type": "MCQ",
      "sessionType": "${sessionType}",
      "text": "string",
      "options"?: ["string"],
      "correctAnswer"?: "string",
      "difficulty"?: "LOW" | "MEDIUM" | "HIGH",
      "aiGenerated": true,
      "listeningAudioId"?: "${listeningAudioId ?? ''}",
      "readingPassageId"?: "${readingPassageId ?? ''}",
      "quizAttemptId"?: "${quizAttemptId ?? ''}"
    }
  ]}
  
  Rules:
  - Generate exactly ${numberOfQuestions} questions.
  - Each question must be inside the "questions" array.
  - Use sessionType = "${sessionType}" for all questions.
  - For the ID, attach ONLY the one provided: 
    ${listeningAudioId ? 'listeningAudioId' : readingPassageId ? 'readingPassageId' : 'quizAttemptId'}.
  - Generate mixed difficulty levels.
  - Some questions should be fill-in-the-blanks, for example: "The capital of France is ______." like this but provider 4 option to choose from.
  - Make some true, false question. Provide only two option in that case.
  - For MCQs include at least 4 options and one correct answer.
  - Ensure aiGenerated is true.
  - No text outside JSON.`,
        },

        {
          role: 'user',
          content: `Generate questions based on the following prompt: "${promptText}"`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const responseContent = completion?.choices[0]?.message.content;
    if (!responseContent) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'No content received from OpenAI API');
    }

    // Parse JSON object with questions array
    const parsedResponse = JSON.parse(responseContent);
    const generatedQuestions: ICreateQuestionPayload[] = parsedResponse.questions;

    if (!Array.isArray(generatedQuestions)) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'Invalid format received from OpenAI API',
      );
    }

    // Save to DB
    const result = await prisma.question.createMany({
      data: generatedQuestions.map((q) => ({ ...q, aiGenerated: true })),
    });

    return result;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to generate questions');
  }
};

export const QuestionServices = {
  createQuestion,
  getAllQuestions,
  getSingleQuestion,
  updateQuestion,
  deleteQuestion,
  generateQuestions,
};
