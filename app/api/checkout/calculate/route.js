/**
 * API: Checkout with Voucher Stacking
 */

import { NextResponse } from 'next/server';
import { voucherEngine } from '@/lib/voucherStackingEngine';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { cartItems, voucherCodes, userId, shippingCost } = await request.json();

        const cart = {
            items: cartItems,
            subtotal: cartItems.reduce((sum, item) => sum + item.subtotal, 0),
            shippingCost: shippingCost || 15000,
            userId
        };

        const result = await voucherEngine.calculateDiscount(cart, voucherCodes || []);

        return NextResponse.json({
            success: true,
            calculation: result,
            summary: {
                originalTotal: cart.subtotal + cart.shippingCost,
                totalDiscount: result.totalDiscount,
                finalTotal: result.finalTotal,
                cashbackEarned: result.cashbackAmount,
                savings: result.totalDiscount + result.cashbackAmount
            }
        });

    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}

