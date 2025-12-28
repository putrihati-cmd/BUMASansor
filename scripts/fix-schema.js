const fs = require('fs');

// Read schema
let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Field mappings: snake_case -> camelCase
const fieldMappings = {
    'user_id': 'userId',
    'product_id': 'productId',
    'category_id': 'categoryId',
    'order_id': 'orderId',
    'address_id': 'addressId',
    'voucher_id': 'voucherId',
    'payment_id': 'paymentId',
    'affiliate_id': 'affiliateId',
    'bundle_id': 'bundleId',
    'flash_sale_id': 'flashSaleId',
    'referred_user_id': 'referredUserId',
    'flash_sale_product_id': 'flashSaleProductId',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt',
    'paid_at': 'paidAt',
    'processed_at': 'processedAt',
    'referred_at': 'referredAt',
    'email_verified_at': 'emailVerifiedAt',
    'verification_token_expires': 'verificationTokenExpires',
    'reset_password_expires': 'resetPasswordExpires',
    'valid_from': 'validFrom',
    'valid_until': 'validUntil',
    'start_time': 'startTime',
    'end_time': 'endTime',
    'shipped_at': 'shippedAt',
    'delivered_at': 'deliveredAt',
    'cancelled_at': 'cancelledAt',
    'resolved_at': 'resolvedAt',
    'read_at': 'readAt',
    'sent_at': 'sentAt',
    'issued_at': 'issuedAt',
    'base_price': 'basePrice',
    'sale_price': 'salePrice',
    'order_amount': 'orderAmount',
    'commission_rate': 'commissionRate',
    'commission_amount': 'commissionAmount',
    'total_earnings': 'totalEarnings',
    'available_balance': 'availableBalance',
    'total_referrals': 'totalReferrals',
    'total_amount': 'totalAmount',
    'subtotal_amount': 'subtotalAmount',
    'discount_amount': 'discountAmount',
    'shipping_cost': 'shippingCost',
    'tax_amount': 'taxAmount',
    'final_amount': 'finalAmount',
    'refund_amount': 'refundAmount',
    'min_purchase': 'minPurchase',
    'max_discount': 'maxDiscount',
    'usage_limit': 'usageLimit',
    'used_count': 'usedCount',
    'stock_limit': 'stockLimit',
    'sold_count': 'soldCount',
    'max_per_user': 'maxPerUser',
    'is_default': 'isDefault',
    'is_featured': 'isFeatured',
    'is_admin': 'isAdmin',
    'is_helpful': 'isHelpful',
    'recipient_name': 'recipientName',
    'full_address': 'fullAddress',
    'postal_code': 'postalCode',
    'bank_account': 'bankAccount',
    'proof_url': 'proofUrl',
    'referral_code': 'referralCode',
    'password_hash': 'passwordHash',
    'avatar_url': 'avatarUrl',
    'google_id': 'googleId',
    'verification_token': 'verificationToken',
    'reset_password_token': 'resetPasswordToken',
    'image_url': 'imageUrl',
    'seo_metadata': 'seoMetadata',
    'tracking_number': 'trackingNumber',
    'shipping_address': 'shippingAddress',
    'customer_note': 'customerNote',
    'admin_notes': 'adminNotes',
    'gateway_transaction_id': 'gatewayTransactionId',
    'gateway_response': 'gatewayResponse',
    'payment_method': 'paymentMethod',
    'refund_type': 'refundType',
    'rejected_reason': 'rejectedReason',
    'resolved_by': 'resolvedBy',
    'processed_by': 'processedBy',
    'ip_address': 'ipAddress',
    'user_agent': 'userAgent',
    'entity_type': 'entityType',
    'entity_id': 'entityId',
    'invoice_number': 'invoiceNumber',
    'tax_id': 'taxId',
    'buyer_name': 'buyerName',
    'buyer_address': 'buyerAddress',
    'invoice_data': 'invoiceData',
    'pdf_url': 'pdfUrl',
    'item_count': 'itemCount',
    'unit_price': 'unitPrice',
    'variant_info': 'variantInfo',
    'risk_score': 'riskScore',
    'risk_factors': 'riskFactors',
    'event_type': 'eventType',
    'event_data': 'eventData',
    'last_prefix': 'lastPrefix',
    'last_number': 'lastNumber',
};

// Process line by line
const lines = schema.split('\n');
const newLines = [];

for (let line of lines) {
    // Skip if already has @map or is a relation line
    if (line.includes('@map(') || line.includes('@relation(')) {
        newLines.push(line);
        continue;
    }

    // Check each field mapping
    for (const [snakeCase, camelCase] of Object.entries(fieldMappings)) {
        // Pattern: starts with whitespace, then field name, then whitespace, then type
        const regex = new RegExp(`^(\\s+)(${snakeCase})(\\s+)(\\S+)(.*)$`);
        const match = line.match(regex);

        if (match) {
            const [, indent, , space, type, rest] = match;
            // Don't map relation fields (type starts with capital or is array)
            if (type[0] === type[0].toUpperCase() || type.includes('[')) {
                continue;
            }
            // Add @map directive
            line = `${indent}${camelCase}${space}${type}${rest} @map("${snakeCase}")`;
            break;
        }
    }

    newLines.push(line);
}

// Write updated schema
fs.writeFileSync('prisma/schema.prisma', newLines.join('\n'));
console.log('Schema updated with @map() directives!');
console.log('Total lines processed:', lines.length);
