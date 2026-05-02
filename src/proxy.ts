import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { decrypt } from '@/lib/auth';

// 1. Specify protected and public routes
const protectedRoutes = ['/student', '/faculty', '/hod', '/principal'];
const publicRoutes = ['/login', '/', '/signup'];

export async function proxy(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // 3. Decrypt the session from the cookie
  const cookie = req.cookies.get('session')?.value;
  const session = cookie ? await decrypt(cookie).catch(() => null) : null;

  // 4. Redirect to /login if the user is not authenticated
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  // 5. Role-based access control
  if (session) {
    const { role } = session.user;
    if (path.startsWith('/student') && role !== 'STUDENT') {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    if (path.startsWith('/faculty') && role !== 'FACULTY') {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    if (path.startsWith('/hod') && role !== 'HOD') {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
    if (path.startsWith('/principal') && role !== 'PRINCIPAL') {
      return NextResponse.redirect(new URL('/', req.nextUrl));
    }
  }

  // 6. Redirect to dashboard if the user is authenticated and tries to access /login
  if (isPublicRoute && session && !path.startsWith('/signup')) {
    const { role } = session.user;
    if (role === 'STUDENT') return NextResponse.redirect(new URL('/student', req.nextUrl));
    if (role === 'FACULTY') return NextResponse.redirect(new URL('/faculty', req.nextUrl));
    if (role === 'HOD') return NextResponse.redirect(new URL('/hod', req.nextUrl));
    if (role === 'PRINCIPAL') return NextResponse.redirect(new URL('/principal', req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
