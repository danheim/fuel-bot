import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston/dist/winston.utilities';
import * as WinstonCloudWatch from 'winston-cloudwatch';
import * as moment from 'moment';

export const logger = WinstonModule.createLogger({
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
      logStreamName: moment(new Date()).format('lll').replace(':', '-'),
      awsRegion: process.env.CLOUDWATCH_AWS_REGION,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
      messageFormatter: (item) =>
        `[${item.level}] [${item.context}]: ${item.message}`,
    }),
  ],
});
