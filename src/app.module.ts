import { CacheModule, Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { StationModule } from './station/station.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app/app.controller';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ScheduleModule.forRoot(),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
    }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_TOKEN,
    }),
    BullModule.registerQueue({ name: 'fuel' }),
    TelegramModule,
    StationModule,
    LoggerModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
