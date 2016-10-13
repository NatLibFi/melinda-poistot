import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { logger } from './logger';
import { corsOptions, requireBodyParams } from './utils';
import HttpStatus from 'http-status-codes';
import { connect, startJob } from './record-list-service';

// Connect to AMQP host
connect();

export const recordListController = express();

recordListController.use(bodyParser.json());


recordListController.options('/', cors(corsOptions)); // enable pre-flight

recordListController.post('/', cors(corsOptions), requireBodyParams('records'), (req, res) => {
  const {records} = req.body;

  try {
    startJob(records);
  } catch(error) {
    logger.log('error', 'Unable to start job', error);
    return res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
  }
  return res.sendStatus(HttpStatus.OK);

});

