import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const adminUser = process.env.ADMIN_USERNAME?.trim();
  const adminPass = process.env.ADMIN_PASSWORD?.trim();
  const inputUsername = typeof username === 'string' ? username.trim() : '';
  const inputPassword = typeof password === 'string' ? password.trim() : '';

  if (!adminUser || !adminPass) {
    return NextResponse.json({ success: false, message: 'Server auth config missing' }, { status: 500 });
  }

  if (inputUsername === adminUser && inputPassword === adminPass) {
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
