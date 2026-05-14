// middleware.ts

import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const COOKIE_NAME = 'at_session';

function getSecret(): Uint8Array {
    return new TextEncoder().encode(process.env.JWT_SECRET ?? '');
}

const PUBLIC_PATHS = ['/login'];
const ADMIN_PATHS = ['/admin'];

export async function middleware(req: NextRequest): Promise<NextResponse> {
    const { pathname } = req.nextUrl;

    // Allow public paths
    if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
        return NextResponse.next();
    }

    const token = req.cookies.get(COOKIE_NAME)?.value;

    // No token → redirect to login
    if (!token) {
        return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
        const { payload } = await jwtVerify(token, getSecret());
        const role = payload.role as string;

        // Admin-only route guard
        if (ADMIN_PATHS.some((p) => pathname.startsWith(p)) && role !== 'admin') {
            return NextResponse.redirect(new URL('/app', req.url));
        }

        return NextResponse.next();
    } catch {
        // Invalid/expired token
        const res = NextResponse.redirect(new URL('/login', req.url));
        res.cookies.delete(COOKIE_NAME);
        return res;
    }
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|api/public).*)'],
};