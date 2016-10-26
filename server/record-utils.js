
export function recordIsUnused(record) {
  // record is considered unused if it does not have any of the following fields: 
  return record.fields.filter(field => ['850','852','866','LOW'].some(tag => tag === field.tag)).length === 0;
}

export function markRecordAsDeleted(record) {
  record.leader = Array.from(record.leader).map((c, i) => i == 5 ? 'd' : c).join('');
  record.insertField(['STA','','','a','DELETED']);
}