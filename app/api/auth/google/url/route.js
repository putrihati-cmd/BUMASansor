import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json(
            { error: 'Google Client ID not configured' },
            { status: 500 }
        );
    }

    const scope = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ');

    const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;

    return NextResponse.json({ url: googleLoginUrl });
}

