// Teacher session auth shared between the login route and middleware.
// The cookie value is a SHA-256 digest derived from TEACHER_PASSWORD, so
// changing the password in Vercel invalidates all existing sessions.
// Web Crypto is used (instead of node:crypto) because middleware runs on the edge runtime.

export const TEACHER_COOKIE = 'teacher_token';

export async function getTeacherToken(): Promise<string | null> {
  const password = process.env.TEACHER_PASSWORD;
  if (!password) return null;

  const data = new TextEncoder().encode(`bls-teacher-v1:${password}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
