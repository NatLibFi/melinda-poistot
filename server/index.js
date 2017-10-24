/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for removing references to local databases from Melinda
*
* Copyright (C) 2016-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-local-ref-removal-ui
*
* melinda-local-ref-removal-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-local-ref-removal-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/'use strict';
import express from 'express';
import path from 'path';
import { logger, expressWinston } from 'server/logger';
import { readEnvironmentVariable } from 'server/utils';
import cookieParser from 'cookie-parser';
import { sessionController } from 'server/session-controller';
import { recordListController } from './record-list-controller';

import * as recordUpdateWorker from './workers/record-update-worker';
import ResultWorker from './workers/result-worker';
import StatusController from './status-controller';

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

app.use('/status', new StatusController(resultWorker));
