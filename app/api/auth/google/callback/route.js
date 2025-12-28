import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/auth/login?error=GoogleAuthFailed', request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/auth/login?error=NoCode', request.url));
    }

    try {
        const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
        const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
        const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

        // 1. Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            }),
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Google Token API Error:', tokenData);
            return NextResponse.redirect(new URL('/auth/login?error=TokenExchangeFailed', request.url));
        }

        // 2. Get user info
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });

        const userData = await userResponse.json();

        if (!userResponse.ok) {
            return NextResponse.redirect(new URL('/auth/login?error=UserInfoFailed', request.url));
        }

        // 3. Find or Create User
        let user = await prisma.users.findFirst({
            where: {
                OR: [
                    { googleId: userData.id },
                    { email: userData.email }
                ]
            }
        });

        if (user) {
            // Update googleId if not present (e.g. registered via email before)
            if (!user.googleId) {
                user = await prisma.users.update({
                    where: { id: user.id },
                    data: {
                        googleId: userData.id,
                        status: user.status === 'UNVERIFIED' ? 'ACTIVE' : user.status, // Auto-verify if email matches Google
                        avatarUrl: user.avatarUrl || userData.picture
                    }
                });
            }
        } else {
            // Register new user
            user = await prisma.users.create({
                data: {
                    name: userData.name,
                    email: userData.email,
                    googleId: userData.id,
                    avatarUrl: userData.picture,
                    passwordHash: '', // No password for OAuth users
                    status: 'ACTIVE', // Google emails are verified
                    role: 'CUSTOMER'
                }
            });
        }

        // 4. Generate JWT Token
        const appToken = await generateToken(user);

        // 5. Create response with redirect and cookie
        // Prepare user object for client (store in localStorage via client script)
        // Since we can't write to localStorage from server, we pass token in URL hash or query param temporarily
        // BUT safer is to verify cookie.

        // Strategy: Set HttpOnly cookie for server security, and also pass token in query for client store sync

        const response = NextResponse.redirect(new URL(`/?token=${appToken}`, request.url));

        response.cookies.set('auth-token', appToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error('Google Auth Error:', error);
        return NextResponse.redirect(new URL('/auth/login?error=InternalError', request.url));
    }
}

