// Shared between the chat API (enforcement) and the UI (counter display).
// Kept low on purpose: a capped question budget makes students plan their
// interviews instead of fishing, and it caps AI cost per group.
export const MAX_INTERVIEW_QUESTIONS = 10;
