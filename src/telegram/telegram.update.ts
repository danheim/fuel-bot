import { Command, Hears, Start, Update } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Logger } from '@nestjs/common';

@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(@InjectQueue('fuel') private readonly fuelQueue: Queue) {}

  @Start()
  async startCommand(ctx: Context) {
    const { first_name } = ctx.message.from;

    try {
      const messages = [
        `Привет ${first_name}! 👋`,
        `Меня зовут FuelTracker бот. Вот что я умею:\n`,
        '- ⛽ Поиск заправочных станций с бензином в *Киеве*\n',
        'Больше информации: @tragenstolz',
        'Начнем поиск?',
      ];

      await ctx.replyWithMarkdown(
        messages.join('\n'),
        Markup.keyboard(['🔍 Искать в Киеве']).resize(),
      );
    } catch (error) {
      this.logger.error(error);
    }
  }

  @Hears('🔍 Искать в Киеве')
  hearsSearch(ctx: Context) {
    const { id: senderId } = ctx.message.from;

    this.fuelQueue.add('search', {
      senderId,
      startTime: new Date().getTime(),
    });

    this.logger.log(`Request from: ${ctx.message.from.username}`);
  }

  @Command('counts')
  async counts(ctx: Context) {
    const counts = await this.fuelQueue.getJobCounts();
    const message = JSON.stringify(counts, null, 2);

    await ctx.replyWithMarkdown(message);
  }
}
