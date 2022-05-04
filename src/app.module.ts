import { CacheModule, Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { StationModule } from './station/station.module';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';

@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register<RedisClientOptions>({
      store: redisStore,
      socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT),
      },
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
    TelegramModule,
    StationModule,
  ],
})
export class AppModule {}
