import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import { verifyAuth } from '@/lib/auth';

// POST /api/reviews - Submit a review
export async function POST(request) {
    try {
        const auth = await verifyAuth(request);
        if (!auth.success) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const user = auth.user;

        const body = await request.json();
        const { productId, rating, title, comment } = body;

        // Validation
        if (!productId || !rating || !comment) {
            return NextResponse.json({
                error: 'Product ID, rating, dan comment wajib diisi'
            }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({
                error: 'Rating harus antara 1-5'
            }, { status: 400 });
        }

        // Check if product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findFirst({
            where: {
                productId,
                userId: user.userId,
            },
        });

        if (existingReview) {
            return NextResponse.json({
                error: 'Anda sudah memberikan review untuk produk ini'
            }, { status: 400 });
        }

        // Optional: Check if user has purchased this product
        // const hasPurchased = await prisma.orderItem.findFirst({
        //   where: {
        //     productId,
        //     order: {
        //       userId: user.userId,
        //       status: 'COMPLETED',
        //     },
        //   },
        // });
        // if (!hasPurchased) {
        //   return NextResponse.json({ 
        //     error: 'Anda harus membeli produk ini terlebih dahulu untuk memberikan review' 
        //   }, { status: 400 });
        // }

        // Create review
        const review = await prisma.review.create({
            data: {
                userId: user.id,
                productId,
                rating,
                title: title || null,
                comment,
                status: 'APPROVED', // Auto-approve for now, or 'PENDING' for moderation
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: 'Review berhasil ditambahkan',
            review,
        }, { status: 201 });
    } catch (error) {
        console.error('Submit review error:', error);
        return NextResponse.json({ error: 'Gagal menambahkan review' }, { status: 500 });
    }
}

// GET /api/reviews?productId=xxx - Get reviews by product
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const sortBy = searchParams.get('sortBy') || 'recent'; // recent, helpful, rating

        if (!productId) {
            return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
        }

        const skip = (page - 1) * limit;

        // Build orderBy based on sortBy
        let orderBy = {};
        if (sortBy === 'recent') {
            orderBy = { createdAt: 'desc' };
        } else if (sortBy === 'helpful') {
            orderBy = { helpfulCount: 'desc' };
        } else if (sortBy === 'rating') {
            orderBy = { rating: 'desc' };
        }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: {
                    productId,
                    status: 'APPROVED',
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy,
                skip,
                take: limit,
            }),
            prisma.review.count({
                where: {
                    productId,
                    status: 'APPROVED',
                },
            }),
        ]);

        // Calculate rating summary
        const ratingSummary = await prisma.review.groupBy({
            by: ['rating'],
            where: {
                productId,
                status: 'APPROVED',
            },
            _count: {
                rating: true,
            },
        });

        const summary = {
            1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        };
        ratingSummary.forEach(r => {
            summary[r.rating] = r._count.rating;
        });

        const avgRating = await prisma.review.aggregate({
            where: {
                productId,
                status: 'APPROVED',
            },
            _avg: {
                rating: true,
            },
        });

        return NextResponse.json({
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            summary: {
                average: avgRating._avg.rating || 0,
                total,
                breakdown: summary,
            },
        });
    } catch (error) {
        console.error('Get reviews error:', error);
        return NextResponse.json({ error: 'Gagal mengambil reviews' }, { status: 500 });
    }
}

