import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { QueryReceivableDto } from './dto/query-receivable.dto';
import { FinanceService } from './finance.service';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('receivables')
  @Roles(Role.ADMIN, Role.GUDANG, Role.WARUNG)
  listReceivables(@Query() query: QueryReceivableDto) {
    return this.financeService.listReceivables(query);
  }

  @Post('payments')
  @Roles(Role.ADMIN, Role.GUDANG)
  createPayment(@CurrentUser('sub') userId: string, @Body() dto: CreatePaymentDto) {
    return this.financeService.createPayment(userId, dto);
  }

  @Get('receivables/aging')
  @Roles(Role.ADMIN, Role.GUDANG)
  receivableAging() {
    return this.financeService.receivableAging();
  }

  @Get('receivables/warung/:id/status')
  @Roles(Role.ADMIN, Role.GUDANG, Role.WARUNG)
  warungStatus(@Param('id') warungId: string) {
    return this.financeService.warungCreditStatus(warungId);
  }

  @Post('receivables/refresh-overdue')
  @Roles(Role.ADMIN)
  refreshOverdue() {
    return this.financeService.refreshOverdueStatus();
  }
}
