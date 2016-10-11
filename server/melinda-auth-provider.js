import fetch from 'isomorphic-fetch';
import { readEnvironmentVariable } from './utils';
import xml2js from 'xml2js';
import _ from 'lodash';
import promisify from 'es6-promisify';

const parseXMLStringToJSON = promisify(xml2js.parseString);

const alephUrl = readEnvironmentVariable('ALEPH_URL');
const alephUserLibrary = readEnvironmentVariable('ALEPH_USER_LIBRARY');

export const authProvider = {
  validateCredentials: function(username, password) {

    const requestUrl = `${alephUrl}/X?op=user-auth&library=${alephUserLibrary}&staff_user=${username}&staff_pass=${password}`;

    return new Promise((resolve, reject) => {

      fetch(requestUrl)
        .then(response => response.text())
        .then(parseXMLStringToJSON)
        .then((json) => {

          const credentialsValid = _.get(json, 'user-auth.reply[0]') === 'ok';

          resolve({
            credentialsValid
          });

        }).catch(reject);

    });
  }
};
