import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryProductDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where = {
      deletedAt: null,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { barcode: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(query.categoryId ? { categoryId: query.categoryId } : {}),
      ...(query.isActive !== undefined ? { isActive: query.isActive } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByBarcode(barcode: string) {
    const product = await this.prisma.product.findFirst({
      where: { barcode, deletedAt: null },
      include: { category: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, deletedAt: null },
    });

    if (!category) {
      throw new BadRequestException('Category not found');
    }

    const barcode = dto.barcode ?? (await this.generateBarcode());
    const margin = this.calculateMargin(dto.buyPrice, dto.sellPrice);

    return this.prisma.product.create({
      data: {
        ...dto,
        barcode,
        margin,
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.findOne(id);

    const buyPrice = dto.buyPrice ?? Number(existing.buyPrice);
    const sellPrice = dto.sellPrice ?? Number(existing.sellPrice);

    return this.prisma.product.update({
      where: { id },
      data: {
        ...dto,
        margin: this.calculateMargin(buyPrice, sellPrice),
      },
      include: { category: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async bulkImport(rows: CreateProductDto[]) {
    const created = [];
    for (const row of rows) {
      created.push(await this.create(row));
    }
    return {
      total: created.length,
      items: created,
    };
  }

  export() {
    return this.prisma.product.findMany({
      where: { deletedAt: null },
      include: { category: true },
      orderBy: { name: 'asc' },
    });
  }

  private calculateMargin(buyPrice: number, sellPrice: number): number {
    if (buyPrice <= 0) {
      return 0;
    }
    return Number((((sellPrice - buyPrice) / buyPrice) * 100).toFixed(2));
  }

  private async generateBarcode(): Promise<string> {
    for (let i = 0; i < 10; i += 1) {
      const digits = Math.floor(10000 + Math.random() * 90000).toString();
      const barcode = `BM${digits}`;
      const exists = await this.prisma.product.findFirst({ where: { barcode } });
      if (!exists) {
        return barcode;
      }
    }
    throw new BadRequestException('Failed to generate barcode');
  }
}
