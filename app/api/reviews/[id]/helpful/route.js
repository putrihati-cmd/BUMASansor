import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// POST /api/reviews/[id]/helpful - Mark review as helpful
export async function POST(request, { params }) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const reviewId = params.id;

        // Check if review exists
        const review = await prisma.reviews.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            return NextResponse.json({ error: 'Review tidak ditemukan' }, { status: 404 });
        }

        // Check if user already marked this review as helpful
        const existingHelpful = await prisma.reviewHelpful.findFirst({
            where: {
                reviewId,
                userId: auth.user.id,
            },
        });

        if (existingHelpful) {
            // Remove helpful (toggle)
            await prisma.$transaction([
                prisma.reviewHelpful.delete({
                    where: { id: existingHelpful.id },
                }),
                prisma.reviews.update({
                    where: { id: reviewId },
                    data: {
                        helpfulCount: {
                            decrement: 1,
                        },
                    },
                }),
            ]);

            return NextResponse.json({
                message: 'Mark helpful removed',
                helpful: false,
            });
        } else {
            // Add helpful
            await prisma.$transaction([
                prisma.reviewHelpful.create({
                    data: {
                        reviewId,
                        userId: auth.user.id,
                    },
                }),
                prisma.reviews.update({
                    where: { id: reviewId },
                    data: {
                        helpfulCount: {
                            increment: 1,
                        },
                    },
                }),
            ]);

            return NextResponse.json({
                message: 'Review marked as helpful',
                helpful: true,
            });
        }
    } catch (error) {
        console.error('Mark helpful error:', error);
        return NextResponse.json({ error: 'Gagal memproses request' }, { status: 500 });
    }
}
