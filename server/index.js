'use strict';
import express from 'express';
import { logger, expressWinston } from './logger';
import { readEnvironmentVariable } from './utils';
import cookieParser from 'cookie-parser';
import { sessionController } from './session-controller';
import { recordListController } from './record-list-controller';

//const NODE_ENV = readEnvironmentVariable('NODE_ENV', 'dev');
const PORT = readEnvironmentVariable('HTTP_PORT', 3001);

const app = express();

app.use(expressWinston);
app.use(cookieParser());

app.use('/session', sessionController);
app.use('/records', recordListController);

app.use(express.static('public'));

app.listen(PORT, () => logger.log('info', `Application started on port ${PORT}`));

