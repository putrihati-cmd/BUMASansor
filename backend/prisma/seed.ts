import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const warehouse = await prisma.warehouse.upsert({
    where: { name: 'Gudang Pusat' },
    update: {},
    create: {
      name: 'Gudang Pusat',
      location: 'Kantor BUMAS Ansor',
      phone: '081200000001',
    },
  });

  const category = await prisma.category.upsert({
    where: { name: 'Sembako' },
    update: {},
    create: { name: 'Sembako' },
  });

  await prisma.product.upsert({
    where: { barcode: 'BM00001' },
    update: {},
    create: {
      name: 'Beras Premium 5kg',
      barcode: 'BM00001',
      categoryId: category.id,
      buyPrice: 60000,
      sellPrice: 66000,
      margin: 10,
      unit: 'sak',
      isActive: true,
    },
  });

  const warung = await prisma.warung.create({
    data: {
      name: 'Warung Contoh',
      ownerName: 'Pemilik Contoh',
      phone: '081200000002',
      address: 'Jl. Contoh No. 1',
      region: 'Pusat',
      creditLimit: 5000000,
      creditDays: 14,
    },
  }).catch(async () => {
    return prisma.warung.findFirstOrThrow({ where: { name: 'Warung Contoh' } });
  });

  const password = await bcrypt.hash('Admin12345', 10);

  await prisma.user.upsert({
    where: { email: 'admin@bumas.local' },
    update: {},
    create: {
      email: 'admin@bumas.local',
      password,
      name: 'Admin BUMAS',
      role: Role.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'warung@bumas.local' },
    update: {},
    create: {
      email: 'warung@bumas.local',
      password,
      name: 'PIC Warung',
      role: Role.WARUNG,
      warungId: warung.id,
    },
  });

  await prisma.stock.upsert({
    where: {
      warehouseId_productId: {
        warehouseId: warehouse.id,
        productId: (await prisma.product.findFirstOrThrow({ where: { barcode: 'BM00001' } })).id,
      },
    },
    update: {},
    create: {
      warehouseId: warehouse.id,
      productId: (await prisma.product.findFirstOrThrow({ where: { barcode: 'BM00001' } })).id,
      quantity: 100,
      minStock: 20,
    },
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
