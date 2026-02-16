import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Post()
    create(@Query('warungId') warungId: string, @Body() dto: CreateCustomerDto) {
        return this.customersService.create(warungId, dto);
    }

    @Get()
    list(@Query('warungId') warungId: string) {
        return this.customersService.list(warungId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
        return this.customersService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.customersService.remove(id);
    }
}
