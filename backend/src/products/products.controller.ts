import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR, Role.WARUNG)
  list(@Query() query: QueryProductDto) {
    return this.productsService.list(query);
  }

  @Get('export')
  @Roles(Role.ADMIN, Role.GUDANG)
  export() {
    return this.productsService.export();
  }

  @Get('barcode/:barcode')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR, Role.WARUNG)
  findByBarcode(@Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(barcode);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.GUDANG, Role.KURIR, Role.WARUNG)
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Post('bulk-import')
  @Roles(Role.ADMIN)
  bulkImport(@Body() rows: CreateProductDto[]) {
    return this.productsService.bulkImport(rows);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
