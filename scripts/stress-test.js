const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: '.env.local' }); // Try loading .env.local usually used in Next.js
require('dotenv').config(); // Fallback to .env

const fetch = require('node-fetch');

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function getToken() {
    console.log('🔑 Logging in as demo@infiatin.store...');
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'demo@infiatin.store',
            password: 'password123'
        })
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Login failed: ${res.status} ${err}`);
    }

    const data = await res.json();
    if (!data.token) throw new Error('API did not return token in JSON body');
    return data.token;
}

async function runSimulation() {
    try {
        console.log('🚀 INITIALIZING STRESS TEST (V2)...');

        // 1. Get Product ID Kurma Ajwa
        const product = await prisma.product.findFirst({
            where: { slug: { contains: 'kurma-ajwa' } } // Use contains to be safe if slug changed slightly
        });

        if (!product) throw new Error('Product Kurma Ajwa not found!');
        console.log(`📦 Target Product: ${product.name} (ID: ${product.id})`);

        // 2. Reset Stock to 50
        console.log(`🔄 Resetting Stock to 50...`);
        await prisma.product.update({
            where: { id: product.id },
            data: { stock: 50 }
        });

        // 3. Get Auth Token
        const token = await getToken();
        console.log('🔓 Token Obtained.');

        // 4. Prepare 10 Requests (realistic UMKM load)
        const TOTAL_REQUESTS = 10;
        const requests = [];

        // Ensure user address exists
        const user = await prisma.user.findUnique({
            where: { email: 'customer@infiatin.store' },
            include: { addresses: true }
        });

        let addressId = user.addresses[0]?.id;
        if (!addressId) {
            const newAddr = await prisma.address.create({
                data: {
                    userId: user.id,
                    recipientName: 'Demo User',
                    phone: '08123',
                    fullAddress: 'Jalan Test Lengkap No 1',
                    city: 'Jakarta',
                    district: 'Gambir',
                    province: 'DKI',
                    postalCode: '123'
                }
            });
            addressId = newAddr.id;
        }

        console.log(`⚡ LAUNCHING ${TOTAL_REQUESTS} CONCURRENT REQUESTS...`);
        const startTime = Date.now();

        for (let i = 0; i < TOTAL_REQUESTS; i++) {
            const payload = {
                items: [{ productId: product.id, quantity: 1 }],
                addressId: addressId,
                paymentMethod: 'BANK_TRANSFER',
                shippingMethod: 'JNE',
                courierService: 'REG'
            };

            const reqPromise = fetch(`${BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // Use Bearer Token
                },
                body: JSON.stringify(payload)
            }).then(async res => ({
                status: res.status,
                data: await res.json().catch(() => ({}))
            }));

            requests.push(reqPromise);
        }

        // 5. FIRE!
        const results = await Promise.all(requests);
        const endTime = Date.now();

        // 6. Analysis
        const successCount = results.filter(r => r.status === 201).length;
        const failCount = results.filter(r => r.status !== 201).length;

        console.log('\n📊 --- SIMULATION RESULTS ---');
        console.log(`Time taken: ${(endTime - startTime)}ms`);
        console.log(`Total Requests: ${TOTAL_REQUESTS}`);
        console.log(`✅ Success Orders: ${successCount}`);
        console.log(`❌ Failed Orders: ${failCount}`);

        if (failCount > 0) {
            const sampleFail = results.find(r => r.status !== 201);
            console.log('\n==== SAMPLE ERROR (FULL) ====');
            console.log('Status:', sampleFail?.status);
            console.log('Response:', JSON.stringify(sampleFail?.data, null, 2));
            console.log('=============================\n');
        }

        // 7. Validation
        const finalProduct = await prisma.product.findUnique({
            where: { id: product.id }
        });

        console.log(`\n📦 Initial Stock: 50`);
        console.log(`📦 Final Stock:   ${finalProduct.stock}`);

        if (finalProduct.stock < 0) {
            console.error('\n🚨 CRITICAL FAILURE: STOCK IS NEGATIVE! (Overselling Occurred)');
        } else if (finalProduct.stock === 0 && successCount === 50) {
            console.log('\n🏆 SUCCESS: Perfect Inventory Control!');
            console.log('   Industry-Grade Locking mechanism worked perfectly.');
        } else {
            console.log(`\n⚠️  Anomaly: Check logs.`);
        }

    } catch (e) {
        console.error('Simulation Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

runSimulation();
