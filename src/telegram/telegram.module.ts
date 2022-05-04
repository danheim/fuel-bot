import { Module } from '@nestjs/common';
import { TelegramUpdate } from './telegram.update';
import { TelegramService } from './telegram.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [BullModule.registerQueue({ name: 'fuel' })],
  providers: [TelegramUpdate, TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
