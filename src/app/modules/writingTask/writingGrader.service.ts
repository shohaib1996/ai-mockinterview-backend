import { OpenAI } from 'openai';
import config from '@/app/config';
import { ApiError } from '@/app/errors/apiError';
import httpStatus from 'http-status';
import { IELTSWritingTaskType } from '@prisma/client';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export interface IWritingCriteriaScores {
  taskScore: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
}

export interface IWritingGradeResult {
  criteriaScores: IWritingCriteriaScores;
  band: number;
  wordCount: number;
  feedback: string;
}

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const gradeWritingSubmission = async (
  task: IELTSWritingTaskType,
  promptText: string,
  submittedText: string,
): Promise<IWritingGradeResult> => {
  const wordCount = countWords(submittedText);
  const minWords = task === IELTSWritingTaskType.TASK1 ? 150 : 250;
  const taskCriterionName = task === IELTSWritingTaskType.TASK1 ? 'Task Achievement' : 'Task Response';

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an official IELTS Writing examiner grading ${task === IELTSWritingTaskType.TASK1 ? 'Academic Task 1' : 'Task 2'}.
Score strictly using the 4 official IELTS Writing band criteria, each from 0 to 9 in 0.5 increments:
${taskCriterionName}, Coherence and Cohesion, Lexical Resource, Grammatical Range and Accuracy.
The response is ${wordCount} words; the minimum required is ${minWords} words. A response under the
minimum should be penalized on ${taskCriterionName} per real IELTS rules.

Apply these real IELTS grading rules strictly:
- Penalize on ${taskCriterionName} if the response does not actually address the specific prompt
  given (off-topic or generic content that could answer almost any prompt).
- Penalize heavily if the response is mostly notes or bullet points rather than full, connected
  sentences and paragraphs — IELTS Writing requires continuous prose.
- Penalize on ${taskCriterionName} and Lexical Resource if large portions of the response appear
  copied verbatim from the prompt itself rather than the candidate's own writing.
- Penalize if the response reads like a memorized generic "model answer" disconnected from the
  specific prompt (formulaic template language, no specific engagement with the actual question)
  — real examiners are trained to detect and penalize this.

Respond ONLY with JSON in this exact shape:
{
  "taskScore": number,
  "coherenceCohesion": number,
  "lexicalResource": number,
  "grammaticalRange": number,
  "feedback": "detailed paragraph of feedback covering strengths and areas to improve"
}`,
      },
      {
        role: 'user',
        content: `Prompt:\n${promptText}\n\nCandidate's response (${wordCount} words):\n${submittedText}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'AI did not return grading content');
  }

  const parsed = JSON.parse(raw) as IWritingCriteriaScores & { feedback: string };

  const criteriaScores: IWritingCriteriaScores = {
    taskScore: parsed.taskScore,
    coherenceCohesion: parsed.coherenceCohesion,
    lexicalResource: parsed.lexicalResource,
    grammaticalRange: parsed.grammaticalRange,
  };

  const band =
    Math.round(
      ((criteriaScores.taskScore +
        criteriaScores.coherenceCohesion +
        criteriaScores.lexicalResource +
        criteriaScores.grammaticalRange) /
        4) *
        2,
    ) / 2;

  return { criteriaScores, band, wordCount, feedback: parsed.feedback };
};

export const WritingGraderService = { gradeWritingSubmission };
