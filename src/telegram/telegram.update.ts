import { Hears, Start, Update } from 'nestjs-telegraf';
import type { Context } from 'telegraf';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Update()
export class TelegramUpdate {
  constructor(@InjectQueue('fuel') private readonly fuelQueue: Queue) {}

  @Start()
  async startCommand(ctx: Context) {
    ctx.replyWithMarkdown(`Привет. Бот для поиска топлива *в разработке*`);
  }

  @Hears('search')
  async hearsSearch(ctx: Context) {
    const { id: senderId } = ctx.message.from;

    this.fuelQueue.add('search', {
      senderId,
      startTime: new Date().getTime(),
    });
    console.log(`GOT REQUEST FROM ${ctx.message.from.username}`);
  }
}
