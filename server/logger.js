import winston from 'winston';
import expressWinstonLogger from 'express-winston';

const LOGLEVEL = process.env.NODE_ENV == 'debug' ? 'debug' : 'info';

export const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      'timestamp':true, 
      'level': LOGLEVEL
    })
  ]
});

export const expressWinston = expressWinstonLogger.logger({
  transports: [
    new winston.transports.Console({
      'timestamp':true, 
      'level': LOGLEVEL
    })
  ],
  meta: true, // optional: control whether you want to log the meta data about the request (default to true)
  //msg: "HTTP {{req.method}} {{req.url}}", // optional: customize the default logging message. E.g. "{{res.statusCode}} {{req.method}} {{res.responseTime}}ms {{req.url}}"
  //expressFormat: true, // Use the default Express/morgan request formatting. Enabling this will override any msg if true. Will only output colors with colorize set to true
  //colorize: true, // Color the text and status code, using the Express/morgan color palette (text: gray, status: default green, 3XX cyan, 4XX yellow, 5XX red).
});