import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BridgerModule } from 'src/bridger/bridger.module';

@Module({
  imports: [PrismaModule, BridgerModule],
  exports: [UserService],
  providers: [UserService],
  controllers: [UserController]
})
export class UserModule {}
