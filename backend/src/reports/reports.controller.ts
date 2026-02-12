import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ReportQueryDto } from './dto/report-query.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR)
  dashboard() {
    return this.reportsService.dashboard();
  }

  @Get('daily')
  @Roles(Role.ADMIN, Role.GUDANG)
  daily(@Query() query: ReportQueryDto) {
    return this.reportsService.daily(query.date);
  }

  @Get('monthly')
  @Roles(Role.ADMIN)
  monthly(@Query() query: ReportQueryDto) {
    return this.reportsService.monthly(query.month);
  }

  @Get('top-products')
  @Roles(Role.ADMIN, Role.GUDANG)
  topProducts(@Query() query: ReportQueryDto) {
    return this.reportsService.topProducts(query.days ?? 30, query.top ?? 10);
  }

  @Get('warungs')
  @Roles(Role.ADMIN)
  warungs(@Query() query: ReportQueryDto) {
    return this.reportsService.warungPerformance(query.period ?? 'monthly');
  }
}
