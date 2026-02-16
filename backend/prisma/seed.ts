import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Seeding...');

  // 1. Central Warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { name: 'Gudang Pusat BUMAS' },
    update: {},
    create: {
      name: 'Gudang Pusat BUMAS',
      location: 'Kantor BUMAS Ansor',
      phone: '081200000001',
    },
  });
  console.log('- Warehouse seeded');

  // 2. Category
  const category = await prisma.category.upsert({
    where: { name: 'Sembako' },
    update: {},
    create: { name: 'Sembako' },
  });
  console.log('- Category seeded');

  // 3. Global Products (Master Catalog)
  const product1 = await prisma.product.upsert({
    where: { barcode: 'BM00001' },
    update: {},
    create: {
      name: 'Beras Premium 5kg',
      barcode: 'BM00001',
      categoryId: category.id,
      basePrice: 60000,
      suggestedPrice: 66000,
      unit: 'sak',
      isActive: true,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { barcode: 'BM00002' },
    update: {},
    create: {
      name: 'Minyak Goreng 1L',
      barcode: 'BM00002',
      categoryId: category.id,
      basePrice: 14500,
      suggestedPrice: 16000,
      unit: 'btl',
      isActive: true,
    },
  });
  console.log('- Master Products seeded');

  // 4. Central Stocks
  await prisma.stock.upsert({
    where: { warehouseId_productId: { warehouseId: warehouse.id, productId: product1.id } },
    update: { quantity: 1000 },
    create: { warehouseId: warehouse.id, productId: product1.id, quantity: 1000 },
  });
  console.log('- Central Stocks seeded');

  // 5. Users
  const password = await bcrypt.hash('Admin12345', 10);

  // Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@bumas.local' },
    update: {},
    create: {
      email: 'admin@bumas.local',
      password,
      name: 'Admin BUMAS',
      role: Role.SUPER_ADMIN,
    },
  });

  // Kurir
  await prisma.user.upsert({
    where: { email: 'kurir@bumas.local' },
    update: {},
    create: {
      email: 'kurir@bumas.local',
      password,
      name: 'Eko Kurir',
      role: Role.KURIR,
    },
  });

  // 6. Warung
  const warung = await prisma.warung.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' }, // Fixed ID for seeding consistency
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Warung Berkah Ansor',
      ownerName: 'H. Ahmad',
      phone: '081200000002',
      address: 'Jl. Ahmad Yani No. 10',
      region: 'Jakarta Selatan',
      creditLimit: 10000000,
    },
  });

  // PIC Warung (User)
  await prisma.user.upsert({
    where: { email: 'warung@bumas.local' },
    update: { warungId: warung.id },
    create: {
      email: 'warung@bumas.local',
      password,
      name: 'PIC Warung',
      role: Role.WARUNG,
      warungId: warung.id,
    },
  });
  console.log('- Warung & PIC seeded');

  // 7. Warung Local Inventory (WarungProduct)
  // This is what the POS will sell
  await prisma.warungProduct.upsert({
    where: { warungId_productId: { warungId: warung.id, productId: product1.id } },
    update: { stockQty: 20, sellingPrice: 67000 },
    create: {
      warungId: warung.id,
      productId: product1.id,
      stockQty: 20,
      sellingPrice: 67000, // Warung's own price
    },
  });

  await prisma.warungProduct.upsert({
    where: { warungId_productId: { warungId: warung.id, productId: product2.id } },
    update: { stockQty: 50, sellingPrice: 16500 },
    create: {
      warungId: warung.id,
      productId: product2.id,
      stockQty: 50,
      sellingPrice: 16500,
    },
  });
  console.log('- Warung Local Inventory seeded');

  console.log('Seeding Success!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
