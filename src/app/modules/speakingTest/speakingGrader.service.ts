import { OpenAI } from 'openai';
import config from '@/app/config';
import { ApiError } from '@/app/errors/apiError';
import httpStatus from 'http-status';

const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });

export interface ISpeakingCriteriaScores {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
}

export interface ISpeakingGradeResult {
  criteriaScores: ISpeakingCriteriaScores;
  band: number;
  feedback: string;
}

const gradeSpeakingTest = async (
  transcript: { role: string; content: string; part: number }[],
): Promise<ISpeakingGradeResult> => {
  const transcriptText = transcript
    .map((m) => `[Part ${m.part}] ${m.role === 'user' ? 'Candidate' : 'Examiner'}: ${m.content}`)
    .join('\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `You are an official IELTS Speaking examiner grading a completed 3-part speaking test
from its transcript. Score strictly using the 4 official IELTS Speaking band criteria, each from 0 to 9
in 0.5 increments: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and
Pronunciation.

IMPORTANT: you only have a text transcript, not audio. Pronunciation cannot be assessed acoustically —
estimate it only from indirect textual signals (word choice suggesting register/accent-neutral phrasing,
sentence complexity) and explicitly say in the feedback that this Pronunciation score is an approximation
since no audio was analyzed.

Respond ONLY with JSON in this exact shape:
{
  "fluencyCoherence": number,
  "lexicalResource": number,
  "grammaticalRange": number,
  "pronunciation": number,
  "feedback": "detailed paragraph covering strengths, areas to improve, and the pronunciation caveat"
}`,
      },
      { role: 'user', content: `Transcript:\n${transcriptText}` },
    ],
  });

  const raw = completion.choices[0]?.message.content;
  if (!raw) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'AI did not return grading content');
  }

  const parsed = JSON.parse(raw) as ISpeakingCriteriaScores & { feedback: string };

  const criteriaScores: ISpeakingCriteriaScores = {
    fluencyCoherence: parsed.fluencyCoherence,
    lexicalResource: parsed.lexicalResource,
    grammaticalRange: parsed.grammaticalRange,
    pronunciation: parsed.pronunciation,
  };

  const band =
    Math.round(
      ((criteriaScores.fluencyCoherence +
        criteriaScores.lexicalResource +
        criteriaScores.grammaticalRange +
        criteriaScores.pronunciation) /
        4) *
        2,
    ) / 2;

  return { criteriaScores, band, feedback: parsed.feedback };
};

export const SpeakingGraderService = { gradeSpeakingTest };
