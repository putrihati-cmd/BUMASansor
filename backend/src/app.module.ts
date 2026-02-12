import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { DistributionModule } from './distribution/distribution.module';
import { FinanceModule } from './finance/finance.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from './products/products.module';
import { ReportsModule } from './reports/reports.module';
import { SalesModule } from './sales/sales.module';
import { StocksModule } from './stocks/stocks.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { UsersModule } from './users/users.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { WarungsModule } from './warungs/warungs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 60,
      },
    ]),
    PrismaModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    SuppliersModule,
    WarehousesModule,
    ProductsModule,
    WarungsModule,
    StocksModule,
    DistributionModule,
    SalesModule,
    FinanceModule,
    ReportsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

