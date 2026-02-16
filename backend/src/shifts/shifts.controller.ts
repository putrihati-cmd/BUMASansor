import { Body, Controller, Get, Param, Post, Query, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ShiftsService } from './shifts.service';
import { OpenShiftDto, CloseShiftDto } from './dto/shift.dto';

@Controller('shifts')
@UseGuards(JwtAuthGuard)
export class ShiftsController {
    constructor(private readonly shiftsService: ShiftsService) { }

    @Post('open')
    open(@Request() req: any, @Query('warungId') warungId: string, @Body() dto: OpenShiftDto) {
        return this.shiftsService.open(req.user.id, warungId, dto);
    }

    @Post(':id/close')
    close(@Param('id') id: string, @Body() dto: CloseShiftDto) {
        return this.shiftsService.close(id, dto);
    }

    @Get('current')
    getCurrent(@Request() req: any, @Query('warungId') warungId: string) {
        return this.shiftsService.getCurrent(req.user.id, warungId);
    }

    @Get()
    list(@Query('warungId') warungId: string) {
        return this.shiftsService.list(warungId);
    }
}
