/**
 * AI Order Assistant Library
 * 
 * Provides AI-powered assistance for order-related queries:
 * - Order status summarization in natural language
 * - Delivery time estimation
 * - Problem detection and resolution suggestions
 * - Follow-up message generation
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
 * Order status labels in Indonesian
 */
const STATUS_LABELS = {
    'DRAFT': 'Draft',
    'PENDING_PAYMENT': 'Menunggu Pembayaran',
    'PAID': 'Sudah Dibayar',
    'PROCESSING': 'Sedang Diproses',
    'SHIPPED': 'Dalam Pengiriman',
    'COMPLETED': 'Selesai',
    'CANCELLED': 'Dibatalkan',
    'FAILED': 'Gagal'
};

/**
 * Get order summary for AI response
 */
export async function getOrderSummary(orderId, userId = null) {
    try {
        const whereClause = { id: orderId };
        if (userId) {
            whereClause.userId = userId;
        }

        const order = await prisma.orders.findFirst({
            where: whereClause,
            include: {
                items: {
                    include: { product: true }
                },
                payment: true,
                shipment: true,
                address: true
            }
        });

        if (!order) {
            return {
                success: false,
                message: 'Pesanan tidak ditemukan'
            };
        }

        // Build summary
        const summary = {
            orderNumber: order.orderNumber,
            status: order.status,
            statusLabel: STATUS_LABELS[order.status] || order.status,
            createdAt: order.createdAt,
            total: Number(order.total),
            itemCount: order.items.length,
            items: order.items.map(item => ({
                name: item.productName,
                quantity: item.quantity,
                price: Number(item.priceAtPurchase)
            })),
            payment: order.payment ? {
                method: order.paymentMethod,
                status: order.payment.status,
                paidAt: order.payment.paidAt
            } : null,
            shipping: order.shipment ? {
                courier: order.shipment.courier,
                service: order.shipment.serviceType,
                trackingNumber: order.shipment.trackingNumber,
                status: order.shipment.status,
                estimatedDays: order.shipment.estimatedDays,
                shippedAt: order.shipment.shippedAt,
                deliveredAt: order.shipment.deliveredAt
            } : null,
            destination: order.address ? {
                city: order.address.city,
                province: order.address.province
            } : null
        };

        // Generate AI insights
        const insights = await generateOrderInsights(summary);

        return {
            success: true,
            summary,
            insights
        };
    } catch (error) {
        console.error('[Order Assistant] Error:', error);
        return {
            success: false,
            message: 'Gagal mengambil informasi pesanan'
        };
    }
}

/**
 * Generate AI insights about an order
 */
async function generateOrderInsights(summary) {
    const insights = {
        statusMessage: '',
        estimatedDelivery: null,
        nextSteps: [],
        alerts: []
    };

    // Status-based insights
    switch (summary.status) {
        case 'PENDING_PAYMENT':
            insights.statusMessage = `Pesanan Anda menunggu pembayaran. Silakan selesaikan pembayaran segera.`;
            insights.nextSteps = ['Lakukan pembayaran sesuai metode yang dipilih', 'Upload bukti pembayaran jika perlu'];

            // Check payment expiry
            if (summary.payment?.expiresAt && new Date(summary.payment.expiresAt) < new Date()) {
                insights.alerts.push('⚠️ Batas waktu pembayaran sudah lewat');
            }
            break;

        case 'PAID':
            insights.statusMessage = `Pembayaran diterima! Pesanan sedang menunggu diproses oleh tim kami.`;
            insights.nextSteps = ['Tunggu konfirmasi proses dari toko', 'Anda akan menerima notifikasi saat pesanan dikirim'];
            break;

        case 'PROCESSING':
            insights.statusMessage = `Pesanan Anda sedang dikemas dan dipersiapkan untuk pengiriman.`;
            insights.nextSteps = ['Tunggu nomor resi pengiriman', 'Pastikan alamat pengiriman sudah benar'];
            break;

        case 'SHIPPED':
            insights.statusMessage = `Pesanan dalam perjalanan!`;
            if (summary.shipping?.trackingNumber) {
                insights.statusMessage += ` Resi: ${summary.shipping.trackingNumber}`;
            }
            insights.nextSteps = ['Lacak pengiriman dengan nomor resi', 'Siapkan untuk menerima paket'];

            // Estimate delivery
            if (summary.shipping?.shippedAt && summary.shipping?.estimatedDays) {
                const shippedDate = new Date(summary.shipping.shippedAt);
                const estimatedDate = new Date(shippedDate);
                estimatedDate.setDate(estimatedDate.getDate() + summary.shipping.estimatedDays);
                insights.estimatedDelivery = estimatedDate.toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                });
            }
            break;

        case 'COMPLETED':
            insights.statusMessage = `Pesanan telah selesai. Terima kasih telah berbelanja!`;
            insights.nextSteps = ['Berikan ulasan untuk produk yang dibeli', 'Klaim poin reward Anda'];
            break;

        case 'CANCELLED':
            insights.statusMessage = `Pesanan ini dibatalkan.`;
            insights.nextSteps = ['Hubungi customer service jika ada pertanyaan', 'Buat pesanan baru jika diperlukan'];
            break;
    }

    // Use AI to generate personalized message if available
    try {
        const aiMessage = await generateAIOrderMessage(summary);
        if (aiMessage) {
            insights.aiMessage = aiMessage;
        }
    } catch (error) {
        console.error('[Order Assistant AI] Error:', error);
    }

    return insights;
}

/**
 * Generate AI-powered order status message
 */
async function generateAIOrderMessage(summary) {
    const prompt = `Kamu adalah asisten customer service toko online Infiatin Store. 
Berikan pesan singkat (2-3 kalimat) yang ramah dan informatif tentang pesanan ini:

Nomor Pesanan: ${summary.orderNumber}
Status: ${summary.statusLabel}
Total: Rp ${summary.total.toLocaleString('id-ID')}
Jumlah Item: ${summary.itemCount}
${summary.shipping?.trackingNumber ? `Resi: ${summary.shipping.trackingNumber}` : ''}
${summary.shipping?.courier ? `Kurir: ${summary.shipping.courier}` : ''}
${summary.destination ? `Tujuan: ${summary.destination.city}, ${summary.destination.province}` : ''}

Instruksi: Buat pesan yang personal dan helpful. Jangan ulangi semua data, fokus pada informasi paling penting.`;

    try {
        if (geminiClient) {
            const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            return result.response.text().trim();
        }

        if (groqClient) {
            const completion = await groqClient.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                max_tokens: 150
            });
            return completion.choices[0]?.message?.content?.trim() || '';
        }
    } catch (error) {
        console.error('[AI Order Message] Error:', error);
    }

    return null;
}

/**
 * Answer order-related questions
 */
export async function answerOrderQuestion(orderId, question, userId = null) {
    try {
        const orderData = await getOrderSummary(orderId, userId);

        if (!orderData.success) {
            return {
                success: false,
                answer: 'Maaf, pesanan tidak ditemukan atau Anda tidak memiliki akses ke pesanan ini.'
            };
        }

        const summary = orderData.summary;
        const lowerQuestion = question.toLowerCase();

        // Quick answers without AI
        if (/kapan\s*(sampai|sampainya|tiba|datang)/i.test(lowerQuestion)) {
            if (summary.status === 'SHIPPED' && orderData.insights.estimatedDelivery) {
                return {
                    success: true,
                    answer: `Berdasarkan estimasi, pesanan Anda diperkirakan tiba sekitar ${orderData.insights.estimatedDelivery}. 📦`
                };
            } else if (summary.status === 'PROCESSING') {
                return {
                    success: true,
                    answer: 'Pesanan sedang diproses. Setelah dikirim, Anda akan mendapat nomor resi untuk pelacakan.'
                };
            } else if (summary.status === 'PENDING_PAYMENT') {
                return {
                    success: true,
                    answer: 'Pesanan menunggu pembayaran. Segera selesaikan pembayaran agar pesanan bisa diproses.'
                };
            }
        }

        if (/resi|lacak|tracking/i.test(lowerQuestion)) {
            if (summary.shipping?.trackingNumber) {
                return {
                    success: true,
                    answer: `Nomor resi pengiriman: ${summary.shipping.trackingNumber} (${summary.shipping.courier}). Anda bisa lacak di website kurir.`
                };
            }
            return {
                success: true,
                answer: 'Nomor resi belum tersedia. Anda akan mendapat notifikasi saat pesanan dikirim.'
            };
        }

        if (/status|dimana/i.test(lowerQuestion)) {
            return {
                success: true,
                answer: orderData.insights.statusMessage
            };
        }

        // Use AI for complex questions
        return await generateAIAnswer(summary, question, orderData.insights);
    } catch (error) {
        console.error('[Order Assistant Answer] Error:', error);
        return {
            success: false,
            answer: 'Maaf, terjadi kesalahan. Silakan coba lagi atau hubungi customer service.'
        };
    }
}

/**
 * Generate AI answer for complex questions
 */
async function generateAIAnswer(summary, question, insights) {
    const prompt = `Kamu adalah asisten AI toko Infiatin Store. Jawab pertanyaan customer tentang pesanan berikut:

INFORMASI PESANAN:
- Nomor: ${summary.orderNumber}
- Status: ${summary.statusLabel}
- Total: Rp ${summary.total.toLocaleString('id-ID')}
- Items: ${summary.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
${summary.shipping?.trackingNumber ? `- Resi: ${summary.shipping.trackingNumber}` : ''}
${summary.shipping?.courier ? `- Kurir: ${summary.shipping.courier}` : ''}
${insights.estimatedDelivery ? `- Estimasi Tiba: ${insights.estimatedDelivery}` : ''}

PERTANYAAN CUSTOMER:
"${question}"

Instruksi: Jawab dengan singkat (2-3 kalimat), ramah, dan informatif. Jika tidak bisa menjawab, sarankan untuk menghubungi customer service.`;

    try {
        if (geminiClient) {
            const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
            const result = await model.generateContent(prompt);
            return {
                success: true,
                answer: result.response.text().trim()
            };
        }

        if (groqClient) {
            const completion = await groqClient.chat.completions.create({
                messages: [{ role: 'user', content: prompt }],
                model: 'llama-3.3-70b-versatile',
                max_tokens: 200
            });
            return {
                success: true,
                answer: completion.choices[0]?.message?.content?.trim() || ''
            };
        }
    } catch (error) {
        console.error('[AI Answer] Error:', error);
    }

    // Fallback
    return {
        success: true,
        answer: insights.statusMessage + ' Untuk pertanyaan lebih lanjut, silakan hubungi customer service kami.'
    };
}

const exports = {
    getOrderSummary,
    answerOrderQuestion
};


export default exports;
