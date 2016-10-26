'use strict';
import { logger } from './logger';
import _ from 'lodash';
import { authProvider } from './melinda-auth-provider';
import { readSessionToken, createSessionToken } from './session-crypt';
import HttpStatus from 'http-status-codes';
import fs from 'fs';
import path from 'path';

const MELINDA_LOAD_USER_FILE = readEnvironmentVariable('MELINDA_LOAD_USER_FILE', null);

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

export function userinfoMiddleware(req, res, next) {
  const { sessionToken } = req.cookies;
  try {
    const {username, password} = readSessionToken(sessionToken);
    
    authProvider.validateCredentials(username, password).then(creds => {
      req.userinfo = creds.userinfo;
      next();
    }).catch(error => {
      logger.log('info', 'Error loading userinfo', error);
      res.sendStatus(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  } catch(error) {
    res.sendStatus(HttpStatus.UNAUTHORIZED);
  }
}

export const getMelindaLoadUserByLowtag = createLoadUserIndexFn(MELINDA_LOAD_USER_FILE);

export function createLoadUserIndexFn(relativeFilePath) {
  let usersByLowtag;

  return function(lowtag) {
    if (usersByLowtag === undefined) {
      const userList = readLoadUsersFile(relativeFilePath);
      usersByLowtag = userList.reduce((acc, val) => _.set(acc, val.lowtag, val), {});
    }

    const user = _.get(usersByLowtag, lowtag.toUpperCase());
    if (user === undefined) {
      return undefined;
    }

    return _.assign({}, user, {sessionToken: createSessionToken(user.username, user.password )});
  };
}

function readLoadUsersFile(relativeFilePath) {
  if (relativeFilePath === null) {
    logger.log('error', 'Melinda load users file is not available. LOAD-USERS are not usable.');
    return [];
  }

  const filePath = path.resolve(process.cwd(), relativeFilePath);
  try {
    return fs.readFileSync(filePath, 'utf8')
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        const [lowtag, username, password] = line.split('\t');
        return {
          lowtag: lowtag.trim().toUpperCase(), 
          username: username.trim(), 
          password: password.trim()
        };
      });
  } catch(error) {
    logger.log('error', 'Melinda load users file is not available. LOAD-USERS are not usable.', {filePath}, error);
  }
  return [];
}


export function exceptCoreErrors(fn) {

  return (error) => {
    if (isCoreError(error)) {
      throw error;
    } else {
      return fn(error);
    }
  };
}

export function isCoreError(error) {
  return ([EvalError, RangeError, URIError, TypeError, SyntaxError, ReferenceError].some(errorType => error instanceof errorType));
}

export function createTimer() {
  const start = process.hrtime();

  return { elapsed };

  function elapsed() {
    const elapsedTime = process.hrtime(start);
    return Math.round((elapsedTime[0]*1000) + (elapsedTime[1]/1000000));  
  }
}