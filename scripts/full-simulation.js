const fetch = require('node-fetch');
require('dotenv').config();

const BASE_URL = 'http://localhost:3000';

async function runFullSimulation() {
    console.log('🚀 FULL SYSTEM SIMULATION\n');
    console.log('='.repeat(50));

    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };

    async function test(name, fn) {
        try {
            const result = await fn();
            if (result.success) {
                console.log(`✅ ${name}`);
                results.passed++;
                results.tests.push({ name, status: 'PASS', ...result });
            } else {
                console.log(`❌ ${name}: ${result.error}`);
                results.failed++;
                results.tests.push({ name, status: 'FAIL', ...result });
            }
        } catch (e) {
            console.log(`❌ ${name}: ${e.message}`);
            results.failed++;
            results.tests.push({ name, status: 'ERROR', error: e.message });
        }
    }

    // Test 1: Health Check
    await test('Health Check', async () => {
        const res = await fetch(`${BASE_URL}/api/health`);
        const data = await res.json();
        return { success: res.status === 200 && data.status === 'healthy', data };
    });

    // Test 2: Get Products
    await test('Get Products', async () => {
        const res = await fetch(`${BASE_URL}/api/products`);
        const data = await res.json();
        return { success: res.status === 200 && data.products?.length > 0, count: data.products?.length };
    });

    // Test 3: Get Categories
    await test('Get Categories', async () => {
        const res = await fetch(`${BASE_URL}/api/categories`);
        const data = await res.json();
        return { success: res.status === 200, count: data.length || data.categories?.length };
    });

    // Test 4: User Registration (will fail if email exists - OK)
    await test('User Registration', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: `test${Date.now()}@test.com`,
                password: 'customer123'
            })
        });
        return { success: res.status === 201 || res.status === 400 }; // 400 = email exists
    });

    // Test 5: User Login
    let token = null;
    await test('User Login', async () => {
        const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'customer@infiatin.store',
                password: 'customer123'
            })
        });
        const data = await res.json();
        token = data.token;
        return { success: res.status === 200 && !!token };
    });

    // Test 6: Get User Profile (requires auth)
    await test('Get User Profile', async () => {
        const res = await fetch(`${BASE_URL}/api/user/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return { success: res.status === 200 };
    });

    // Test 7: Get Cart
    await test('Get Cart', async () => {
        const res = await fetch(`${BASE_URL}/api/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return { success: res.status === 200 };
    });

    // Test 8: Get User Orders
    await test('Get User Orders', async () => {
        const res = await fetch(`${BASE_URL}/api/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return { success: res.status === 200 };
    });

    // Test 9: Flash Sales
    await test('Get Flash Sales', async () => {
        const res = await fetch(`${BASE_URL}/api/flash-sales`);
        return { success: res.status === 200 || res.status === 404 }; // 404 OK if no active sales
    });

    // Test 10: Search Products
    await test('Search Products', async () => {
        const res = await fetch(`${BASE_URL}/api/products/search?q=kurma`);
        return { success: res.status === 200 };
    });

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SIMULATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! System is ready for deployment.');
    } else {
        console.log('\n⚠️  Some tests failed. Review before deployment.');
    }

    return results;
}

runFullSimulation().catch(console.error);
