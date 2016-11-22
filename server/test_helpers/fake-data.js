import MarcRecord from 'marc-record-js';

export const FAKE_RECORD = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '003    aaabbb',
  '100    ‡aTest Author',
  '245 0  ‡aSome content',
  '245 0  ‡aTest Title‡bTest field‡cTest content',
  '300    ‡aSub-A‡5TEST'
].join('\n'));

export const FAKE_RECORD_WITHOUT_LIBRARY_SPECIFIC_INFO = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '003    aaabbb',
  '100    ‡aTest Author',
  '245 0  ‡aSome content',
  '245 0  ‡aTest Title‡bTest field‡cTest content'
].join('\n'));


export const FAKE_DELETED_RECORD = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '003    aaabbb',
  '100    ‡aTest Author',
  '245 0  ‡aSome content',
  '245 0  ‡aTest Title‡bTest field‡cTest content',
  'STA    ‡aDELETED'
].join('\n'));

export const FAKE_RECORD_SID_LOW = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author',
  'SID    ‡btest‡c111',
  'SID    ‡btest-2‡c114',
  'LOW    ‡aTEST'
].join('\n'));

export const FAKE_RECORD_2_LOW = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author',
  'LOW    ‡aTEST',
  'LOW    ‡aTEST-2',
].join('\n'));


export const FAKE_RECORD_FCC_SID = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author',
  'SID    ‡btest‡cFCC131',
  'SID    ‡btest-2‡c114'
].join('\n'));

export const FAKE_RECORD_FOR_CLEANUP = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author‡9TEST <KEEP>‡9TEST-2 <KEEP>',
  '245    ‡aSome content‡9TEST <DROP>',
  '300    ‡aSub-A‡5TEST',
  '301    ‡aSub-A‡5TEST‡5TEST-2',
  'SID    ‡btest‡cFCC131',
  'SID    ‡btest-2‡c114'
].join('\n'));

export const FAKE_RECORD_ONLY_LOW_TEST = MarcRecord.fromString([
  'LDR    abcdefghijk',
  '001    28474',
  '100    ‡aTest Author‡9TEST <KEEP>‡9TEST-2 <KEEP>',
  '245    ‡aSome content‡9TEST <DROP>',
  '300    ‡aSub-A‡5TEST',
  '301    ‡aSub-A‡5TEST‡5TEST-2',
  'SID    ‡btest‡cFCC131',
  'SID    ‡btest-2‡c114',
  'LOW    ‡aTEST'
].join('\n'));
