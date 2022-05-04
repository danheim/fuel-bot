import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  constructor(@InjectBot() private tgService: Telegraf) {}

  async sendMessage(chatId: number, message: string) {
    await this.tgService.telegram.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
    });
  }
}
