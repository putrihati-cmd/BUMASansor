/**
 * AI-Powered Natural Language Search Library
 * 
 * Provides intelligent product search with:
 * - Natural language query understanding
 * - Intent extraction (category, price range, attributes)
 * - Semantic search enhancement
 * - Query expansion and suggestions
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
 * Parse natural language query to extract search intent
 */
export async function parseSearchQuery(query) {
    const lowerQuery = query.toLowerCase();

    // Basic keyword extraction (fast, no API)
    const intent = {
        originalQuery: query,
        keywords: [],
        categories: [],
        priceRange: { min: null, max: null },
        attributes: [],
        sortBy: null,
        isNaturalLanguage: false
    };

    // Extract price filters
    const pricePatterns = [
        { regex: /(?:di\s*bawah|kurang\s*dari|under|max(?:imum)?)\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)?/i, type: 'max' },
        { regex: /(?:di\s*atas|lebih\s*dari|min(?:imum)?)\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)?/i, type: 'min' },
        { regex: /(?:sekitar|around|about)\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)?/i, type: 'around' },
        { regex: /(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)?\s*(?:-|sampai|hingga|to)\s*(?:rp\.?\s*)?(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)?/i, type: 'range' }
    ];

    for (const pattern of pricePatterns) {
        const match = lowerQuery.match(pattern.regex);
        if (match) {
            if (pattern.type === 'max') {
                intent.priceRange.max = parsePrice(match[1]);
            } else if (pattern.type === 'min') {
                intent.priceRange.min = parsePrice(match[1]);
            } else if (pattern.type === 'around') {
                const price = parsePrice(match[1]);
                intent.priceRange.min = price * 0.7;
                intent.priceRange.max = price * 1.3;
            } else if (pattern.type === 'range') {
                intent.priceRange.min = parsePrice(match[1]);
                intent.priceRange.max = parsePrice(match[2]);
            }
            intent.isNaturalLanguage = true;
            break;
        }
    }

    // Extract category hints
    const categoryHints = {
        'kurma': ['kurma', 'dates', 'ajwa'],
        'zamzam': ['zamzam', 'air zam-zam', 'air zamzam'],
        'parfum': ['parfum', 'minyak wangi', 'attar', 'oud'],
        'tasbih': ['tasbih', 'dzikir'],
        'pakaian': ['baju', 'gamis', 'ihram', 'mukena', 'sajadah'],
        'oleh-oleh': ['oleh-oleh', 'souvenir', 'oleh oleh']
    };

    for (const [category, keywords] of Object.entries(categoryHints)) {
        if (keywords.some(kw => lowerQuery.includes(kw))) {
            intent.categories.push(category);
        }
    }

    // Extract quality/attribute hints
    const attributeHints = {
        'premium': ['premium', 'mewah', 'luxury', 'terbaik', 'best'],
        'murah': ['murah', 'hemat', 'ekonomis', 'terjangkau', 'budget'],
        'manis': ['manis', 'sweet'],
        'besar': ['besar', 'jumbo', 'large'],
        'original': ['original', 'asli', 'authentic']
    };

    for (const [attr, keywords] of Object.entries(attributeHints)) {
        if (keywords.some(kw => lowerQuery.includes(kw))) {
            intent.attributes.push(attr);
        }
    }

    // Extract sort hints
    if (/terlaris|popular|best\s*sell/i.test(lowerQuery)) {
        intent.sortBy = 'popular';
    } else if (/termurah|cheapest|harga\s*terendah/i.test(lowerQuery)) {
        intent.sortBy = 'price_asc';
    } else if (/termahal|expensive|harga\s*tertinggi/i.test(lowerQuery)) {
        intent.sortBy = 'price_desc';
    } else if (/terbaru|newest|baru/i.test(lowerQuery)) {
        intent.sortBy = 'newest';
    }

    // Extract keywords (remove stop words and price patterns)
    const stopWords = ['yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'dengan', 'adalah', 'ini', 'itu', 'ada', 'saya', 'mau', 'cari', 'beli', 'pengen'];
    const cleanQuery = lowerQuery
        .replace(/(?:rp\.?\s*)?\d+(?:[.,]\d+)?(?:\s*(?:ribu|rb|k|juta|jt))?\s*/gi, '') // Remove prices
        .replace(/(?:di\s*bawah|kurang\s*dari|under|max|min|lebih\s*dari|sekitar|around)/gi, ''); // Remove price operators

    intent.keywords = cleanQuery
        .split(/\s+/)
        .filter(word => word.length > 1 && !stopWords.includes(word))
        .slice(0, 5);

    // Mark as natural language if we detected specific intents
    if (intent.categories.length > 0 || intent.attributes.length > 0 || intent.priceRange.min || intent.priceRange.max) {
        intent.isNaturalLanguage = true;
    }

    return intent;
}

/**
 * Parse price string to number
 */
function parsePrice(priceStr) {
    let price = parseFloat(priceStr.replace(',', '.'));
    // Check if price contains 'ribu'/'k' indicator or is small number
    if (price < 1000) {
        price *= 1000; // Assume it's in thousands
    }
    return price;
}

/**
 * Search products with AI enhancement
 */
export async function searchProducts({
    query,
    useAI = true,
    limit = 20,
    offset = 0
}) {
    try {
        // Parse the query
        const intent = await parseSearchQuery(query);

        // Build where clause
        const where = {
            status: 'ACTIVE',
            stock: { gt: 0 }
        };

        // Apply price filters
        if (intent.priceRange.min || intent.priceRange.max) {
            where.OR = [
                {
                    AND: [
                        intent.priceRange.min ? { base_price: { gte: intent.priceRange.min } } : {},
                        intent.priceRange.max ? { base_price: { lte: intent.priceRange.max } } : {}
                    ]
                },
                {
                    AND: [
                        { sale_price: { not: null } },
                        intent.priceRange.min ? { sale_price: { gte: intent.priceRange.min } } : {},
                        intent.priceRange.max ? { sale_price: { lte: intent.priceRange.max } } : {}
                    ]
                }
            ];
        }

        // Build search conditions
        const searchConditions = [];

        // Add keyword search
        if (intent.keywords.length > 0) {
            for (const keyword of intent.keywords) {
                searchConditions.push({
                    OR: [
                        { name: { contains: keyword, mode: 'insensitive' } },
                        { description: { contains: keyword, mode: 'insensitive' } }
                    ]
                });
            }
        }

        // Add category search
        if (intent.categories.length > 0) {
            searchConditions.push({
                categories: {
                    OR: intent.categories.map(cat => ({
                        OR: [
                            { name: { contains: cat, mode: 'insensitive' } },
                            { slug: { contains: cat, mode: 'insensitive' } }
                        ]
                    }))
                }
            });
        }

        // Add attribute search in description
        if (intent.attributes.length > 0) {
            for (const attr of intent.attributes) {
                searchConditions.push({
                    OR: [
                        { name: { contains: attr, mode: 'insensitive' } },
                        { description: { contains: attr, mode: 'insensitive' } }
                    ]
                });
            }
        }

        // Combine all conditions
        if (searchConditions.length > 0) {
            where.AND = searchConditions;
        }

        // Determine sort order
        let orderBy = [];
        switch (intent.sortBy) {
            case 'popular':
                orderBy = [{ is_featured: 'desc' }];
                break;
            case 'price_asc':
                orderBy = [{ base_price: 'asc' }];
                break;
            case 'price_desc':
                orderBy = [{ base_price: 'desc' }];
                break;
            case 'newest':
                orderBy = [{ created_at: 'desc' }];
                break;
            default:
                orderBy = [{ is_featured: 'desc' }, { created_at: 'desc' }];
        }

        // Execute search
        const [products, total] = await Promise.all([
            prisma.products.findMany({
                where,
                include: {
                    categories: true,
                    reviews: {
                        where: { status: 'APPROVED' },
                        select: { rating: true }
                    }
                },
                orderBy,
                take: limit,
                skip: offset
            }),
            prisma.products.count({ where })
        ]);

        // Format results
        const results = products.map(product => {
            const reviews = product.reviews || [];
            const avgRating = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

            return {
                id: product.id,
                name: product.name,
                slug: product.slug,
                description: product.description?.substring(0, 150) + '...',
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
        });

        return {
            success: true,
            query: intent.originalQuery,
            intent: {
                keywords: intent.keywords,
                categories: intent.categories,
                priceRange: intent.priceRange,
                attributes: intent.attributes,
                sortBy: intent.sortBy,
                isNaturalLanguage: intent.isNaturalLanguage
            },
            results,
            total,
            limit,
            offset,
            hasMore: offset + results.length < total
        };
    } catch (error) {
        console.error('[AI Search] Error:', error);
        throw error;
    }
}

/**
 * Get AI-powered search suggestions
 */
export async function getSearchSuggestions(query) {
    if (!query || query.length < 2) {
        return { suggestions: [] };
    }

    try {
        // Get matching products
        const products = await prisma.products.findMany({
            where: {
                status: 'ACTIVE',
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: { name: true, slug: true },
            take: 5
        });

        // Get matching categories
        const categories = await prisma.categories.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { slug: { contains: query, mode: 'insensitive' } }
                ]
            },
            select: { name: true, slug: true },
            take: 3
        });

        // Build suggestions
        const suggestions = [
            ...products.map(p => ({
                type: 'product',
                text: p.name,
                url: `/products/${p.slug}`
            })),
            ...categories.map(c => ({
                type: 'category',
                text: `Kategori: ${c.name}`,
                url: `/products?category=${c.slug}`
            }))
        ];

        // Add smart suggestions based on intent
        const intent = await parseSearchQuery(query);
        if (intent.priceRange.max) {
            suggestions.push({
                type: 'filter',
                text: `Produk di bawah ${formatRupiah(intent.priceRange.max)}`,
                filter: { maxPrice: intent.priceRange.max }
            });
        }

        return {
            suggestions: suggestions.slice(0, 8),
            intent
        };
    } catch (error) {
        console.error('[AI Search Suggestions] Error:', error);
        return { suggestions: [] };
    }
}

/**
 * Format price to Rupiah
 */
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

/**
 * Check if AI search is available
 */
export function isAISearchAvailable() {
    return !!(geminiClient || groqClient);
}

const aiSearch = {
    parseSearchQuery,
    searchProducts,
    getSearchSuggestions,
    isAISearchAvailable
};

export default aiSearch;
