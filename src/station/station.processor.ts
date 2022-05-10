import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WogService } from './station.services/wog.service';
import { SocarService } from './station.services/socar.service';
import { TelegramService } from '../telegram/telegram.service';
import { Logger } from '@nestjs/common';
import { TelegramUpdate } from '../telegram/telegram.update';

@Processor('fuel')
export class StationProcessor {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(
    private readonly wogService: WogService,
    private readonly socarService: SocarService,
    private readonly telegramService: TelegramService,
  ) {}

  @Process('search')
  async search(job: Job) {
    try {
      this.wogService.run(job.data);
      this.socarService.run(job.data);
    } catch (error) {
      this.logger.error('Failed to process search job');
      this.logger.error(error);
    }
  }
}
