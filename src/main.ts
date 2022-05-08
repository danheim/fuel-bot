import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  utilities as nestWinstonModuleUtilities,
  WinstonModule,
} from 'nest-winston';
import * as winston from 'winston';
import * as WinstonCloudWatch from 'winston-cloudwatch';
import * as moment from 'moment';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      format: winston.format.uncolorize(),
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.ms(),
            nestWinstonModuleUtilities.format.nestLike(),
          ),
        }),
        new WinstonCloudWatch({
          name: 'Cloudwatch Logs',
          logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
          logStreamName: moment(new Date()).format('L'),
          awsRegion: process.env.CLOUDWATCH_AWS_REGION,
          awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
          awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
          messageFormatter: function (item) {
            // if (!Object.values(item.meta)) {
            //   return `${item.level}: ${item.message}`;
            // }
            // console.log(Object.values(item.meta));

            return `[${item.name}] ${item.level}: ${item.message}`;
          },
        }),
      ],
    }),
  });
  await app.listen(3000);
}
bootstrap();
