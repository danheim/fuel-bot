import { Action, Command, Hears, Start, Update } from 'nestjs-telegraf';
import type { Context } from 'telegraf';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Update()
export class TelegramUpdate {
  constructor(@InjectQueue('fuel') private readonly fuelQueue: Queue) {}

  @Start()
  startCommand(ctx: Context) {
    const messages = [
      'Привет 🇺🇦\n',
      'Это бот по поиску топлива в Киеве',
      'На данный момент поиск проводится по заправкам WOG и SOCAR',
      'Чтобы начать поиск, напишите команду /search\n',
      'Автор бота - @tragenstolz',
    ];

    ctx.replyWithMarkdown(messages.join('\n'));
  }

  @Hears('search')
  hearsSearch(ctx: Context) {
    const { id: senderId } = ctx.message.from;

    this.fuelQueue.add('search', {
      senderId,
      startTime: new Date().getTime(),
    });

    console.log(`GOT REQUEST FROM ${ctx.message.from.username}`);
  }

  @Action('search')
  actionSearch(ctx: Context) {
    if ('callback_query' in ctx.update) {
      this.fuelQueue.add('search', {
        senderId: ctx.update.callback_query.from.id,
        startTime: new Date().getTime(),
      });

      console.log(
        `GOT REQUEST FROM ${ctx.update.callback_query.from.username}`,
      );
    }
  }

  @Command('search')
  commandSearch(ctx: Context) {
    this.hearsSearch(ctx);
  }
}
