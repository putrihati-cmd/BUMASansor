import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OpenShiftDto, CloseShiftDto } from './dto/shift.dto';

@Injectable()
export class ShiftsService {
    constructor(private readonly prisma: PrismaService) { }

    async open(userId: string, warungId: string, dto: OpenShiftDto) {
        const activeShift = await this.prisma.shift.findFirst({
            where: { userId, warungId, endTime: null },
        });
        if (activeShift) throw new BadRequestException('You already have an active shift');

        return this.prisma.shift.create({
            data: {
                userId,
                warungId,
                startCash: dto.startCash,
                notes: dto.notes,
            },
        });
    }

    async close(id: string, dto: CloseShiftDto) {
        const shift = await this.prisma.shift.findUnique({
            where: { id },
            include: {
                sales: {
                    select: { totalAmount: true, paidAmount: true, paymentMethod: true },
                },
            },
        });

        if (!shift) throw new NotFoundException('Shift not found');
        if (shift.endTime) throw new BadRequestException('Shift already closed');

        const totalPaid = shift.sales.reduce((sum, s) => sum + Number(s.paidAmount), 0);
        const expected = Number(shift.startCash) + totalPaid;

        return this.prisma.shift.update({
            where: { id },
            data: {
                endTime: new Date(),
                endCash: dto.endCash,
                totalExpected: expected,
                totalActual: dto.endCash,
                notes: shift.notes ? `${shift.notes}\nClose: ${dto.notes}` : dto.notes,
            },
        });
    }

    async getCurrent(userId: string, warungId: string) {
        return this.prisma.shift.findFirst({
            where: { userId, warungId, endTime: null },
            include: {
                _count: { select: { sales: true } },
            },
        });
    }

    async list(warungId: string) {
        return this.prisma.shift.findMany({
            where: { warungId },
            include: { user: { select: { name: true } } },
            orderBy: { startTime: 'desc' },
            take: 20,
        });
    }
}
