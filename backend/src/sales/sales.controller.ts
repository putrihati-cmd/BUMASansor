import { BadRequestException, Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySaleDto } from './dto/query-sale.dto';
import { SalesService } from './sales.service';

@Controller('sales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) { }

  @Post()
  @Roles(Role.ADMIN, Role.WARUNG)
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateSaleDto) {
    return this.salesService.create(userId, dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.GUDANG, Role.WARUNG)
  list(@Query() query: QuerySaleDto) {
    return this.salesService.list(query);
  }

  @Get('daily-summary')
  @Roles(Role.ADMIN, Role.GUDANG, Role.WARUNG)
  dailySummary(
    @Query('date') date?: string,
    @Query('warungId') queryWarungId?: string,
    @CurrentUser() user?: any,
  ) {
    const warungId = user?.role === Role.WARUNG ? user.warungId : queryWarungId;
    if (!warungId) {
      throw new BadRequestException('Warung ID is required');
    }
    return this.salesService.dailySummary(warungId, date);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GUDANG, Role.WARUNG)
  findOne(@Param('id') id: string) {
    return this.salesService.findOne(id);
  }
}
