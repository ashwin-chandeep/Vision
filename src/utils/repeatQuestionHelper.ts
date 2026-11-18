/**
 * ACCESSPREP-X Accessible Question & Option Reading Utility
 * Formats question stems, full question with options, all options, and individual options
 * for screen-reader and Web Speech API TTS output adhering to WCAG 2.2 AA.
 *
 * Mathematical notation (plain-text or LaTeX) in numerical/reasoning questions is converted to
 * natural, grouping-preserving speech by the structured math renderer — raw symbols are never read.
 */

import { Question } from '../db/database.ts';
import { renderTextWithMathToSpeech } from '../math/mathematicalSpeechRenderer.ts';
import {
  formatReasoningQuestionSpeech,
  formatReasoningOptionSpeech
} from './reasoningSpeechFormatter.ts';

/** Only mathematical subjects are rewritten; other subjects are spoken verbatim as before. */
function isMathSubject(subject?: string): boolean {
  return /numerical|reasoning/i.test(subject || '');
}

/** Speech-safe version of any text belonging to a question of the given subject. */
export function speakableQuestionText(text: string, subject?: string, topic?: string): string {
  if (!text) return '';
  // Apply math rendering first for numerical subjects, then reasoning speech formatting
  const afterMath = isMathSubject(subject) ? renderTextWithMathToSpeech(text) : text;
  return formatReasoningQuestionSpeech(afterMath, subject, topic);
}

/** Speech for a single option (e.g. "7/9", "x^2", "3 : 2", "4% increase"). Plain words pass through unchanged. */
export function speakableOptionText(text: string, subject?: string, topic?: string, questionText?: string): string {
  if (!text) return '';
  const afterMath = isMathSubject(subject) ? renderTextWithMathToSpeech(text) : text;
  return formatReasoningOptionSpeech(afterMath, subject, topic, questionText);
}

function optionsOf(q: Question) {
  return {
    A: speakableOptionText(q.option_a, q.subject, q.topic, q.question_text),
    B: speakableOptionText(q.option_b, q.subject, q.topic, q.question_text),
    C: speakableOptionText(q.option_c, q.subject, q.topic, q.question_text),
    D: speakableOptionText(q.option_d, q.subject, q.topic, q.question_text)
  };
}

/**
 * Format complete question with subject context and all four options
 */
export function formatFullQuestionPrompt(q: Question, idx?: number, total?: number): string {
  const prefix =
    idx !== undefined && total !== undefined
      ? `Question ${idx + 1} of ${total}. Section: ${q.subject}. `
      : `Section: ${q.subject}. `;

  const o = optionsOf(q);
  return `${prefix}${speakableQuestionText(q.question_text, q.subject, q.topic)}. Option A: ${o.A}. Option B: ${o.B}. Option C: ${o.C}. Option D: ${o.D}. What is your answer?`;
}

/**
 * Format question stem text only (without options)
 */
export function formatQuestionStemOnly(q: Question, idx?: number, total?: number): string {
  const prefix =
    idx !== undefined && total !== undefined
      ? `Question ${idx + 1} of ${total}. Section: ${q.subject}. `
      : `Section: ${q.subject}. `;

  return `${prefix}${speakableQuestionText(q.question_text, q.subject, q.topic)}.`;
}

/**
 * Speech for only the equations/expressions in the question stem ("Repeat Equation").
 * Falls back to the whole stem when no distinct equation can be isolated.
 */
export function formatEquationOnlyPrompt(q: Question): string {
  const stem = speakableQuestionText(q.question_text, q.subject, q.topic);
  return `The question is: ${stem}.`;
}

/**
 * Format all options with clear labels (A, B, C, D)
 */
export function formatAllOptionsPrompt(q: Question): string {
  const o = optionsOf(q);
  return `The options are: Option A: ${o.A}. Option B: ${o.B}. Option C: ${o.C}. Option D: ${o.D}.`;
}

/**
 * Format an individual option by key
 */
export function formatSingleOptionPrompt(q: Question, opt: 'A' | 'B' | 'C' | 'D'): string {
  const key = `option_${opt.toLowerCase()}` as keyof Question;
  const val = speakableOptionText(String(q[key] || ''), q.subject, q.topic, q.question_text);
  return `Option ${opt}: ${val}.`;
}

/**
 * Speech-safe explanation text (used by Repeat Explanation / Explain the equation).
 */
export function formatExplanationPrompt(q: { explanation: string; subject?: string }): string {
  return `Explanation: ${speakableQuestionText(q.explanation.trim().replace(/\.+$/, ''), q.subject)}.`;
}

/**
 * Format flashcard question for spaced repetition revision session
 */
export function formatFlashcardQuestionPrompt(
  card: { subject: string; topic: string; questionText: string },
  idx?: number,
  total?: number
): string {
  const prefix =
    idx !== undefined && total !== undefined
      ? `Revision Card ${idx + 1} of ${total}. Subject: ${card.subject}, Topic: ${card.topic}. `
      : `Subject: ${card.subject}, Topic: ${card.topic}. `;

  return `${prefix}${speakableQuestionText(card.questionText, card.subject)}.`;
}

/**
 * Returns ONLY the question text — no prefix, no question number, no "Section:", no options.
 * Use for keyboard shortcut R and voice command "repeat question".
 */
export function repeatQuestionTextOnly(q: Question): string {
  return speakableQuestionText(q.question_text, q.subject, q.topic);
}

/**
 * Returns ONLY "A: [text]. B: [text]. C: [text]. D: [text]." — no "The options are:" intro.
 * Use for keyboard shortcut O and voice command "repeat options".
 */
export function repeatOptionsTextOnly(q: Question): string {
  const o = optionsOf(q);
  const parts: string[] = [];
  if (o.A) parts.push(`A: ${o.A}`);
  if (o.B) parts.push(`B: ${o.B}`);
  if (o.C) parts.push(`C: ${o.C}`);
  if (o.D) parts.push(`D: ${o.D}`);
  return parts.join('. ') + '.';
}

/**
 * Format flashcard answer & explanation
 */
export function formatFlashcardAnswerPrompt(card: {
  correctAnswer: string;
  explanation: string;
  subject?: string;
}): string {
  const cleanExp = card.explanation.trim().replace(/\.+$/, '');
  return `Answer: ${speakableOptionText(card.correctAnswer, card.subject)}. Explanation: ${speakableQuestionText(cleanExp, card.subject)}.`;
}
