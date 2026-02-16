import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ReceivableStatus } from '@prisma/client';

@Controller('debts')
@UseGuards(JwtAuthGuard)
export class DebtsController {
    constructor(private readonly debtsService: DebtsService) { }

    @Get()
    list(
        @Query('warungId') warungId: string,
        @Query('status') status?: ReceivableStatus,
        @Query('customerId') customerId?: string,
        @Query('search') search?: string,
    ) {
        return this.debtsService.list(warungId, { status, customerId, search });
    }

    @Get(':id')
    getOne(@Param('id') id: string) {
        return this.debtsService.getOne(id);
    }

    @Post(':id/pay')
    pay(
        @Param('id') id: string,
        @Body() dto: { amount: number; method: string; notes?: string },
    ) {
        return this.debtsService.pay(id, dto.amount, dto.method as any, dto.notes);
    }

    @Post()
    createManual(
        @Body() dto: { warungId: string; customerId: string; amount: number; dueDate: string; notes?: string },
    ) {
        return this.debtsService.createManual(dto.warungId, dto.customerId, dto.amount, new Date(dto.dueDate), dto.notes);
    }
}
