import {expect} from 'chai';
import {readEnvironmentVariable, createLoadUserIndexFn} from './utils';
import { __RewireAPI__ as UtilsRewireAPI } from './utils';
import sinon from 'sinon';

describe('utils', () => {
  let logStub;
  beforeEach(() => {
    logStub = sinon.stub();
    UtilsRewireAPI.__Rewire__('logger', { log: logStub });
  });
  
  afterEach(() => {
    UtilsRewireAPI.__ResetDependency__('logger');
  });
  
  
  describe('readEnvironmentVariable', () => {

    it('should read the environment value if it is set', () => {

      process.env['TEST_VAR_SET'] = 'test_value';
      const defaultValue = 'DEFAULT_VALUE';
      const configValue = readEnvironmentVariable('TEST_VAR_SET', defaultValue);
      expect(configValue).to.eql('test_value');
      
    });

    it('should use default value if present', () => {

      const defaultValue = 'DEFAULT_VALUE';
      const configValue = readEnvironmentVariable('TEST_VAR', defaultValue);
      expect(configValue).to.eql(defaultValue);
      
    });

    it('should throw if environment variable is missing and no default value is given', () => {
      const testKey = 'TEST_VAR_THROW';
      expect(readEnvironmentVariable.bind(null, testKey)).to.throw(Error);      
    });

  });

  describe('createLoadUserIndexFn', () => {
    let readFileStub;
    beforeEach(() => {
      readFileStub = sinon.stub();
      UtilsRewireAPI.__Rewire__('fs', { readFileSync: readFileStub });
    });
    afterEach(() => {
      UtilsRewireAPI.__ResetDependency__('fs');
    });
  
    it('returns undefined if MELINDA_LOAD_USER_FILE=null and logs the error', () => {
      const getMelindaLoadUserByLowtag = createLoadUserIndexFn(null);
      const result = getMelindaLoadUserByLowtag('LOW');
      expect(logStub.getCall(0).args).to.eql(['error', 'Melinda load users file is not available. LOAD-USERS are not usable.']);
      expect(result).to.be.an('undefined');
    });

    it('returns undefined if MELINDA_LOAD_USER_FILE is not found and logs the error', () => {
      readFileStub.throws(new Error('Fake file not found error'));
      const getMelindaLoadUserByLowtag = createLoadUserIndexFn('fake-path');
      const result = getMelindaLoadUserByLowtag('LOW');
      expect(logStub.getCall(0).args.slice(0,2)).to.eql(['error', 'Melinda load users file is not available. LOAD-USERS are not usable.']);
      expect(result).to.be.an('undefined');
    });

    it('returns undefined if user is not found', () => {
      readFileStub.returns(FAKE_LOAD_USER_DATA_WO_LOW);
      const getMelindaLoadUserByLowtag = createLoadUserIndexFn('fake-path');
      const result = getMelindaLoadUserByLowtag('LOW');
      expect(result).to.be.an('undefined');
    });

    it('returns load user information if user is found', () => {
      readFileStub.returns(FAKE_LOAD_USER_DATA);
      const getMelindaLoadUserByLowtag = createLoadUserIndexFn('fake-path');
      const result = getMelindaLoadUserByLowtag('LOW');
      expect(result.username).to.equal('LOAD-LOW');
      expect(result.lowtag).to.equal('LOW');
    });

  });

});

const FAKE_LOAD_USER_DATA_WO_LOW = `
TEST\tLOAD-TEST\tpassword
`;

const FAKE_LOAD_USER_DATA = `
TEST\tLOAD-TEST\tpassword
LOW\tLOAD-LOW\tpassword
`;