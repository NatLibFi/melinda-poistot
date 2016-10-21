import { createSelector } from 'reselect';

const recordList = state => state.getIn(['jobconfig', 'rawRecordIdRows']);

export const validRecordList = createSelector([recordList], (recordList) => {
  return recordList.filter(row => row !== undefined);
});

export const validRecordCount = createSelector(
  [validRecordList], 
  (validRecordList) => {
    return validRecordList.length;
  }
);

export const recordParseErrors = createSelector([recordList], (recordList) => {
  return recordList.reduce((acc, row, i) => {
    if (row instanceof Error) {
      acc.push({row: i, error: row});
    }
    return acc;
  }, []);
});