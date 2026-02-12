import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceScheduler } from './finance.scheduler';
import { FinanceService } from './finance.service';

@Module({
  controllers: [FinanceController],
  providers: [FinanceService, FinanceScheduler],
  exports: [FinanceService],
})
export class FinanceModule {}
