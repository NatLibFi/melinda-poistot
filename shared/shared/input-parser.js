
import _ from 'lodash';

const MELINDA_ID_PATTERN = /^\(FI-MELINDA\)(\d+)$/;
const LOCAL_ID_PATTERN = /^\d+(\s+FCC\d+)*$/;

export function parse(input) {
  const items = input.split('\n').map(trimmer).map(matcher);
  
  const rowLookup = items.reduce((acc, item, rowIndex) => {
    const key = makeKey(item);
    if (key) {
      return _.set(acc, key, rowIndex);
    } else {
      return acc;
    }
  }, {});

  return items.map((item, rowIndex) => {
    const key = makeKey(item);
    if (rowLookup[key] && rowLookup[key] !== rowIndex) {
      return new Error(`Rivi on identtinen rivin ${rowLookup[key] + 1} kanssa.`);
    }
    return item;
  });
}

function makeKey(item) {
  if (item === undefined) return undefined;

  if (item.localId) {
    return `${item.localId}L${item.links.join('-')}`;
  } else if(item.melindaId) {
    return `M${item.melindaId}`;
  } 
  return undefined;
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

  return new Error('Rivi ei ole sallitussa muodossa'); 
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
