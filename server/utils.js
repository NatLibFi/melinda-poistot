'use strict';
import { logger } from './logger';
import _ from 'lodash';
import HttpStatus from 'http-status-codes';

export function readEnvironmentVariable(name, defaultValue, opts) {

  if (process.env[name] === undefined) {
    if (defaultValue === undefined) {
      const message = `Mandatory environment variable missing: ${name}`;
      logger.log('error', message);
      throw new Error(message);
    }
    const loggedDefaultValue = _.get(opts, 'hideDefaultValue') ? '[hidden]' : defaultValue;
    logger.log('info', `No environment variable set for ${name}, using default value: ${loggedDefaultValue}`);
  }

  return _.get(process.env, name, defaultValue);
}

const whitelist = JSON.parse(readEnvironmentVariable('CORS_WHITELIST', '["http://localhost:3000"]'));

export const corsOptions = {
  origin: function(origin, callback) {
    if (origin === undefined) {
      callback(null, true);
    } else {
      var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
      if (!originIsWhitelisted) {
        logger.log('info', `Request from origin ${origin} is not whitelisted.`);
      } 
      callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
    }
  },
  credentials: true
};

export function requireBodyParams(...requiredParams) {
  return function _requireBodyParams(req, res, next) {
    const values = requiredParams.map(key => req.body[key]);
    if (_.every(values)) {
      return next();  
    }
    const missingBodyParameters = _.difference(requiredParams, Object.keys(req.body));
    const error = `The request is missing the following body parameters: ${missingBodyParameters}`;

    logger.log('error', error);
    res.status(HttpStatus.BAD_REQUEST).send(error);
  };
}
