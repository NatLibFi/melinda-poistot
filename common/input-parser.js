
import _ from 'lodash';

const MELINDA_ID_PATTERN = /^\(FI-MELINDA\)(\d+)$/;
const LOCAL_ID_PATTERN = /^\d+(\s+FCC\d+)*$/;

export function parse(input) {
  return input.split('\n').map(trimmer).map(matcher);
}

function trimmer(str) {
  return str.trim();
}

function matcher(inputLine) {
  if (inputLine.length == 0) {
    return undefined;
  }
  if (MELINDA_ID_PATTERN.test(inputLine)) {
    const [, melindaId] = inputLine.match(MELINDA_ID_PATTERN);
    return { melindaId };
  }
  if (LOCAL_ID_PATTERN.test(inputLine)) {
    const cols = inputLine.split(/\s+/);
    return {
      localId: _.head(cols),
      links: _.tail(cols)
    };
  }

  return new Error('Could not parse the line'); 
}

export function validate(item) {
  if (item.localId !== undefined) {
    return true;
  }
  if (item.melindaId !== undefined) {
    return true;
  }
  return false;
}
