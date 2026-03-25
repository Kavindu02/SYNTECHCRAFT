import { NextResponse } from 'next/server';

function normalizeEnvCredential(value?: string) {
  if (typeof value !== 'string') return '';

  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizeInputCredential(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const adminUser = normalizeEnvCredential(process.env.ADMIN_USERNAME);
  const adminPass = normalizeEnvCredential(process.env.ADMIN_PASSWORD);
  const inputUsername = normalizeInputCredential(username);
  const inputPassword = normalizeInputCredential(password);

  if (!adminUser || !adminPass) {
    return NextResponse.json({ success: false, message: 'Server auth config missing' }, { status: 500 });
  }

  if (inputUsername.toLowerCase() === adminUser.toLowerCase() && inputPassword === adminPass) {
    // In a real app, you'd set a cookie or JWT
    const response = NextResponse.json({ success: true, message: 'Login successful' });
    response.cookies.set('admin_session', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });
    return response;
  }

  return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
}
