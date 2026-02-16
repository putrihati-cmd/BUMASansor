import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(warungId: string, dto: CreateCustomerDto) {
        return this.prisma.customer.create({
            data: {
                ...dto,
                warungId,
            },
        });
    }

    async list(warungId: string) {
        return this.prisma.customer.findMany({
            where: { warungId, deletedAt: null },
            orderBy: { name: 'asc' },
        });
    }

    async findOne(id: string) {
        const customer = await this.prisma.customer.findFirst({
            where: { id, deletedAt: null },
            include: { sales: { take: 5, orderBy: { createdAt: 'desc' } } },
        });
        if (!customer) throw new NotFoundException('Customer not found');
        return customer;
    }

    async update(id: string, dto: UpdateCustomerDto) {
        return this.prisma.customer.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string) {
        return this.prisma.customer.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
