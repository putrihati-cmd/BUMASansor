/**
 * TRACKING SERVICE - Multi-Courier Integration for Indonesia
 * 
 * Supports:
 * - JNE (Jalur Nugraha Ekakurir)
 * - J&T Express
 * - SiCepat
 * - Extensible for more couriers (AnterAja, Ninja Express, etc.)
 * 
 * Features:
 * - Real-time tracking via API
 * - Webhook support for push notifications
 * - Fallback polling mechanism
 * - POD (Proof of Delivery) handling
 */

const axios = require('axios');
const crypto = require('crypto');
const { prisma } = require('./prisma');

// ===================================
// COURIER ADAPTERS
// ===================================

/**
 * Base adapter interface
 * @interface CourierAdapter
 */
class CourierAdapter {
    async track(trackingNumber) {
        throw new Error('track() must be implemented');
    }

    validateWebhook(payload, signature) {
        throw new Error('validateWebhook() must be implemented');
    }

    parseWebhook(payload) {
        throw new Error('parseWebhook() must be implemented');
    }
}

/**
 * JNE Adapter
 */
class JNEAdapter extends CourierAdapter {
    constructor() {
        super();
        this.apiKey = process.env.JNE_API_KEY || '';
        this.baseUrl = 'https://apiv2.jne.co.id:10443';
    }

    async track(trackingNumber) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/tracing/api/list/v1/${trackingNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`
                    }
                }
            );

            if (!response.data.detail) return [];

            return response.data.detail.map(event => ({
                timestamp: new Date(event.date),
                status: this.mapStatus(event.code),
                description: event.desc,
                location: event.city
            }));
        } catch (error) {
            console.error('JNE tracking error:', error.message);
            return [];
        }
    }

    validateWebhook(payload, signature) {
        if (!process.env.JNE_WEBHOOK_SECRET) return true; // Skip validation in dev

        const expected = crypto
            .createHmac('sha256', process.env.JNE_WEBHOOK_SECRET)
            .update(JSON.stringify(payload))
            .digest('hex');

        return signature === expected;
    }

    parseWebhook(payload) {
        return {
            timestamp: new Date(payload.timestamp),
            status: this.mapStatus(payload.status_code),
            description: payload.description,
            location: payload.location
        };
    }

    mapStatus(code) {
        const mapping = {
            'PICKUP': 'PICKED_UP',
            'MANIFESTED': 'IN_TRANSIT',
            'DELIVERED': 'DELIVERED',
            'FAILED': 'FAILED',
            'RETURN': 'RETURNED'
        };
        return mapping[code] || 'IN_TRANSIT';
    }
}

/**
 * J&T Express Adapter
 */
class JNTAdapter extends CourierAdapter {
    constructor() {
        super();
        this.apiKey = process.env.JNT_API_KEY || '';
        this.apiSecret = process.env.JNT_API_SECRET || '';
        this.baseUrl = 'https://api.jet.co.id/jet/api';
    }

    async track(trackingNumber) {
        const timestamp = Date.now();
        const signature = this.generateSignature(trackingNumber, timestamp);

        try {
            const response = await axios.post(
                `${this.baseUrl}/track/v1`,
                {
                    awb_no: trackingNumber
                },
                {
                    headers: {
                        'api_key': this.apiKey,
                        'timestamp': timestamp.toString(),
                        'signature': signature
                    }
                }
            );

            if (!response.data.data || !response.data.data.details) return [];

            return response.data.data.details.map(event => ({
                timestamp: new Date(event.date_time),
                status: this.mapStatus(event.status),
                description: event.description,
                location: event.city
            }));
        } catch (error) {
            console.error('JNT tracking error:', error.message);
            return [];
        }
    }

    validateWebhook(payload, signature) {
        if (!this.apiKey || !this.apiSecret) return true; // Skip in dev

        const expected = this.generateSignature(
            JSON.stringify(payload),
            payload.timestamp
        );
        return signature === expected;
    }

    parseWebhook(payload) {
        return {
            timestamp: new Date(payload.event_time),
            status: this.mapStatus(payload.status),
            description: payload.message,
            location: payload.current_location
        };
    }

    generateSignature(data, timestamp) {
        const message = `${this.apiKey}${data}${timestamp}${this.apiSecret}`;
        return crypto.createHash('md5').update(message).digest('hex');
    }

    mapStatus(status) {
        const mapping = {
            '100': 'PICKED_UP',
            '200': 'IN_TRANSIT',
            '300': 'DELIVERED',
            '400': 'FAILED',
            '500': 'RETURNED'
        };
        return mapping[status] || 'IN_TRANSIT';
    }
}

/**
 * SiCepat Adapter
 */
class SiCepatAdapter extends CourierAdapter {
    constructor() {
        super();
        this.apiKey = process.env.SICEPAT_API_KEY || '';
        this.baseUrl = 'https://api.sicepat.com/customer';
    }

    async track(trackingNumber) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/waybill`,
                {
                    params: { waybill: trackingNumber },
                    headers: { 'api-key': this.apiKey }
                }
            );

            if (!response.data.sicepat || !response.data.sicepat.track_history) return [];

            return response.data.sicepat.track_history.map(event => ({
                timestamp: new Date(event.date_time),
                status: this.mapStatus(event.status),
                description: event.description,
                location: event.city
            }));
        } catch (error) {
            console.error('SiCepat tracking error:', error.message);
            return [];
        }
    }

    validateWebhook(payload, signature) {
        if (!this.apiKey) return true; // Skip in dev

        const expected = crypto
            .createHmac('sha256', this.apiKey)
            .update(JSON.stringify(payload))
            .digest('base64');

        return signature === expected;
    }

    parseWebhook(payload) {
        return {
            timestamp: new Date(payload.timestamp),
            status: this.mapStatus(payload.status),
            description: payload.description,
            location: payload.location
        };
    }

    mapStatus(status) {
        const mapping = {
            'PICKUP': 'PICKED_UP',
            'TRANSIT': 'IN_TRANSIT',
            'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
            'DELIVERED': 'DELIVERED',
            'CANCEL': 'FAILED',
            'RETURN': 'RETURNED'
        };
        return mapping[status] || 'IN_TRANSIT';
    }
}

// ===================================
// TRACKING SERVICE
// ===================================

class TrackingService {
    constructor() {
        this.adapters = {
            jne: new JNEAdapter(),
            jnt: new JNTAdapter(),
            sicepat: new SiCepatAdapter()
        };
    }

    /**
     * Track shipment using appropriate courier adapter
     * 
     * @param {string} courierCode - Courier code (jne, jnt, sicepat)
     * @param {string} trackingNumber - Tracking number
     * @returns {Promise<Array>} Tracking events
     */
    async trackShipment(courierCode, trackingNumber) {
        const adapter = this.adapters[courierCode.toLowerCase()];

        if (!adapter) {
            throw new Error(`Unsupported courier: ${courierCode}`);
        }

        return await adapter.track(trackingNumber);
    }

    /**
     * Update shipment status from tracking API
     * 
     * @param {string} shipmentId - Shipment ID
     */
    async updateShipmentStatus(shipmentId) {
        const shipment = await prisma.shipment.findUnique({
            where: { id: shipmentId },
            include: { order: true }
        });

        if (!shipment || !shipment.trackingNumber) {
            console.log('Shipment not found or no tracking number');
            return;
        }

        // Fetch latest tracking info
        const events = await this.trackShipment(
            shipment.courierCode,
            shipment.trackingNumber
        );

        if (events.length === 0) {
            console.log('No tracking events found');
            return;
        }

        // Sort events by timestamp (newest first)
        events.sort((a, b) => b.timestamp - a.timestamp);
        const latestEvent = events[0];

        // Update shipment in database
        await prisma.shipment.update({
            where: { id: shipmentId },
            data: {
                status: latestEvent.status,
                currentLocation: latestEvent.location,
                trackingHistory: events,
                lastSyncAt: new Date()
            }
        });

        // Update order status if delivered
        if (latestEvent.status === 'DELIVERED') {
            await prisma.shipment.update({
                where: { id: shipmentId },
                data: {
                    actualDelivery: latestEvent.timestamp,
                    receivedAt: latestEvent.timestamp
                }
            });

            // Update order status to COMPLETED
            await prisma.orders.update({
                where: { id: shipment.orderId },
                data: { status: 'COMPLETED' }
            });
        }
    }

    /**
     * Validate webhook signature
     * 
     * @param {string} courierCode - Courier code
     * @param {object} payload - Webhook payload
     * @param {string} signature - Signature from webhook header
     * @returns {boolean} Whether signature is valid
     */
    validateWebhook(courierCode, payload, signature) {
        const adapter = this.adapters[courierCode.toLowerCase()];

        if (!adapter) return false;

        return adapter.validateWebhook(payload, signature);
    }

    /**
     * Parse webhook payload
     * 
     * @param {string} courierCode - Courier code
     * @param {object} payload - Webhook payload
     * @returns {object} Parsed tracking event
     */
    parseWebhook(courierCode, payload) {
        const adapter = this.adapters[courierCode.toLowerCase()];

        if (!adapter) {
            throw new Error(`Unsupported courier: ${courierCode}`);
        }

        return adapter.parseWebhook(payload);
    }

    /**
     * Sync all active shipments (for cron job)
     * 
     * @param {number} [limit=50] - Max shipments to sync
     * @returns {Promise<number>} Number of shipments synced
     */
    async syncAllActiveShipments(limit = 50) {
        const activeShipments = await prisma.shipment.findMany({
            where: {
                status: { in: ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
                trackingNumber: { not: null },
                // Only sync if not synced in last 2 hours
                OR: [
                    { lastSyncAt: null },
                    { lastSyncAt: { lte: new Date(Date.now() - 2 * 60 * 60 * 1000) } }
                ]
            },
            take: limit
        });

        for (const shipment of activeShipments) {
            try {
                await this.updateShipmentStatus(shipment.id);

                // Rate limiting: wait 200ms between requests
                await new Promise(resolve => setTimeout(resolve, 200));

            } catch (error) {
                console.error(`Failed to sync shipment ${shipment.id}:`, error.message);
            }
        }

        return activeShipments.length;
    }

    /**
     * Get stuck shipments (in transit > 7 days)
     * 
     * @returns {Promise<Array>} Stuck shipments
     */
    async getStuckShipments() {
        return await prisma.shipment.findMany({
            where: {
                status: 'IN_TRANSIT',
                // In transit for more than 7 days
                updatedAt: { lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            },
            include: { order: true }
        });
    }
}

const trackingService = new TrackingService();

module.exports = { trackingService, TrackingService };
