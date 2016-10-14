import fetch from 'isomorphic-fetch';
import { readEnvironmentVariable } from './utils';
import xml2js from 'xml2js';
import _ from 'lodash';
import promisify from 'es6-promisify';

const parseXMLStringToJSON = promisify(xml2js.parseString);

const alephUrl = readEnvironmentVariable('ALEPH_URL');
const alephUserLibrary = readEnvironmentVariable('ALEPH_USER_LIBRARY');
const superUserLowTags = readEnvironmentVariable('SUPERUSER_LOWTAGS', '').split(',').map(s => s.toUpperCase());


export const authProvider = {
  validateCredentials: function(username, password) {

    const requestUrl = `${alephUrl}/X?op=user-auth&library=${alephUserLibrary}&staff_user=${username}&staff_pass=${password}`;

    return new Promise((resolve, reject) => {

      fetch(requestUrl)
        .then(response => response.text())
        .then(parseXMLStringToJSON)
        .then((json) => {

          const credentialsValid = _.get(json, 'user-auth.reply[0]') === 'ok';
          const userinfo = credentialsValid ? parseUserInfo(json) : undefined;

          resolve({
            credentialsValid,
            userinfo: { 
              ...userinfo, 
              lowtags: createAllowedLowTagList(userinfo)
            }
          });

        }).catch(reject);

    });
  }
};

function parseUserInfo(json) {
  const userLibrary = _.get(json, 'user-auth.z66[0].z66-user-library[0]');
  const name = _.get(json, 'user-auth.z66[0].z66-name[0]');
  const department = _.get(json, 'user-auth.z66[0].z66-department[0]');
  const email = _.get(json, 'user-auth.z66[0].z66-email[0]');
  return {userLibrary, name, department, email};
}

function createAllowedLowTagList(userinfo) {
  const department = _.get(userinfo, 'department', '').toUpperCase();

  if (department === 'KVP') {
    return superUserLowTags;
  } else {
    return [department];
  }

}
  