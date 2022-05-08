import { Controller, Get, Query } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { JobStatusClean, Queue } from 'bull';

@Controller('')
export class AppController {
  constructor(@InjectQueue('fuel') private readonly fuelQueue: Queue) {}

  @Get('health')
  async health() {
    const messages = await this.fuelQueue.getJobCounts();

    return {
      status: 'Fine',
      messages,
    };
  }

  @Get('purge')
  async purge(@Query('status') status: JobStatusClean = 'completed') {
    await this.fuelQueue.clean(0, status);

    return 'Purged';
  }
}
