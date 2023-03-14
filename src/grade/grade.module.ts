import { Module } from '@nestjs/common';
import { GradeService } from './grade.service';
import { GradeController } from './grade.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BridgerModule } from 'src/bridger/bridger.module';

@Module({
  imports: [PrismaModule, BridgerModule],
  providers: [GradeService],
  controllers: [GradeController]
})
export class GradeModule {}
