import fetch from 'isomorphic-fetch';
import { readEnvironmentVariable } from 'server/utils';

const apiVersion = readEnvironmentVariable('MELINDA_API_VERSION', null);
const alephUrl = readEnvironmentVariable('ALEPH_URL');
const apiPath = apiVersion !== null ? `/${apiVersion}` : '';
const apiUrl = `${alephUrl}/API${apiPath}`;
const XServerUrl = `${alephUrl}/X`;

export function checkAlephHealth() {

  return Promise.all([fetch(apiUrl), fetch(XServerUrl)]).then(([apiResponse, XServerResponse]) => {

    if (apiResponse.status !== 200) {
      throw new Error(`Melinda api failed. status=${apiResponse.status}`);
    }
    if (XServerResponse.status !== 200) {
      throw new Error(`X-Server failed. status=${XServerResponse.status}`);
    }

  });
}
