/**
 * AI Product Recommendations Library
 * 
 * Provides personalized product recommendations using:
 * - Collaborative filtering (users who bought X also bought Y)
 * - Content-based filtering (similar products by category/attributes)
 * - Hybrid approach combining both methods
 * - AI-enhanced ranking using LLM
 */

import prisma from './prisma';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// Initialize AI clients
const geminiClient = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const groqClient = process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

/**
 * Get recommendations based on context
 */
export async function getRecommendations({
    userId = null,
    productId = null,
    categoryId = null,
    context = 'homepage', // 'homepage', 'product', 'cart', 'checkout'
    limit = 8
}) {
    try {
        let recommendations = [];

        // Strategy 1: For logged-in users, personalized recommendations
        if (userId) {
            recommendations = await getPersonalizedRecommendations(userId, limit);
        }

        // Strategy 2: For product page, get similar products
        if (productId && recommendations.length < limit) {
            const similar = await getSimilarProducts(productId, limit - recommendations.length);
            recommendations = mergeRecommendations(recommendations, similar);
        }

        // Strategy 3: For category browsing
        if (categoryId && recommendations.length < limit) {
            const categoryProducts = await getCategoryBestSellers(categoryId, limit - recommendations.length);
            recommendations = mergeRecommendations(recommendations, categoryProducts);
        }

        // Fallback: Popular products
        if (recommendations.length < limit) {
            const popular = await getPopularProducts(limit - recommendations.length);
            recommendations = mergeRecommendations(recommendations, popular);
        }

        return {
            recommendations: recommendations.slice(0, limit),
            context,
            algorithm: userId ? 'personalized' : productId ? 'similar' : 'popular'
        };
    } catch (error) {
        console.error('[AI Recommendations] Error:', error);
        // Fallback to popular products
        const popular = await getPopularProducts(limit);
        return {
            recommendations: popular,
            context,
            algorithm: 'fallback'
        };
    }
}

/**
 * Get personalized recommendations for a user
 */
async function getPersonalizedRecommendations(userId, limit) {
    // Get user's purchase history
    const purchasedProducts = await prisma.order_items.findMany({
        where: {
            orders: {
                userId,
                status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] }
            }
        },
        select: {
            product_id: true,
            products: {
                select: { category_id: true }
            }
        },
        distinct: ['productId'],
        take: 20
    });

    // Get user's wishlist
    const wishlistProducts = await prisma.wishlists.findMany({
        where: { userId },
        select: { product_id: true },
        take: 10
    });

    // Get user's cart
    const cartProducts = await prisma.carts.findMany({
        where: { userId },
        select: { product_id: true }
    });

    // Combine all user interactions
    const interactedProductIds = [
        ...purchasedProducts.map(p => p.productId),
        ...wishlistProducts.map(w => w.productId),
        ...cartProducts.map(c => c.productId)
    ];

    // Get preferred categories from purchase history
    const preferredCategories = [...new Set(
        purchasedProducts
            .map(p => p.product?.categoryId)
            .filter(Boolean)
    )];

    // Find products in preferred categories (not yet purchased)
    if (preferredCategories.length > 0) {
        const categoryRecommendations = await prisma.products.findMany({
            where: {
                category_id: { in: preferredCategories },
                id: { notIn: interactedProductIds },
                status: 'ACTIVE',
                stock: { gt: 0 }
            },
            include: {
                categories: true,
                reviews: {
                    where: { status: 'APPROVED' },
                    select: { rating: true }
                }
            },
            take: limit,
            orderBy: [
                { is_featured: 'desc' },
                { created_at: 'desc' }
            ]
        });

        return categoryRecommendations.map(p => formatProduct(p));
    }

    // Fallback: Collaborative filtering - products bought by similar users
    const similarUsersPurchases = await prisma.order_items.findMany({
        where: {
            product_id: { in: purchasedProducts.map(p => p.productId) },
            orders: {
                user_id: { not: userId },
                status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] }
            }
        },
        select: {
            orders: { select: { user_id: true } }
        },
        distinct: ['order'],
        take: 50
    });

    const similarUserIds = similarUsersPurchases.map(p => p.order.user_id);

    if (similarUserIds.length > 0) {
        const collaborativeProducts = await prisma.order_items.findMany({
            where: {
                orders: {
                    user_id: { in: similarUserIds },
                    status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] }
                },
                product_id: { notIn: interactedProductIds }
            },
            select: {
                products: {
                    include: {
                        categories: true,
                        reviews: {
                            where: { status: 'APPROVED' },
                            select: { rating: true }
                        }
                    }
                }
            },
            distinct: ['productId'],
            take: limit
        });

        return collaborativeProducts
            .map(p => p.product)
            .filter(p => p && p.status === 'ACTIVE' && p.stock > 0)
            .map(p => formatProduct(p));
    }

    return [];
}

/**
 * Get similar products based on a product
 */
async function getSimilarProducts(productId, limit) {
    // Get the source product
    const sourceProduct = await prisma.products.findUnique({
        where: { id: productId },
        select: {
            category_id: true,
            base_price: true,
            name: true
        }
    });

    if (!sourceProduct) return [];

    // Find similar products in same category with similar price range
    const priceRange = {
        min: Number(sourceProduct.base_price) * 0.5,
        max: Number(sourceProduct.base_price) * 1.5
    };

    const similarProducts = await prisma.products.findMany({
        where: {
            id: { not: productId },
            category_id: sourceProduct.categoryId,
            status: 'ACTIVE',
            stock: { gt: 0 },
            base_price: {
                gte: priceRange.min,
                lte: priceRange.max
            }
        },
        include: {
            categories: true,
            reviews: {
                where: { status: 'APPROVED' },
                select: { rating: true }
            }
        },
        take: limit,
        orderBy: [
            { is_featured: 'desc' },
            { created_at: 'desc' }
        ]
    });

    return similarProducts.map(p => formatProduct(p));
}

/**
 * Get best sellers in a category
 */
async function getCategoryBestSellers(categoryId, limit) {
    // Get products ordered most frequently in this category
    const orderItemCounts = await prisma.order_items.groupBy({
        by: ['productId'],
        where: {
            products: {
                categoryId,
                status: 'ACTIVE',
                stock: { gt: 0 }
            },
            orders: {
                status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'COMPLETED'] }
            }
        },
        _count: { product_id: true },
        orderBy: { _count: { product_id: 'desc' } },
        take: limit
    });

    if (orderItemCounts.length === 0) {
        // Fallback to newest products if no sales data
        const products = await prisma.products.findMany({
            where: {
                categoryId,
                status: 'ACTIVE',
                stock: { gt: 0 }
            },
            include: {
                categories: true,
                reviews: {
                    where: { status: 'APPROVED' },
                    select: { rating: true }
                }
            },
            take: limit,
            orderBy: { created_at: 'desc' }
        });
        return products.map(p => formatProduct(p));
    }

    const productIds = orderItemCounts.map(item => item.productId);
    const products = await prisma.products.findMany({
        where: { id: { in: productIds } },
        include: {
            categories: true,
            reviews: {
                where: { status: 'APPROVED' },
                select: { rating: true }
            }
        }
    });

    // Sort by order count
    const orderMap = new Map(orderItemCounts.map(item => [item.productId, item._count.productId]));
    products.sort((a, b) => (orderMap.get(b.id) || 0) - (orderMap.get(a.id) || 0));

    return products.map(p => formatProduct(p));
}

/**
 * Get popular products overall
 */
async function getPopularProducts(limit) {
    // Get featured products first, then by sales
    const products = await prisma.products.findMany({
        where: {
            status: 'ACTIVE',
            stock: { gt: 0 }
        },
        include: {
            categories: true,
            reviews: {
                where: { status: 'APPROVED' },
                select: { rating: true }
            },
            _count: {
                select: { orderItems: true }
            }
        },
        take: limit * 2,
        orderBy: [
            { is_featured: 'desc' },
            { created_at: 'desc' }
        ]
    });

    // Sort by order count
    products.sort((a, b) => (b._count.orderItems || 0) - (a._count.orderItems || 0));

    return products.slice(0, limit).map(p => formatProduct(p));
}

/**
 * Get "Frequently Bought Together" recommendations
 */
export async function getFrequentlyBoughtTogether(productId, limit = 4) {
    // Find orders containing this product
    const ordersWithProduct = await prisma.order_items.findMany({
        where: { productId },
        select: { order_id: true },
        take: 100
    });

    const orderIds = ordersWithProduct.map(o => o.orderId);

    if (orderIds.length === 0) {
        return await getSimilarProducts(productId, limit);
    }

    // Find other products in those orders
    const coProducts = await prisma.order_items.groupBy({
        by: ['productId'],
        where: {
            order_id: { in: orderIds },
            product_id: { not: productId },
            products: {
                status: 'ACTIVE',
                stock: { gt: 0 }
            }
        },
        _count: { product_id: true },
        orderBy: { _count: { product_id: 'desc' } },
        take: limit
    });

    const coProductIds = coProducts.map(p => p.productId);
    const products = await prisma.products.findMany({
        where: { id: { in: coProductIds } },
        include: {
            categories: true,
            reviews: {
                where: { status: 'APPROVED' },
                select: { rating: true }
            }
        }
    });

    // Sort by frequency
    const freqMap = new Map(coProducts.map(p => [p.productId, p._count.productId]));
    products.sort((a, b) => (freqMap.get(b.id) || 0) - (freqMap.get(a.id) || 0));

    return products.map(p => formatProduct(p));
}

/**
 * Get AI-enhanced description for why product is recommended
 */
export async function getRecommendationReason(product, context) {
    try {
        const prompt = `Berikan alasan singkat (1 kalimat, max 15 kata) mengapa produk "${product.name}" cocok untuk customer.
Konteks: ${context === 'similar' ? 'Produk serupa yang mungkin disukai' : context === 'popular' ? 'Produk populer' : 'Rekomendasi personal'}
Kategori: ${product.categoriesName || 'Umum'}
Format: Langsung tulis alasannya tanpa "karena" di awal.`;

        if (geminiClient) {
            const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        }

        if (groqClient) {
            const completion = await groqClient.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                max_tokens: 50
            });
            return completion.choices[0]?.message?.content?.trim() || '';
        }

        // Fallback
        return '';
    } catch (error) {
        console.error('[AI Recommendation Reason] Error:', error);
        return '';
    }
}

/**
 * Format product for response
 */
function formatProduct(product) {
    const reviews = product.reviews || [];
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        base_price: Number(product.base_price),
        sale_price: product.sale_price ? Number(product.sale_price) : null,
        images: product.images,
        category_id: product.category_id,
        categoryName: product.categories?.name,
        categorySlug: product.categories?.slug,
        stock: product.stock,
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length,
        is_featured: product.is_featured
    };
}

/**
 * Merge recommendations without duplicates
 */
function mergeRecommendations(existing, newItems) {
    const existingIds = new Set(existing.map(p => p.id));
    const unique = newItems.filter(p => !existingIds.has(p.id));
    return [...existing, ...unique];
}

const aiRecommendations = {
    getRecommendations,
    getFrequentlyBoughtTogether,
    getRecommendationReason
};

export default aiRecommendations;
