import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { logger } from './logger';
import { corsOptions, requireBodyParams, userinfoMiddleware } from './utils';
import HttpStatus from 'http-status-codes';
import { connect, startJob } from './record-list-service';
import { requireSession, readSessionMiddleware } from './session-controller';
import cookieParser from 'cookie-parser';
import { validate } from './common/input-parser';

// Connect to AMQP host
connect();

export const recordListController = express();
recordListController.use(bodyParser.json({limit: '5mb'}));
recordListController.use(cookieParser());
recordListController.use(readSessionMiddleware);

recordListController.options('/', cors(corsOptions)); // enable pre-flight

recordListController.post('/', cors(corsOptions), requireSession, requireBodyParams('records', 'lowTag'), userinfoMiddleware, (req, res) => {
  const { records, lowTag } = req.body;
  const { sessionToken } = req.cookies;

  const deleteUnusedRecords = req.body.deleteUnusedRecords || false;

  try {
    if (!records.every(validate)) {
      return res.sendStatus(HttpStatus.BAD_REQUEST);
    }
    startJob(records, lowTag, deleteUnusedRecords, sessionToken, req.userinfo);

  } catch(error) {
    logger.log('error', 'Unable to start job', error);
    return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
  
  return res.sendStatus(HttpStatus.OK);
});
