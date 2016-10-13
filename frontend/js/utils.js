import { FetchNotOkError } from './errors';

export function exceptCoreErrors(fn) {

  return (error) => {
    if ([TypeError, SyntaxError, ReferenceError].find(errorType => error instanceof errorType)) {
      throw error;
    } else {
      return fn(error);
    }
  };
}

export function errorIfStatusNot(statusCode) {
  return function(response) {
    if (response.status !== statusCode) {
      throw new FetchNotOkError(response);
    }
    return response;
  };
}