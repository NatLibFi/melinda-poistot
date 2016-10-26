import _ from 'lodash';
import MarcRecord from 'marc-record-js';
import { recordIsUnused, markRecordAsDeleted } from './record-utils';

export function transformRecord(recordParam, libraryTag, expectedLocalId, opts) {
  const lowercaseLibraryTag = libraryTag.toLowerCase();
 
  if (!looksLikeRecord(recordParam)) {
    throw new Error('Invalid record');
  }

  const record = new MarcRecord(recordParam);

  return new Promise((resolve, reject) => {
    const report = [];

    if (record.isDeleted()) {
      return reject(new Error('The record is deleted.'));
    }

    if(expectedLocalId && !validateLocalSid(record, lowercaseLibraryTag, expectedLocalId.toString())) {
      return reject(new Error('The record has unexpected SIDc value.'));
    }

    removeSIDFields(record, report, libraryTag, expectedLocalId);
    removeLOWFields(record, report, libraryTag);

    if (opts && opts.deleteUnusedRecords && recordIsUnused(record)) {
      markRecordAsDeleted(record);
      report.push('Record was deleted.');
    } else {
      cleanupRecord(record, report, libraryTag);
    }

    return resolve({record, report});
  });
}

function looksLikeRecord(maybeRecord) {
  return maybeRecord && maybeRecord.fields && maybeRecord.fields.constructor === Array;
}

function validateLocalSid(record, lowercaseLibraryTag, expectedLocalId) {
  return record.getFields('SID', 'b', lowercaseLibraryTag)
    .every(field => {
      const subfield_c = field.subfields.filter(subfield => subfield.code === 'c');
      return subfield_c.every(subfield => {
        if (subfield.value.startsWith('FCC')) {
          return true;
        }
        return subfield.value == expectedLocalId;
      });

    });
}

function removeSIDFields(record, report, libraryTag, expectedLocalId) {
  if (expectedLocalId === undefined) {
    return;
  }
  const normalizedExpectedLocalId = expectedLocalId.toString();
  const lowercaseLibraryTag = libraryTag.toLowerCase();
  const fieldsToRemove = record.getFields('SID', 'b', lowercaseLibraryTag, 'c', normalizedExpectedLocalId);
  
  fieldsToRemove.forEach(field => {
    const removedLibraryTag = getSubfieldValues(field, 'b').join(',');
    report.push(`Removed SID: ${removedLibraryTag}`);
  });

  record.fields = _.difference(record.fields, fieldsToRemove);

}

function removeLOWFields(record, report, libraryTag) {
  const uppercaseLibraryTag = libraryTag.toUpperCase();
  const fieldsToRemove = record.getFields('LOW', 'a', uppercaseLibraryTag);
  
  fieldsToRemove.forEach(field => {
    const removedLibraryTag = getSubfieldValues(field, 'a').join(',');
    report.push(`Removed LOW: ${removedLibraryTag}`);
  });

  if (fieldsToRemove.length === 0) {
    report.push('Record did not have LOW tag.');
  }

  record.fields = _.difference(record.fields, fieldsToRemove);

}

function cleanupRecord(record, report, libraryTag) {
 
  record.getDatafields()
    .filter(withSubfield('5'))
    .forEach((field) => {
      const subfield5List = getSubfields(field, '5');

      if (subfield5List.length === 1) {
        removeField(record, field);
        report.push(`Removed field ${field.tag}`);  
      }
      
      if (subfield5List.length > 1) {
        subfield5List.filter(sub => sub.value === libraryTag.toUpperCase()).forEach(subfield => {
          removeSubfield(record, field, subfield);
          report.push(`Removed subfield 5 with value ${subfield.value} from field ${field.tag}`);
        });
      }      
    });

  record.getDatafields()
    .filter(withSubfield('9'))
    .forEach((field) => {
      const subfield9List = getSubfields(field, '9');

      subfield9List.filter(replicationCommandMatcher(libraryTag)).forEach(subfield => {
        removeSubfield(record, field, subfield);
        report.push(`Removed subfield 9 with value ${subfield.value} from field ${field.tag}`);
      });
  
    });
}

function replicationCommandMatcher(libraryTag) {
  const ucTag = libraryTag.toUpperCase();
  const patterns = [`${ucTag} <KEEP>`, `${ucTag} <DROP>`];

  return function(subfield) {
    return patterns.some(pattern => pattern === subfield.value);
  };
}

function removeField(record, field) {
  record.fields = _.without(record.fields, field);
}
function removeSubfield(record, field, subfield) {
  field.subfields = _.without(field.subfields, subfield);
}

function withSubfield(code) {
  return function(field) {
    return field.subfields.some(sub => sub.code === code);
  };
}

function getSubfieldValues(field, code) {
  return getSubfields(field, code).map(sub => sub.value);
}

function getSubfields(field, code) {
  return field.subfields.filter(sub => sub.code === code);
}
