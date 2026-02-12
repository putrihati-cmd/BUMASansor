import { Module } from '@nestjs/common';
import { WarungsController } from './warungs.controller';
import { WarungsService } from './warungs.service';

@Module({
  controllers: [WarungsController],
  providers: [WarungsService],
  exports: [WarungsService],
})
export class WarungsModule {}
