import express from 'express';
import cors from 'cors';
import { corsOptions } from 'server/utils';
import { requireSession, readSessionMiddleware } from 'server/session-controller';

export default function StatusController(resultWorker) {
  
  const statusController = express();
  
  statusController.options('/', cors(corsOptions)); // enable pre-flight
  
  statusController.get('/', cors(corsOptions), readSessionMiddleware, requireSession, (req, res) => {
    res.send(resultWorker.getStatusInfo());
  });

  return statusController;
}
