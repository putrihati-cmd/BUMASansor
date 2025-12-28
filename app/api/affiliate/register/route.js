/**
 * Affiliate Registration API
 * Register as affiliate/reseller
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { requireAuth } from '@/lib/auth';


/**
 * POST /api/affiliate/register
 * Register current user as affiliate
 */
export const POST = requireAuth(async function POST(request, context) {
    try {
        const { bankAccount } = await request.json();

        // Check if already registered
        const existing = await prisma.affiliate.findUnique({
            where: { userId: context.user.id }
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Already registered as affiliate' },
                { status: 400 }
            );
        }

        // Generate unique referral code
        const referralCode = `REF${context.user.id.substring(0, 8).toUpperCase()}`;

        // Create affiliate record
        const affiliate = await prisma.affiliate.create({
            data: {
                userId: context.user.id,
                referralCode,
                bankAccount,
                tier: 'BRONZE',
                commissionRate: 0.05 // 5% default
            }
        });

        return NextResponse.json({
            success: true,
            affiliate: {
                id: affiliate.id,
                referralCode: affiliate.referralCode,
                tier: affiliate.tier,
                commissionRate: parseFloat(affiliate.commissionRate)
            }
        });

    } catch (error) {
        console.error('[Affiliate Register] Error:', error);
        return NextResponse.json(
            { error: 'Failed to register affiliate', details: error.message },
            { status: 500 }
        );
    }
});

/**
 * GET /api/affiliate/register
 * Get current affiliate status
 */
export const GET = requireAuth(async function GET(request, context) {
    try {
        const affiliate = await prisma.affiliate.findUnique({
            where: { userId: context.user.id },
            include: {
                _count: {
                    select: {
                        referrals: true,
                        commissions: true
                    }
                }
            }
        });

        if (!affiliate) {
            return NextResponse.json({
                registered: false
            });
        }

        return NextResponse.json({
            registered: true,
            affiliate: {
                id: affiliate.id,
                referralCode: affiliate.referralCode,
                tier: affiliate.tier,
                commissionRate: parseFloat(affiliate.commissionRate),
                totalEarnings: parseFloat(affiliate.totalEarnings),
                availableBalance: parseFloat(affiliate.availableBalance),
                totalReferrals: affiliate._count.referrals,
                totalCommissions: affiliate._count.commissions,
                status: affiliate.status
            }
        });

    } catch (error) {
        console.error('[Affiliate Status] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get affiliate status', details: error.message },
            { status: 500 }
        );
    }
});

