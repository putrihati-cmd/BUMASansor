import { Module } from '@nestjs/common';
import { PosExtensionsController } from './pos-extensions.controller';
import { PosExtensionsService } from './pos-extensions.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PosExtensionsController],
    providers: [PosExtensionsService],
    exports: [PosExtensionsService],
})
export class PosExtensionsModule { }
