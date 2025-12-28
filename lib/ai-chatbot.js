/**
 * AI Chatbot Library for Infiatin Store
 * 
 * Provides AI-powered customer service with:
 * - Context awareness (products, orders, FAQ)
 * - Multi-provider fallback (Gemini/Groq/HuggingFace)
 * - Conversation history management
 * - Intent classification
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import { HfInference } from '@huggingface/inference';
import prisma from './prisma';

// Initialize AI clients
const geminiClient = process.env.GEMINI_API_KEY
    ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    : null;

const groqClient = process.env.GROQ_API_KEY
    ? new Groq({ apiKey: process.env.GROQ_API_KEY })
    : null;

const hfClient = process.env.HUGGINGFACE_API_KEY
    ? new HfInference(process.env.HUGGINGFACE_API_KEY)
    : null;

// Model configuration
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const HF_MODEL = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.3';

/**
 * System prompt for the chatbot
 */
const SYSTEM_PROMPT = `Kamu adalah "Fia", asisten AI virtual yang ramah dan profesional untuk toko online Infiatin Store - toko oleh-oleh haji dan umroh terpercaya.

KEPRIBADIAN:
- Ramah, sopan, dan membantu
- Menggunakan bahasa Indonesia yang baik dan santun
- Kadang menggunakan emoji yang relevan (tidak berlebihan)
- Memberikan jawaban yang ringkas tapi informatif

KEMAMPUAN KAMU:
1. Menjawab pertanyaan tentang produk (kurma, air zamzam, oleh-oleh haji/umroh)
2. Membantu cek status pesanan jika customer memberikan nomor pesanan
3. Memberikan informasi tentang pengiriman, pembayaran, dan kebijakan toko
4. Merekomendasikan produk berdasarkan kebutuhan customer

ATURAN PENTING:
- Jika ditanya tentang produk spesifik dan kamu tidak punya datanya, sarankan ke halaman produk
- Jika customer ingin komplain serius atau refund, arahkan ke admin manusia
- Jika ditanya status pesanan tanpa nomor order, minta nomor pesanannya
- Jangan membuat harga atau informasi palsu
- Jika tidak yakin, katakan "Saya akan hubungkan Anda ke admin kami"

INFORMASI TOKO:
- Nama: Infiatin Store
- Spesialisasi: Oleh-oleh haji dan umroh berkualitas
- Pengiriman: Seluruh Indonesia via JNE, J&T, SiCepat
- Pembayaran: Transfer Bank, QRIS, COD (area tertentu)
- Jam operasional: Senin-Sabtu 08:00-17:00 WIB`;

/**
 * Intent types for classification
 */
export const INTENT_TYPES = {
    PRODUCT_INQUIRY: 'product_inquiry',
    ORDER_STATUS: 'order_status',
    SHIPPING_INQUIRY: 'shipping_inquiry',
    PAYMENT_INQUIRY: 'payment_inquiry',
    COMPLAINT: 'complaint',
    RECOMMENDATION: 'recommendation',
    GREETING: 'greeting',
    HUMAN_REQUEST: 'human_request',
    GENERAL: 'general'
};

/**
 * Classify user intent from message
 */
export async function classifyIntent(message) {
    const lowerMessage = message.toLowerCase();

    // Simple keyword-based classification (fast, no API call)
    if (/^(hai|halo|hi|hello|selamat|assalam)/i.test(lowerMessage)) {
        return INTENT_TYPES.GREETING;
    }

    if (/(admin|manusia|operator|cs |customer service|hubungi)/i.test(lowerMessage)) {
        return INTENT_TYPES.HUMAN_REQUEST;
    }

    if (/(status|pesanan|order|tracking|lacak|dimana pesanan|kapan sampai)/i.test(lowerMessage)) {
        return INTENT_TYPES.ORDER_STATUS;
    }

    if (/(komplain|keluhan|rusak|salah kirim|refund|uang kembali|kecewa)/i.test(lowerMessage)) {
        return INTENT_TYPES.COMPLAINT;
    }

    if (/(ongkir|ongkos kirim|pengiriman|berapa lama|estimasi)/i.test(lowerMessage)) {
        return INTENT_TYPES.SHIPPING_INQUIRY;
    }

    if (/(bayar|pembayaran|transfer|cara bayar|metode pembayaran)/i.test(lowerMessage)) {
        return INTENT_TYPES.PAYMENT_INQUIRY;
    }

    if (/(rekomen|saran|bagus|terlaris|populer|best seller)/i.test(lowerMessage)) {
        return INTENT_TYPES.RECOMMENDATION;
    }

    if (/(produk|harga|stok|tersedia|jual|ada gak)/i.test(lowerMessage)) {
        return INTENT_TYPES.PRODUCT_INQUIRY;
    }

    return INTENT_TYPES.GENERAL;
}

/**
 * Get relevant context for the conversation
 */
async function getContext(userId, intent, message) {
    const context = {
        products: [],
        orders: [],
        faq: []
    };

    try {
        // Get user's recent orders if asking about order status
        if (intent === INTENT_TYPES.ORDER_STATUS && userId) {
            // Check if message contains order number
            const orderNumberMatch = message.match(/INF-\d+-[A-Z0-9]+|[A-Z0-9]{8,}/i);

            if (orderNumberMatch) {
                const order = await prisma.orders.findFirst({
                    where: {
                        OR: [
                            { orderNumber: orderNumberMatch[0].toUpperCase() },
                            { id: orderNumberMatch[0] }
                        ]
                    },
                    include: {
                        items: true,
                        shipment: true
                    }
                });

                if (order) {
                    context.orders.push(order);
                }
            } else if (userId) {
                // Get last 3 orders
                const orders = await prisma.orders.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                    include: { shipment: true }
                });
                context.orders = orders;
            }
        }

        // Get popular products for recommendations
        if (intent === INTENT_TYPES.RECOMMENDATION || intent === INTENT_TYPES.PRODUCT_INQUIRY) {
            const products = await prisma.products.findMany({
                where: { status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { category: true }
            });
            context.products = products;
        }
    } catch (error) {
        console.error('[AI Chatbot] Error getting context:', error);
    }

    return context;
}

/**
 * Build the full prompt with context
 */
function buildPrompt(message, context, conversationHistory = []) {
    let contextInfo = '';

    // Add order context
    if (context.orders && context.orders.length > 0) {
        contextInfo += '\n\nINFORMASI PESANAN CUSTOMER:\n';
        context.orders.forEach(order => {
            const statusMap = {
                'PENDING_PAYMENT': 'Menunggu Pembayaran',
                'PAID': 'Sudah Dibayar',
                'PROCESSING': 'Sedang Diproses',
                'SHIPPED': 'Dalam Pengiriman',
                'COMPLETED': 'Selesai',
                'CANCELLED': 'Dibatalkan'
            };
            contextInfo += `- Order #${order.orderNumber}: ${statusMap[order.status] || order.status}`;
            if (order.shipment?.trackingNumber) {
                contextInfo += ` (Resi: ${order.shipment.trackingNumber})`;
            }
            contextInfo += '\n';
        });
    }

    // Add product context
    if (context.products && context.products.length > 0) {
        contextInfo += '\n\nPRODUK TERSEDIA:\n';
        context.products.forEach(product => {
            const price = product.salePrice || product.basePrice;
            contextInfo += `- ${product.name} (${product.category?.name || 'Umum'}): Rp ${Number(price).toLocaleString('id-ID')}\n`;
        });
    }

    // Build conversation history
    let historyPrompt = '';
    if (conversationHistory.length > 0) {
        historyPrompt = '\n\nRIWAYAT PERCAKAPAN TERAKHIR:\n';
        conversationHistory.slice(-5).forEach(msg => {
            const role = msg.isAdmin || msg.isAI ? 'Fia' : 'Customer';
            historyPrompt += `${role}: ${msg.message}\n`;
        });
    }

    return `${SYSTEM_PROMPT}${contextInfo}${historyPrompt}

PESAN CUSTOMER SAAT INI:
"${message}"

INSTRUKSI: Berikan respons yang membantu untuk pesan customer di atas. Jangan ulangi system prompt atau informasi konteks, langsung jawab pertanyaan customer.`;
}

/**
 * Generate response using Gemini
 */
async function generateWithGemini(prompt) {
    if (!geminiClient) throw new Error('GEMINI_NOT_CONFIGURED');

    const model = geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
}

/**
 * Generate response using Groq
 */
async function generateWithGroq(prompt) {
    if (!groqClient) throw new Error('GROQ_NOT_CONFIGURED');

    const completion = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: 512,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
}

/**
 * Generate response using Hugging Face
 */
async function generateWithHuggingFace(prompt) {
    if (!hfClient) throw new Error('HUGGINGFACE_NOT_CONFIGURED');

    const response = await hfClient.textGeneration({
        model: HF_MODEL,
        inputs: prompt,
        parameters: {
            max_new_tokens: 512,
            temperature: 0.7,
            return_full_text: false,
        },
    });

    return response.generated_text?.trim() || '';
}

/**
 * Generate AI response with triple fallback
 */
async function generateAIResponse(prompt) {
    // Try Gemini first
    if (geminiClient) {
        try {
            console.log('[AI Chatbot] Trying Gemini...');
            const response = await generateWithGemini(prompt);
            return { response, provider: 'gemini', model: GEMINI_MODEL };
        } catch (error) {
            console.log('[AI Chatbot] Gemini failed:', error.message);
        }
    }

    // Fallback to Groq
    if (groqClient) {
        try {
            console.log('[AI Chatbot] Trying Groq...');
            const response = await generateWithGroq(prompt);
            return { response, provider: 'groq', model: GROQ_MODEL };
        } catch (error) {
            console.log('[AI Chatbot] Groq failed:', error.message);
        }
    }

    // Final fallback to Hugging Face
    if (hfClient) {
        try {
            console.log('[AI Chatbot] Trying Hugging Face...');
            const response = await generateWithHuggingFace(prompt);
            return { response, provider: 'huggingface', model: HF_MODEL };
        } catch (error) {
            console.log('[AI Chatbot] Hugging Face failed:', error.message);
            throw new Error('All AI providers failed');
        }
    }

    throw new Error('No AI provider configured');
}

/**
 * Get quick response for simple intents (no AI needed)
 */
function getQuickResponse(intent) {
    const responses = {
        [INTENT_TYPES.GREETING]: 'Assalamualaikum! 👋 Saya Fia, asisten virtual Infiatin Store. Ada yang bisa saya bantu hari ini?',
        [INTENT_TYPES.HUMAN_REQUEST]: 'Baik, saya akan hubungkan Anda dengan admin kami. 👨‍💼 Mohon tunggu sebentar, ya. Admin akan segera merespons.',
        [INTENT_TYPES.COMPLAINT]: 'Mohon maaf atas ketidaknyamanannya 🙏 Untuk keluhan dan komplain, saya akan hubungkan Anda langsung dengan admin kami yang bisa membantu menyelesaikan masalah ini. Mohon tunggu sebentar.'
    };

    return responses[intent] || null;
}

/**
 * Check if we should escalate to human
 */
export function shouldEscalateToHuman(intent) {
    return [INTENT_TYPES.HUMAN_REQUEST, INTENT_TYPES.COMPLAINT].includes(intent);
}

/**
 * Main function: Process user message and generate AI response
 */
export async function processMessage({
    message,
    userId = null,
    conversationHistory = [],
    sessionId = null
}) {
    try {
        // Classify intent
        const intent = await classifyIntent(message);
        console.log('[AI Chatbot] Intent:', intent);

        // Check for quick response
        const quickResponse = getQuickResponse(intent);
        if (quickResponse) {
            return {
                message: quickResponse,
                isAI: true,
                intent,
                escalateToHuman: shouldEscalateToHuman(intent),
                provider: 'quick_response'
            };
        }

        // Get context
        const context = await getContext(userId, intent, message);

        // Build prompt
        const prompt = buildPrompt(message, context, conversationHistory);

        // Generate AI response
        const { response, provider, model } = await generateAIResponse(prompt);

        return {
            message: response,
            isAI: true,
            intent,
            escalateToHuman: false,
            provider,
            model,
            context: {
                hasOrders: context.orders.length > 0,
                hasProducts: context.products.length > 0
            }
        };
    } catch (error) {
        console.error('[AI Chatbot] Error:', error);

        // Fallback response
        return {
            message: 'Mohon maaf, saya sedang mengalami kendala teknis. 🙏 Silakan hubungi admin kami untuk bantuan lebih lanjut.',
            isAI: true,
            intent: INTENT_TYPES.GENERAL,
            escalateToHuman: true,
            error: error.message
        };
    }
}

/**
 * Check if AI is available
 */
export function isAIAvailable() {
    return !!(geminiClient || groqClient || hfClient);
}

const exports = {
    processMessage,
    classifyIntent,
    shouldEscalateToHuman,
    isAIAvailable,
    INTENT_TYPES
};


export default exports;
