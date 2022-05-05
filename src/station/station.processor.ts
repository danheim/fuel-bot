import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WogService } from './station.services/wog.service';
import { SocarService } from './station.services/socar.service';
import { TelegramService } from '../telegram/telegram.service';

@Processor('fuel')
export class StationProcessor {
  constructor(
    private readonly wogService: WogService,
    private readonly socarService: SocarService,
    private readonly telegramService: TelegramService,
  ) {}

  @Process('search')
  async search(job: Job) {
    // TODO: Create module for each oil company
    await Promise.all([
      this.wogService.run(job.data),
      this.socarService.run(job.data),
    ]);

    this.telegramService.sendSearchButton(job.data.senderId);
  }
}
