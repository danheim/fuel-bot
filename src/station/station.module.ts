import { CacheModule, Module } from '@nestjs/common';
import { WogService } from './station.services/wog.service';
import { OkkoService } from './station.services/okko.service';
import { SocarService } from './station.services/socar.service';
import { BullModule } from '@nestjs/bull';
import { StationProcessor } from './station.processor';
import { TelegramModule } from '../telegram/telegram.module';
import { StationService } from './station.service';

@Module({
  imports: [
    CacheModule.register(),
    BullModule.registerQueue({
      name: 'fuel',
    }),
    TelegramModule,
  ],
  providers: [
    WogService,
    SocarService,
    OkkoService,
    StationProcessor,
    StationService,
  ],
  exports: [WogService, SocarService, OkkoService],
})
export class StationModule {}
