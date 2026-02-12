import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FinanceService } from './finance.service';

@Injectable()
export class FinanceScheduler {
  private readonly logger = new Logger(FinanceScheduler.name);

  constructor(private readonly financeService: FinanceService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async refreshOverdueAndBlocks() {
    const result = await this.financeService.refreshOverdueStatus();
    this.logger.log(
      `Overdue sync completed. updated=${result.updatedOverdue}, blocked=${result.blockedWarungs}, unblocked=${result.unblockedWarungs}`,
    );
  }
}
