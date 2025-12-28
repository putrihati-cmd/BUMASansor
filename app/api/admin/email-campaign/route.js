/**
 * Email Campaign API
 * Create and send email marketing campaigns
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';

import { requireAuth } from '@/lib/auth';

import { sendEmail } from '@/lib/email';


/**
 * POST /api/admin/email-campaign
 * Create and send email campaign
 */
export const POST = requireAuth(async function POST(request, context) {
    try {
        // Check admin permission
        if (context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        const { subject, content, target, productId, voucherCode } = await request.json();

        if (!subject || !content || !target) {
            return NextResponse.json(
                { error: 'subject, content, and target are required' },
                { status: 400 }
            );
        }

        // Get target subscribers
        let recipients = [];

        switch (target) {
            case 'all':
                // All active newsletter subscribers
                const allSubscribers = await prisma.newsletter_subscribers.findMany({
                    where: { status: 'ACTIVE' },
                    select: { email: true, name: true }
                });
                recipients = allSubscribers;
                break;

            case 'customers':
                // All customers with verified email
                const customers = await prisma.users.findMany({
                    where: {
                        emailVerifiedAt: { not: null },
                        status: 'ACTIVE'
                    },
                    select: { email: true, name: true }
                });
                recipients = customers;
                break;

            case 'non-buyers':
                // Users who never made a purchase
                const nonBuyers = await prisma.users.findMany({
                    where: {
                        emailVerifiedAt: { not: null },
                        status: 'ACTIVE',
                        orders: { none: {} }
                    },
                    select: { email: true, name: true }
                });
                recipients = nonBuyers;
                break;

            case 'repeat-customers':
                // Users with more than 1 order
                const repeatCustomers = await prisma.users.findMany({
                    where: {
                        emailVerifiedAt: { not: null },
                        status: 'ACTIVE'
                    },
                    select: {
                        email: true,
                        name: true,
                        _count: {
                            select: { orders: true }
                        }
                    }
                });
                recipients = repeatCustomers.filter(u => u._count.orders > 1);
                break;

            default:
                return NextResponse.json(
                    { error: 'Invalid target type' },
                    { status: 400 }
                );
        }

        if (recipients.length === 0) {
            return NextResponse.json(
                { error: 'No recipients found for this target' },
                { status: 400 }
            );
        }

        // Create campaign record
        const campaign = await prisma.email_campaigns.create({
            data: {
                subject,
                content,
                target,
                recipientCount: recipients.length,
                status: 'SENDING',
                productId,
                voucherCode,
                sentBy: context.user.id
            }
        });

        // Send emails in background (don't wait)
        sendEmailsInBackground(campaign.id, recipients, subject, content, productId, voucherCode);

        return NextResponse.json({
            success: true,
            campaign: {
                id: campaign.id,
                recipientCount: recipients.length,
                status: 'SENDING'
            }
        });

    } catch (error) {
        console.error('[Email Campaign] Error:', error);
        return NextResponse.json(
            { error: 'Failed to create campaign', details: error.message },
            { status: 500 }
        );
    }
});

/**
 * Send emails in background
 */
async function sendEmailsInBackground(campaignId, recipients, subject, content, productId, voucherCode) {
    let successCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
        try {
            // Personalize content
            let personalizedContent = content
                .replace('{name}', recipient.name || 'Pelanggan')
                .replace('{email}', recipient.email);

            if (voucherCode) {
                personalizedContent = personalizedContent.replace('{voucher}', voucherCode);
            }

            // Send email
            await sendEmail({
                to: recipient.email,
                subject: subject,
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <style>
                            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                            .header { background: #10b981; color: white; padding: 20px; text-align: center; }
                            .content { padding: 20px; background: #f9fafb; }
                            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
                            .button { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <div class="header">
                                <h1>Infiatin Store</h1>
                            </div>
                            <div class="content">
                                ${personalizedContent}
                            </div>
                            <div class="footer">
                                <p>&copy; 2025 Infiatin Store. All rights reserved.</p>
                                <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/unsubscribe">Unsubscribe</a></p>
                            </div>
                        </div>
                    </body>
                    </html>
                `
            });

            successCount++;

        } catch (error) {
            console.error(`Failed to send to ${recipient.email}:`, error);
            failCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update campaign status
    await prisma.email_campaigns.update({
        where: { id: campaignId },
        data: {
            status: 'COMPLETED',
            sentCount: successCount,
            failedCount: failCount,
            sentAt: new Date()
        }
    });

    console.log(`Campaign ${campaignId} completed: ${successCount} sent, ${failCount} failed`);
}

/**
 * GET /api/admin/email-campaign
 * Get all email campaigns
 */
export const GET = requireAuth(async function GET(request, context) {
    try {
        // Check admin permission
        if (context.user.role !== 'ADMIN' && context.user.role !== 'SUPER_ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 403 }
            );
        }

        const campaigns = await prisma.email_campaigns.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            include: {
                sentByUser: {
                    select: { name: true, email: true }
                }
            }
        });

        return NextResponse.json({
            campaigns: campaigns.map(c => ({
                id: c.id,
                subject: c.subject,
                target: c.target,
                recipientCount: c.recipientCount,
                sentCount: c.sentCount,
                failedCount: c.failedCount,
                status: c.status,
                sentBy: c.sentByUser,
                createdAt: c.createdAt,
                sentAt: c.sentAt
            }))
        });

    } catch (error) {
        console.error('[Email Campaign List] Error:', error);
        return NextResponse.json(
            { error: 'Failed to get campaigns', details: error.message },
            { status: 500 }
        );
    }
});

