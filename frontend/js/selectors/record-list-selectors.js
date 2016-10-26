import _ from 'lodash';
import { createSelector } from 'reselect';

const recordList = state => state.getIn(['recordListForm', 'rawRecordIdRows']);

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

const submitStatus = state => state.getIn(['recordListForm', 'submitStatus']);
const lowtag = state => state.getIn(['recordListForm', 'lowtag']);

export const editorIsReadOnly = createSelector([submitStatus], submitStatus => {
  return _.includes(['ONGOING', 'SUCCESS'], submitStatus);
});

export const submitEnabled = createSelector(
  [validRecordCount, recordParseErrors, submitStatus, lowtag],
  (validRecordCount, recordParseErrors, submitStatus, lowtag) => {

    if (recordParseErrors.length !== 0) {
      return { value: false, reason: 'Tietuelistauksessa on virheitä.' };
    }
    if (validRecordCount === 0) {
      return { value: false, reason: 'Listauksessa ei ole yhtään tietuetta.' }; 
    }
    if (lowtag === undefined) {
      return { value: false, reason: 'Tietokantatunnusta ei ole valittu.' }; 
    }
    if (submitStatus === 'NOT_SUBMITTED' || submitStatus === 'FAILED') {
      return { value: true };
    }
    return { value: false };
  }
);
