/**
 * AI Generate Product Description API
 * POST /api/ai/generate-description
 * 
 * Endpoint untuk generate deskripsi produk menggunakan Google Gemini AI
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { generateProductDescription, isAIConfigured, getAvailableProviders } from '@/lib/gemini';


// Simple in-memory rate limiting
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // max 10 requests per minute

function checkRateLimit(ip) {
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    // Get or create rate limit entry
    let requests = rateLimitMap.get(ip) || [];

    // Filter out old requests
    requests = requests.filter(timestamp => timestamp > windowStart);

    if (requests.length >= MAX_REQUESTS) {
        return false;
    }

    // Add current request
    requests.push(now);
    rateLimitMap.set(ip, requests);

    return true;
}

export async function POST(request) {
    try {
        // Check if AI is configured
        if (!isAIConfigured()) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'AI tidak dikonfigurasi. Silakan hubungi admin setidaknya salah satu API Key (Gemini/Groq).'
                },
                { status: 503 }
            );
        }

        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown';

        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Terlalu banyak request. Coba lagi dalam 1 menit.'
                },
                { status: 429 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { productName, category, additionalInfo } = body;

        // Validate input
        if (!productName || productName.trim().length < 3) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Nama produk harus minimal 3 karakter'
                },
                { status: 400 }
            );
        }

        if (!category || category.trim().length < 2) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Kategori produk wajib diisi'
                },
                { status: 400 }
            );
        }

        // Generate description
        const result = await generateProductDescription({
            productName: productName.trim(),
            category: category.trim(),
            additionalInfo: additionalInfo?.trim() || '',
        });

        return NextResponse.json({
            success: true,
            data: {
                description: result.description,
                provider: result.provider,
                model: result.model,
                generatedAt: new Date().toISOString(),
            }
        });

    } catch (error) {
        console.error('[AI API] Error:', error);

        // Handle specific Gemini errors
        if (error.message?.includes('API key')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'API key tidak valid. Silakan hubungi admin.'
                },
                { status: 401 }
            );
        }

        if (error.message?.includes('quota') || error.message?.includes('rate')) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Kuota AI tercapai. Coba lagi nanti.'
                },
                { status: 429 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Gagal generate deskripsi. Coba lagi.'
            },
            { status: 500 }
        );
    }
}

// GET method for health check
export async function GET() {
    return NextResponse.json({
        service: 'AI Generate Description',
        status: isAIConfigured() ? 'ready' : 'not_configured',
        providers: getAvailableProviders(),
    });
}

