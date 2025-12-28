const fetch = require('node-fetch');
require('dotenv').config();

async function singleOrderTest() {
    try {
        console.log('🧪 Testing Single Order Creation...\n');

        // Login
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'customer@infiatin.store', password: 'customer123' })
        });

        const { token } = await loginRes.json();
        console.log('✅ Login successful\n');

        // Create order
        const orderRes = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                items: [{ productId: 'f5fb0da3-e64c-45de-ac9d-ccb5d4f106aa', quantity: 1 }],
                addressId: '7654c5f2-c80a-4d3e-b938-9176086d0ff5',
                paymentMethod: 'BANK_TRANSFER',
                shippingMethod: 'JNE',
                courierService: 'REG'
            })
        });

        console.log('📊 Order API Response:');
        console.log('Status:', orderRes.status);
        const data = await orderRes.json();
        console.log('Body:', JSON.stringify(data, null, 2));

        if (orderRes.status === 201) {
            console.log('\n🎉 SUCCESS! Single order created successfully.');
        } else {
            console.log('\n❌ FAILED');
        }

    } catch (e) {
        console.error('Error:', e);
    }
}

singleOrderTest();
