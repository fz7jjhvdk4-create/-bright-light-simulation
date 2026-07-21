import { NextRequest, NextResponse } from 'next/server';
import { getTeacherToken, TEACHER_COOKIE } from '@/lib/teacher-auth';

const EIGHT_HOURS = 60 * 60 * 8;

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!process.env.TEACHER_PASSWORD) {
      console.error('TEACHER_PASSWORD saknas i miljövariablerna');
      return NextResponse.json(
        { success: false, error: 'Lärarportalen är inte konfigurerad. Sätt TEACHER_PASSWORD.' },
        { status: 500 }
      );
    }

    if (typeof password !== 'string' || password !== process.env.TEACHER_PASSWORD) {
      return NextResponse.json(
        { success: false, error: 'Fel lösenord' },
        { status: 401 }
      );
    }

    const token = await getTeacherToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set(TEACHER_COOKIE, token!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: EIGHT_HOURS,
    });
    return response;
  } catch (error) {
    console.error('Teacher login error:', error);
    return NextResponse.json(
      { success: false, error: 'Inloggningen misslyckades' },
      { status: 500 }
    );
  }
}

// Logout: clear the session cookie
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(TEACHER_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
