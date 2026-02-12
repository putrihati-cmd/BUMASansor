import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.warehouse.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const warehouse = await this.prisma.warehouse.findFirst({ where: { id, deletedAt: null } });
    if (!warehouse) {
      throw new NotFoundException('Warehouse not found');
    }
    return warehouse;
  }

  create(dto: CreateWarehouseDto) {
    return this.prisma.warehouse.create({ data: dto });
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    await this.findOne(id);
    return this.prisma.warehouse.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.warehouse.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
