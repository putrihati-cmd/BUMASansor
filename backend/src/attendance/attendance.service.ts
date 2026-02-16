import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
    constructor(private readonly prisma: PrismaService) { }

    async checkIn(userId: string, warungId: string, location?: string, photoUrl?: string) {
        // Check if already checked in
        const active = await this.prisma.attendance.findFirst({
            where: { userId, checkOut: null },
        });
        if (active) {
            throw new BadRequestException('Already checked in');
        }

        return this.prisma.attendance.create({
            data: {
                userId,
                warungId,
                location,
                photoUrl,
            },
        });
    }

    async checkOut(userId: string) {
        const active = await this.prisma.attendance.findFirst({
            where: { userId, checkOut: null },
        });
        if (!active) {
            throw new BadRequestException('Not checked in');
        }

        return this.prisma.attendance.update({
            where: { id: active.id },
            data: { checkOut: new Date() },
        });
    }

    async list(warungId: string, date?: string) {
        const start = date ? new Date(date) : new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);

        return this.prisma.attendance.findMany({
            where: {
                warungId,
                checkIn: { gte: start, lte: end },
            },
            include: { user: true },
            orderBy: { checkIn: 'desc' },
        });
    }
}
