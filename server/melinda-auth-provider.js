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
          if (credentialsValid) {
            const userinfo = credentialsValid ? parseUserInfo(json) : undefined;
            resolve({
              credentialsValid,
              userinfo: { 
                ...userinfo, 
                lowtags: createAllowedLowTagList(userinfo)
              }
            });
          } else {
            resolve({credentialsValid});
          }

          

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

/* eslint-disable */
function createAllowedLowTagList(userinfo) {

  // TODO: how to determine the list?

  const lowtagList = [
    'ALLI',
    'ALMA',
    'ANDER',
    'ARKEN',
    'ARSCA',
    'AURA',
    'CEAMK',
    'DIAK',
    'ERKKI',
    'FENNB',
    'FENNI',
    'HALTI',
    'HAMK',
    'HANNA',
    'HELCA',
    'HELKA',
    'HILLA',
    'HURMA',
    'JAMK',
    'JOSKU',
    'JUOLU',
    'JYKDO',
    'KAMK',
    'KARE',
    'LAKKI',
    'LAMK',
    'LAURE',
    'METRO',
    'OAMK',
    'OULA',
    'PIKI',
    'SAMK',
    'SAVON',
    'SEAMK',
    'SELMA',
    'TAIST',
    'TAMCA',
    'TAMK',
    'TEEMU',
    'TILDA',
    'TRITO',
    'TUTCA',
    'VAARI',
    'VALPU',
    'VASKI',
    'VEERA',
    'VOLTE',
    'WILMA',
    'XAMK'
  ];

  return ['XAMK', 'BAB']; //lowtagList;
}
/* eslint-enable */