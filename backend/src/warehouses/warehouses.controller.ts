import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehousesService } from './warehouses.service';

@Controller('warehouses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR)
  list() {
    return this.warehousesService.list();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR)
  findOne(@Param('id') id: string) {
    return this.warehousesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateWarehouseDto) {
    return this.warehousesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.warehousesService.remove(id);
  }
}
