const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const warungId = '00000000-0000-0000-0000-000000000001';

    // 1. Get WarungProducts
    const wpBeras = await prisma.warungProduct.findFirst({
        where: { warungId, product: { barcode: 'BM00001' } }
    });

    const wpMinyak = await prisma.warungProduct.findFirst({
        where: { warungId, product: { barcode: 'BM00002' } }
    });

    // 2. Add Tax Settings
    await prisma.taxSettings.upsert({
        where: { warungId },
        update: { taxRate: 11, serviceRate: 2, isTaxIncluded: false },
        create: { warungId, taxRate: 11, serviceRate: 2, isTaxIncluded: false }
    });

    // 3. Add Wholesale Price for Minyak
    if (wpMinyak) {
        await prisma.wholesalePrice.create({
            data: {
                warungProductId: wpMinyak.id,
                minQty: 10,
                price: 15000
            }
        });
    }

    // 4. Add Modifiers for Beras (e.g. Packaging options)
    if (wpBeras) {
        const group = await prisma.modifierGroup.create({
            data: {
                warungId,
                name: 'Ekstra Layanan',
                maxSelect: 1,
                isRequired: false,
                modifiers: {
                    create: [
                        { name: 'Kemas Kado', price: 5000 },
                        { name: 'Kirim Cepat', price: 10000 }
                    ]
                }
            }
        });

        await prisma.productModifierGroup.create({
            data: {
                warungProductId: wpBeras.id,
                modifierGroupId: group.id
            }
        });
    }

    console.log('Pro Features Seeded!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
