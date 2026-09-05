import type { PrequalAnswer, PrequalQuestion, PrequalSet } from "./data/types";

export function checkAnswer(q: PrequalQuestion, answer: string): boolean {
  if (!q.rule) return true;
  const { op, value } = q.rule;
  switch (op) {
    case "eq":
      return answer === String(value);
    case "neq":
      return answer !== String(value);
    case "gte":
      return Number(answer) >= Number(value);
    case "lte":
      return Number(answer) <= Number(value);
    case "before":
      return answer <= String(value);
    case "after":
      return answer >= String(value);
    case "in":
      return Array.isArray(value) && value.includes(answer);
  }
}

export type PrequalOutcome = "PASS" | "FAIL" | "WAITLIST";

export function evaluateAnswers(set: PrequalSet, answers: PrequalAnswer[]): { outcome: PrequalOutcome; failed?: PrequalQuestion } {
  for (const q of set.questions) {
    const a = answers.find((x) => x.questionId === q.id);
    if (!a) {
      if (q.required) return { outcome: "FAIL", failed: q };
      continue;
    }
    if (!a.passed) return { outcome: q.waitlistOnFail ? "WAITLIST" : "FAIL", failed: q };
  }
  return { outcome: "PASS" };
}
