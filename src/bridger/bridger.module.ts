import { Module } from '@nestjs/common';
import { HttpModule } from 'src/http/http.module';
import { BridgerService } from './bridger.service';

@Module({
  imports: [HttpModule],
  exports: [BridgerService],
  providers: [BridgerService]
})
export class BridgerModule {}
