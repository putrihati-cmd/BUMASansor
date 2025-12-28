/**
 * Facebook OAuth Login API
 * Handle Facebook authentication
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { generateToken } from '@/lib/auth';

import bcrypt from 'bcryptjs';


/**
 * POST /api/auth/facebook
 * Authenticate user with Facebook OAuth token
 * Body: { token: string, profile: object }
 */
export async function POST(request) {
    try {
        const { token, profile } = await request.json();

        if (!profile || !profile.email) {
            return NextResponse.json(
                { error: 'Invalid Facebook profile data' },
                { status: 400 }
            );
        }

        const { email, name, picture, id: facebookId } = profile;

        // Check if user exists
        let user = await prisma.users.findUnique({
            where: { email }
        });

        if (user) {
            // User exists - update profile if needed
            if (!user.avatarUrl && picture) {
                user = await prisma.users.update({
                    where: { email },
                    data: {
                        avatarUrl: picture?.data?.url || null,
                        emailVerifiedAt: new Date(),
                        status: 'ACTIVE'
                    }
                });
            }
        } else {
            // Create new user
            // Generate random password for social login users
            const randomPassword = await bcrypt.hash(
                Math.random().toString(36) + Date.now(),
                10
            );

            user = await prisma.users.create({
                data: {
                    email,
                    name,
                    passwordHash: randomPassword,
                    avatarUrl: picture?.data?.url || null,
                    emailVerifiedAt: new Date(),
                    status: 'ACTIVE',
                    role: 'CUSTOMER'
                }
            });

            // Create user points record
            await prisma.user_points.create({
                data: {
                    userId: user.id,
                    balance: 100, // Welcome bonus
                    lifetime: 100
                }
            });

            // Log registration
            await prisma.point_transactions.create({
                data: {
                    userId: user.id,
                    type: 'EARN_REFERRAL',
                    amount: 100,
                    balance: 100,
                    description: 'Welcome bonus for new registration'
                }
            });
        }

        // Generate JWT token
        const jwtToken = await generateToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        // Set cookie
        const response = NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatarUrl: user.avatarUrl
            },
            message: 'Login successful'
        });

        response.cookies.set('token', jwtToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        return response;

    } catch (error) {
        console.error('[Facebook Auth] Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to authenticate with Facebook',
                details: error.message
            },
            { status: 500 }
        );
    }
}

