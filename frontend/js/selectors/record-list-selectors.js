import { createSelector } from 'reselect';

const recordList = state => state.getIn(['jobconfig', 'rawRecordIdRows']);

const validRecordList = createSelector([recordList], (recordList) => {
  return recordList.filter(row => row !== '');
});

export const validRecordCount = createSelector(
  [validRecordList], 
  (validRecordList) => {
    return validRecordList.length;
  }
);
