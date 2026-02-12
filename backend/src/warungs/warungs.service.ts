import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarungDto } from './dto/create-warung.dto';
import { QueryWarungDto } from './dto/query-warung.dto';
import { UpdateWarungDto } from './dto/update-warung.dto';

@Injectable()
export class WarungsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryWarungDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const where = {
      deletedAt: null,
      ...(query.blocked !== undefined ? { isBlocked: query.blocked } : {}),
      ...(query.region ? { region: query.region } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search, mode: 'insensitive' as const } },
              { ownerName: { contains: query.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.warung.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.warung.count({ where }),
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
    const warung = await this.prisma.warung.findFirst({
      where: { id, deletedAt: null },
    });

    if (!warung) {
      throw new NotFoundException('Warung not found');
    }

    return warung;
  }

  create(dto: CreateWarungDto) {
    return this.prisma.warung.create({ data: dto });
  }

  async update(id: string, dto: UpdateWarungDto) {
    await this.findOne(id);
    return this.prisma.warung.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.warung.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async block(id: string, reason: string) {
    await this.findOne(id);
    return this.prisma.warung.update({
      where: { id },
      data: {
        isBlocked: true,
        blockedReason: reason,
      },
    });
  }

  async unblock(id: string) {
    await this.findOne(id);
    return this.prisma.warung.update({
      where: { id },
      data: {
        isBlocked: false,
        blockedReason: null,
      },
    });
  }

  async creditStatus(id: string) {
    const warung = await this.findOne(id);
    const limit = Number(warung.creditLimit);
    const debt = Number(warung.currentDebt);

    return {
      warungId: warung.id,
      creditLimit: limit,
      currentDebt: debt,
      availableCredit: limit - debt,
      creditDays: warung.creditDays,
      isBlocked: warung.isBlocked,
      blockedReason: warung.blockedReason,
    };
  }
}
