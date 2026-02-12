import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DOStatus, POStatus } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AssignKurirDto } from './dto/assign-kurir.dto';
import { ConfirmDeliveryDto } from './dto/confirm-delivery.dto';
import { CreateDODto } from './dto/create-do.dto';
import { CreatePODto } from './dto/create-po.dto';
import { DistributionService } from './distribution.service';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}

  @Post('purchase-orders')
  @Roles(Role.ADMIN, Role.GUDANG)
  createPO(@CurrentUser('sub') userId: string, @Body() dto: CreatePODto) {
    return this.distributionService.createPurchaseOrder(userId, dto);
  }

  @Get('purchase-orders')
  @Roles(Role.ADMIN, Role.GUDANG)
  listPO(@Query('status') status?: POStatus, @Query('supplierId') supplierId?: string) {
    return this.distributionService.listPurchaseOrders(status, supplierId);
  }

  @Get('purchase-orders/:id')
  @Roles(Role.ADMIN, Role.GUDANG)
  findPO(@Param('id') id: string) {
    return this.distributionService.findPurchaseOrder(id);
  }

  @Put('purchase-orders/:id/approve')
  @Roles(Role.ADMIN)
  approvePO(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.distributionService.approvePurchaseOrder(id, userId);
  }

  @Post('purchase-orders/:id/receive')
  @Roles(Role.ADMIN, Role.GUDANG)
  receivePO(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.distributionService.receivePurchaseOrder(id, userId);
  }

  @Delete('purchase-orders/:id')
  @Roles(Role.ADMIN, Role.GUDANG)
  cancelPO(@Param('id') id: string) {
    return this.distributionService.cancelPurchaseOrder(id);
  }

  @Post('delivery-orders')
  @Roles(Role.ADMIN)
  createDO(@CurrentUser('sub') userId: string, @Body() dto: CreateDODto) {
    return this.distributionService.createDeliveryOrder(userId, dto);
  }

  @Get('delivery-orders')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR, Role.WARUNG)
  listDO(@Query('status') status?: DOStatus, @Query('warungId') warungId?: string, @Query('kurirId') kurirId?: string) {
    return this.distributionService.listDeliveryOrders(status, warungId, kurirId);
  }

  @Get('delivery-orders/:id')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR, Role.WARUNG)
  findDO(@Param('id') id: string) {
    return this.distributionService.findDeliveryOrder(id);
  }

  @Put('delivery-orders/:id/assign-kurir')
  @Roles(Role.ADMIN, Role.GUDANG)
  assignKurir(@Param('id') id: string, @Body() dto: AssignKurirDto) {
    return this.distributionService.assignKurir(id, dto);
  }

  @Put('delivery-orders/:id/start-delivery')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR)
  startDelivery(@Param('id') id: string, @CurrentUser() user: { sub: string; role: Role }) {
    return this.distributionService.startDelivery(id, user.sub, user.role);
  }

  @Put('delivery-orders/:id/mark-delivered')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR)
  markDelivered(@Param('id') id: string, @CurrentUser() user: { sub: string; role: Role }) {
    return this.distributionService.markDelivered(id, user.sub, user.role);
  }

  @Post('delivery-orders/:id/confirm')
  @Roles(Role.ADMIN, Role.WARUNG)
  confirmDelivery(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: ConfirmDeliveryDto,
  ) {
    return this.distributionService.confirmDelivery(id, userId, dto);
  }

  @Delete('delivery-orders/:id')
  @Roles(Role.ADMIN, Role.GUDANG)
  cancelDO(@Param('id') id: string) {
    return this.distributionService.cancelDeliveryOrder(id);
  }
}
