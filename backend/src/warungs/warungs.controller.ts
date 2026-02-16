import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateWarungDto } from './dto/create-warung.dto';
import { QueryWarungDto } from './dto/query-warung.dto';
import { UpdateWarungDto } from './dto/update-warung.dto';
import { WarungsService } from './warungs.service';

@Controller('warungs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarungsController {
  constructor(private readonly warungsService: WarungsService) { }

  @Get()
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR)
  list(@Query() query: QueryWarungDto) {
    return this.warungsService.list(query);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR, Role.WARUNG)
  findOne(@Param('id') id: string) {
    return this.warungsService.findOne(id);
  }

  @Get(':id/products')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR, Role.WARUNG)
  listProducts(@Param('id') id: string) {
    return this.warungsService.listProducts(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateWarungDto) {
    return this.warungsService.create(dto);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateWarungDto) {
    return this.warungsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.warungsService.remove(id);
  }

  @Put(':id/block')
  @Roles(Role.ADMIN)
  block(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.warungsService.block(id, body.reason ?? 'Blocked by admin');
  }

  @Put(':id/unblock')
  @Roles(Role.ADMIN)
  unblock(@Param('id') id: string) {
    return this.warungsService.unblock(id);
  }

  @Get(':id/credit-status')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR, Role.WARUNG)
  creditStatus(@Param('id') id: string) {
    return this.warungsService.creditStatus(id);
  }
}
