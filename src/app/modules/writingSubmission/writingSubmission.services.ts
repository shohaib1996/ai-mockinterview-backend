import { Prisma, WritingSubmission } from '@prisma/client';
import httpStatus from 'http-status';
import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import {
  ICreateWritingSubmissionPayload,
  IUpdateWritingSubmissionPayload,
} from './writingSubmission.interface';
import { WritingTaskServices } from '../writingTask/writingTask.services'; // Import WritingTaskServices
import OpenAI from 'openai'; // Import OpenAI

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const evaluateWritingSubmissionWithOpenAI = async (
  writingTaskId: string,
  extractedText: string,
): Promise<{ score: number; feedback: any }> => {
  const writingTask = await WritingTaskServices.getSingleWritingTask(writingTaskId);

  if (!writingTask) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Writing task not found for evaluation');
  }

  const prompt = `You are an expert IELTS examiner. Evaluate the following student's essay for IELTS Writing Task ${writingTask.task === 'TASK1' ? '1' : '2'}.
Provide an overall band score (0-9) and detailed feedback for each of the following criteria: Task Achievement/Response, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.
Your output should be a JSON object with 'score' (float, overall band score) and 'feedback' (string, explaining what is nice and what is not nice about the writing, in a concise paragraph). Ensure the score is a number between 0 and 9, and feedback is comprehensive.

Writing Task Prompt:
'''
${writingTask.promptText}
'''

Student's Extracted Text:
'''
${extractedText}
'''
`;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or 'gpt-4' for potentially better results
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const responseContent = chatCompletion?.choices[0]?.message.content;
    if (!responseContent) {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'OpenAI did not return any content.');
    }

    const evaluationResult = JSON.parse(responseContent);

    if (typeof evaluationResult.score !== 'number' || !evaluationResult.feedback) {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        'OpenAI response did not contain expected score or feedback format.',
      );
    }

    return {
      score: evaluationResult.score,
      feedback: evaluationResult.feedback,
    };
  } catch (error) {
    console.error('Error evaluating writing submission with OpenAI:', error);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      'Failed to evaluate writing submission with AI.',
    );
  }
};

const createWritingSubmission = async (
  payload: ICreateWritingSubmissionPayload,
): Promise<WritingSubmission> => {
  try {
    const result = await prisma.writingSubmission.create({
      data: payload,
    });

    // If extractedText is provided, evaluate it with AI
    if (result.extractedText && result.writingTaskId) {
      const { score, feedback } = await evaluateWritingSubmissionWithOpenAI(
        result.writingTaskId,
        result.extractedText,
      );

      // Update the newly created submission with the AI-generated score and feedback
      const updatedResult = await prisma.writingSubmission.update({
        where: { id: result.id },
        data: { score, feedback },
      });

      // Propagate score and feedback to the associated session
      if (updatedResult.sessionId) {
        await prisma.session.update({
          where: { id: updatedResult.sessionId },
          data: {
            score: updatedResult.score,
            feedback: updatedResult.feedback === null ? Prisma.JsonNull : updatedResult.feedback,
            endedAt: new Date().toISOString(),
          },
        });
      }
      return updatedResult;
    }

    return result;
  } catch (error) {
    console.error('Error in createWritingSubmission:', error);
    if (error instanceof ApiError) {
      throw error; // Re-throw custom API errors
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors if needed
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to create writing submission');
  }
};

const getAllWritingSubmissions = async (options: {
  page?: number;
  limit?: number;
  userId?: string;
  sessionId?: string;
}): Promise<{
  meta: { page: number; limit: number; total: number };
  data: WritingSubmission[];
}> => {
  const { page = 1, limit = 10, userId, sessionId } = options;
  const skip = (page - 1) * limit;

  try {
    const where: Prisma.WritingSubmissionWhereInput = {};
    if (userId) {
      where.userId = userId;
    }
    if (sessionId) {
      where.sessionId = sessionId;
    }

    const result = await prisma.writingSubmission.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        session: {
          select: {
            type: true, // This corresponds to sessionType
          },
        },
      },
      skip,
      take: limit,
    });

    const total = await prisma.writingSubmission.count({ where });

    return {
      meta: {
        page,
        limit,
        total,
      },
      data: result,
    };
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve writing submissions');
  }
};

const getSingleWritingSubmission = async (id: string): Promise<WritingSubmission | null> => {
  try {
    const result = await prisma.writingSubmission.findUnique({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve writing submission');
  }
};

const updateWritingSubmission = async (
  id: string,
  payload: IUpdateWritingSubmissionPayload,
): Promise<WritingSubmission> => {
  try {
    const result = await prisma.writingSubmission.update({
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
        throw new ApiError(httpStatus.NOT_FOUND, 'Writing submission not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to update writing submission');
  }
};

const deleteWritingSubmission = async (id: string): Promise<WritingSubmission> => {
  try {
    const result = await prisma.writingSubmission.delete({
      where: {
        id,
      },
    });
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        // Record to delete not found
        throw new ApiError(httpStatus.NOT_FOUND, 'Writing submission not found');
      }
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to delete writing submission');
  }
};

export const WritingSubmissionServices = {
  createWritingSubmission,
  getAllWritingSubmissions,
  getSingleWritingSubmission,
  updateWritingSubmission,
  deleteWritingSubmission,
};
