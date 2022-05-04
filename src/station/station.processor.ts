import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WogService } from './station.services/wog.service';
import { SocarService } from './station.services/socar.service';

@Processor('fuel')
export class StationProcessor {
  constructor(
    private readonly wogService: WogService,
    private readonly socarService: SocarService,
  ) {}

  @Process('search')
  search(job: Job) {
    const senderId: number = job.data.senderId;

    // TODO: Create module for each oil company
    this.wogService.run(senderId);
    this.socarService.run(senderId);
  }
}
