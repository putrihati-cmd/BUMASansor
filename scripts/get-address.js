const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getAddress() {
    const user = await prisma.user.findUnique({
        where: { email: 'customer@infiatin.store' },
        include: { addresses: true }
    });

    if (user?.addresses[0]) {
        console.log('Address ID:', user.addresses[0].id);
    } else {
        console.log('No address found. Creating one...');
        const newAddr = await prisma.address.create({
            data: {
                userId: user.id,
                recipientName: 'Demo User',
                phone: '08123456789',
                fullAddress: 'Jalan Test No 123',
                city: 'Jakarta',
                district: 'Gambir',
                province: 'DKI Jakarta',
                postalCode: '10110'
            }
        });
        console.log('Created Address ID:', newAddr.id);
    }

    await prisma.$disconnect();
}

getAddress();
