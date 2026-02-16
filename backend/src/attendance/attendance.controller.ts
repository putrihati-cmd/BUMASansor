import { Body, Controller, Get, Post, Query, UseGuards, Req } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post('check-in')
    checkIn(@Req() req: any, @Body() body: { warungId: string; location?: string; photoUrl?: string }) {
        return this.attendanceService.checkIn(req.user.id, body.warungId, body.location, body.photoUrl);
    }

    @Post('check-out')
    checkOut(@Req() req: any) {
        return this.attendanceService.checkOut(req.user.id);
    }

    @Get()
    list(@Query('warungId') warungId: string, @Query('date') date?: string) {
        return this.attendanceService.list(warungId, date);
    }
}
