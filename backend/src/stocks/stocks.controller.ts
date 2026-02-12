import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MovementType } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { QueryStockDto } from './dto/query-stock.dto';
import { StockMovementDto } from './dto/stock-movement.dto';
import { StockOpnameDto } from './dto/stock-opname.dto';
import { StocksService } from './stocks.service';

@Controller('stocks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StocksController {
  constructor(private readonly stocksService: StocksService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR)
  list(@Query() query: QueryStockDto) {
    return this.stocksService.list(query);
  }

  @Get('movements/history')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR)
  history(
    @Query('warehouseId') warehouseId?: string,
    @Query('productId') productId?: string,
    @Query('movementType') movementType?: MovementType,
  ) {
    return this.stocksService.history({ warehouseId, productId, movementType });
  }

  @Get('alerts/low-stock')
  @Roles(Role.ADMIN, Role.GUDANG)
  alerts() {
    return this.stocksService.alerts();
  }

  @Get('valuation/total')
  @Roles(Role.ADMIN, Role.GUDANG)
  valuation() {
    return this.stocksService.valuation();
  }

  @Get(':warehouseId/:productId')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR)
  findOne(@Param('warehouseId') warehouseId: string, @Param('productId') productId: string) {
    return this.stocksService.findOne(warehouseId, productId);
  }

  @Post('movement')
  @Roles(Role.ADMIN, Role.GUDANG)
  movement(@Body() dto: StockMovementDto, @CurrentUser('sub') userId: string) {
    return this.stocksService.recordMovement(dto, userId);
  }

  @Post('opname')
  @Roles(Role.ADMIN, Role.GUDANG)
  opname(@Body() dto: StockOpnameDto, @CurrentUser('sub') userId: string) {
    return this.stocksService.performOpname(dto, userId);
  }
}
