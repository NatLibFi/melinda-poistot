import crypto from 'crypto';
import { readEnvironmentVariable } from './utils';

const algorithm = 'aes-256-gcm';

// Using random key means that every time the app restarts all sessions will invalidate
const key = readEnvironmentVariable('SECRET_ENCRYPTION_KEY', crypto.randomBytes(32).toString('base64'), {hideDefaultValue: true});

function readKey() {
  return new Buffer(key, 'base64');
}

export function createSessionToken(username, password) {

  const iv = crypto.randomBytes(12);
  const key = readKey();

  const encryptionResult = encrypt(password, username, iv, key);

  return createToken(username, encryptionResult);
}

export function readSessionToken(sessionToken) {
  const key = readKey();
  const {username, iv, tag, encrypted} = parseToken(sessionToken);

  return {
    username,
    password: decrypt(encrypted, username, iv, tag, key)
  };
}

function createToken(username, encryptionResult) {
  const {encrypted, iv, tag} = encryptionResult;
  return [username, iv.toString('hex'), tag.toString('hex'), encrypted].join(':');
}

function parseToken(token) {
  const [username, iv, tag, encrypted] = token.split(':');
  return {
    username,
    encrypted, 
    iv: new Buffer(iv, 'hex'), 
    tag: new Buffer(tag, 'hex')
  };
}


function encrypt(text, aad, iv, key) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  cipher.setAAD(new Buffer(aad, 'utf8'));
  const encrypted = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
  
  return {
    encrypted: encrypted,
    tag: cipher.getAuthTag(),
    iv: iv
  };
}


function decrypt(encrypted, aad, iv, tag, key) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAAD(new Buffer(aad, 'utf8'));
  decipher.setAuthTag(tag);
  return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
}

