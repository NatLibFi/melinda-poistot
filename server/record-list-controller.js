import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { logger } from './logger';
import { corsOptions, requireBodyParams, userinfoMiddleware } from './utils';
import HttpStatus from 'http-status-codes';
import { connect, startJob } from './record-list-service';
import { requireSession, readSessionMiddleware } from './session-controller';
import cookieParser from 'cookie-parser';

// Connect to AMQP host
connect();

export const recordListController = express();
recordListController.use(bodyParser.json({limit: '5mb'}));
recordListController.use(cookieParser());
recordListController.use(readSessionMiddleware);

recordListController.options('/', cors(corsOptions)); // enable pre-flight

recordListController.post('/', cors(corsOptions), requireSession, requireBodyParams('records', 'lowTag'), userinfoMiddleware, (req, res) => {
  const {records, lowTag } = req.body;
  const { sessionToken } = req.cookies;

  try {
    startJob(records, lowTag, sessionToken, req.userinfo);
  } catch(error) {
    logger.log('error', 'Unable to start job', error);
    return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
  
  return res.sendStatus(HttpStatus.OK);
});
