'use strict';
import express from 'express';
import path from 'path';
import { logger, expressWinston } from 'server/logger';
import { readEnvironmentVariable } from 'server/utils';
import cookieParser from 'cookie-parser';
import { sessionController } from 'server/session-controller';
import { recordListController } from './record-list-controller';

import * as recordUpdateWorker from './workers/record-update-worker';
import ResultWorker from './workers/result-worker';

//const NODE_ENV = readEnvironmentVariable('NODE_ENV', 'dev');
const PORT = readEnvironmentVariable('HTTP_PORT', 3001);

const app = express();

app.use(expressWinston);
app.use(cookieParser());

app.use('/session', sessionController);
app.use('/records', recordListController);

app.use(express.static(path.resolve(__dirname, 'public')));

app.listen(PORT, () => logger.log('info', `Application started on port ${PORT}`));

recordUpdateWorker.connect().then(() => logger.log('info', 'Record update worker ready.'));

const resultWorker = new ResultWorker();
resultWorker.connect().then(() => logger.log('info', 'Result worker ready.'));
