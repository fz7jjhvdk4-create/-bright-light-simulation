import { NextRequest, NextResponse } from 'next/server';
import { getTeacherToken, TEACHER_COOKIE } from '@/lib/teacher-auth';

// Guards all teacher-only API routes. Valid instructions come only from a
// signed-in teacher (httpOnly cookie set by /api/teacher/login).
export async function proxy(request: NextRequest) {
  // The login route itself must stay open
  if (request.nextUrl.pathname === '/api/teacher/login') {
    return NextResponse.next();
  }

  const expected = await getTeacherToken();
  const actual = request.cookies.get(TEACHER_COOKIE)?.value;

  if (!expected || !actual || actual !== expected) {
    return NextResponse.json(
      { success: false, error: 'Ej behörig. Logga in i lärarportalen.' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/teacher/:path*',
    '/api/init',
    '/api/groups/:code/approve',
    '/api/groups/:code/approve-gate',
    '/api/groups/:code/approve-investigation',
    '/api/groups/:code/approve-project-plan',
  ],
};
