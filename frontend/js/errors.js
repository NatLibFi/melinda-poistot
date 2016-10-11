

export function FetchNotOkError(response) {
  var temp = Error.apply(this, [response.statusText]);
  temp.name = this.name = 'FetchNotOkError';
  this.stack = temp.stack;
  this.message = temp.message;
  this.response = response;
  this.status = response.status;
}

FetchNotOkError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: FetchNotOkError,
    writable: true,
    configurable: true
  }
});