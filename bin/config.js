import {Utils} from '@natlibfi/melinda-commons';

const {readEnvironmentVariable} = Utils;

export const restApiUrl = readEnvironmentVariable('REST_API_URL');
export const restApiUsername = readEnvironmentVariable('REST_API_USERNAME');
export const restApiPassword = readEnvironmentVariable('REST_API_PASSWORD');