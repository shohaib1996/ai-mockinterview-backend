import prisma from '@/app/lib/prisma';
import { ApiError } from '@/app/errors/apiError';
import httpStatus from 'http-status';
import { mistral } from '@/app/lib/mistral';
import { OpenAI, toFile } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index';
import { Difficulty, SessionType } from '@prisma/client';
import config from '@/app/config';
import { SpeakingTestGenerator } from './speakingTest.generator';
import { SpeakingGraderService } from './speakingGrader.service';
import { IChatPayload, IStoredMessage, ISubmitPart2Payload } from './speakingTest.interface';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

const assignSpeakingTest = async (userId: string) => {
  const completedTestIds = (
    await prisma.session.findMany({
      where: {
        userId,
        type: SessionType.IELTS_SPEAKING,
        speakingTestId: { not: null },
        endedAt: { not: null },
      },
      select: { speakingTestId: true },
    })
  ).map((s) => s.speakingTestId as string);

  let speakingTest = await prisma.speakingTest.findFirst({
    where: { id: { notIn: completedTestIds } },
  });

  if (!speakingTest) {
    speakingTest = await SpeakingTestGenerator.generateSpeakingTest('MEDIUM');
  }

  const session = await prisma.session.create({
    data: { userId, type: SessionType.IELTS_SPEAKING, speakingTestId: speakingTest.id },
  });

  return { session, speakingTest };
};

const getSpeakingTestBySession = async (sessionId: string, userId: string) => {
  const session = await prisma.session.findUnique({ where: { id: sessionId } });

  if (!session) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Session not found');
  }
  if (session.userId !== userId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'This session does not belong to you');
  }
  if (!session.speakingTestId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Session has no speaking test assigned');
  }

  const speakingTest = await prisma.speakingTest.findUniqueOrThrow({
    where: { id: session.speakingTestId },
  });

  return { session, speakingTest };
};

const getStoredConversation = async (sessionId: string): Promise<IStoredMessage[]> => {
  const existing = await prisma.aIChatConversation.findFirst({ where: { sessionId } });
  return Array.isArray(existing?.conversation) ? (existing.conversation as unknown as IStoredMessage[]) : [];
};

const appendToConversation = async (sessionId: string, messages: IStoredMessage[]) => {
  const existing = await prisma.aIChatConversation.findFirst({ where: { sessionId } });
  const updated = [...(await getStoredConversation(sessionId)), ...messages];

  if (existing) {
    await prisma.aIChatConversation.update({
      where: { id: existing.id },
      data: { conversation: updated as any },
    });
  } else {
    await prisma.aIChatConversation.create({
      data: { sessionId, conversation: updated as any },
    });
  }

  return updated;
};

const chat = async (sessionId: string, userId: string, payload: IChatPayload) => {
  const { session, speakingTest } = await getSpeakingTestBySession(sessionId, userId);
  if (session.endedAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This speaking test has already ended');
  }

  const questions =
    payload.part === 1
      ? speakingTest.part1Questions
      : payload.part === 2
        ? speakingTest.part2FollowUpQuestions
        : speakingTest.part3Questions;
  const userMessageCount = payload.conversation.filter((m) => m.role === 'user').length;
  const nextQuestion = questions[userMessageCount];
  const isPartComplete = userMessageCount >= questions.length;
  const isFirstQuestion = userMessageCount === 0;

  const plainTextInstruction = `This reply is spoken aloud by text-to-speech and shown as plain
conversational text, not a chat/markdown UI. Respond with plain spoken English only - no markdown,
no **bold**, no headers, no bullet points, no asterisks or other formatting symbols of any kind.`;

  const systemPrompt = isPartComplete
    ? `You are an IELTS Speaking examiner. The candidate has answered all questions for this part.
Give a brief one-sentence closing remark for this part only (e.g. "Thank you, that's the end of this part.").
Do not ask any further questions.
${plainTextInstruction}`
    : payload.part === 2
      ? `You are an IELTS Speaking examiner. The candidate has just finished their Part 2 long turn.
${isFirstQuestion ? '' : "Give a brief, natural one-sentence acknowledgment of the candidate's last answer, then "}Ask exactly this brief rounding-off question verbatim, still on the same cue card topic (do not modify it): "${nextQuestion}"
${plainTextInstruction}`
      : isFirstQuestion
        ? `You are an IELTS Speaking examiner starting Part ${payload.part} of the test.
Briefly introduce this part in exactly one short sentence, then ask exactly this question verbatim
(do not modify it): "${nextQuestion}"
${plainTextInstruction}`
        : `You are an IELTS Speaking examiner conducting Part ${payload.part} of the test.
Give a brief, natural one-sentence acknowledgment of the candidate's last answer, then ask exactly this
next question verbatim (do not modify it): "${nextQuestion}"
${plainTextInstruction}`;

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...payload.conversation.map((m) => ({ role: m.role, content: m.content }) as ChatCompletionMessageParam),
  ];

  const completion = await mistral.chat.completions.create({
    // This call only rephrases/relays a pre-written question with a brief
    // acknowledgment - not generating exam content - so Mistral is plenty,
    // and it's called on every conversational turn.
    model: 'mistral-large-latest',
    messages,
  });

  const reply = completion.choices[0]?.message.content ?? '';
  const lastUserMessage = payload.conversation[payload.conversation.length - 1];

  const toStore: IStoredMessage[] = [];
  if (lastUserMessage && lastUserMessage.role === 'user') {
    toStore.push({ ...lastUserMessage, part: payload.part });
  }
  toStore.push({ role: 'assistant', content: reply, part: payload.part });

  await appendToConversation(sessionId, toStore);

  return { reply, isPartComplete };
};

// Cloud transcription for the mobile app's recorded speaking turns (mobile has no
// browser SpeechRecognition API to fall back on). Deliberately cheap/fast model -
// this is called on every conversational turn, same cost-conscious pattern already
// used for generation/grading elsewhere in this module.
const transcribeAudio = async (buffer: Buffer, mimetype: string) => {
  const extension = mimetype.split('/')[1]?.split(';')[0] || 'm4a';
  const file = await toFile(buffer, `speaking-answer.${extension}`, { type: mimetype });

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'gpt-4o-mini-transcribe',
  });

  return { text: transcription.text };
};

const submitPart2 = async (sessionId: string, userId: string, payload: ISubmitPart2Payload) => {
  const { session } = await getSpeakingTestBySession(sessionId, userId);
  if (session.endedAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This speaking test has already ended');
  }

  await appendToConversation(sessionId, [
    { role: 'user', content: payload.transcript, part: 2 },
  ]);

  return { success: true };
};

const analyzeSpeakingTest = async (sessionId: string, userId: string) => {
  const { session } = await getSpeakingTestBySession(sessionId, userId);
  if (session.endedAt) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'This speaking test has already ended');
  }

  const conversation = await getStoredConversation(sessionId);
  if (conversation.length === 0) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No conversation recorded for this session yet');
  }

  const result = await SpeakingGraderService.gradeSpeakingTest(conversation);

  const updatedSession = await prisma.session.update({
    where: { id: sessionId },
    data: {
      score: result.band,
      feedback: { criteriaScores: result.criteriaScores, feedback: result.feedback } as any,
      endedAt: new Date(),
    },
  });

  return { ...result, session: updatedSession };
};

// Manual, admin-triggered - always generates exactly one new test, with no
// ceiling. There's no automatic replenishment anymore (no cron, and the
// live per-user fallback in assignSpeakingTest generates its own on
// demand), so there's nothing left for a pool floor to protect against.
const generateOne = async (difficulty: Difficulty) => {
  try {
    await SpeakingTestGenerator.generateSpeakingTest(difficulty);
    await prisma.generationLog.create({
      data: { skill: SessionType.IELTS_SPEAKING, difficulty, status: 'SUCCESS' },
    });
    return { generated: 1 };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    await prisma.generationLog.create({
      data: {
        skill: SessionType.IELTS_SPEAKING,
        difficulty,
        status: 'FAILED',
        errorMessage: message.slice(0, 500),
      },
    });
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Failed to generate speaking test: ${message}`);
  }
};

export const SpeakingTestServices = {
  assignSpeakingTest,
  getSpeakingTestBySession,
  chat,
  transcribeAudio,
  submitPart2,
  analyzeSpeakingTest,
  generateOne,
};
