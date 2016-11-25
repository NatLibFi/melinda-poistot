import chai from 'chai';
import { checkAlephHealth } from './aleph-health-check-service';
import { __RewireAPI__ as RewireAPI } from './aleph-health-check-service';
import sinon from 'sinon';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line
import chaiAsPromised from 'chai-as-promised';
import { readEnvironmentVariable } from 'server/utils';

chai.use(chaiAsPromised);
var expect = chai.expect;

const apiVersion = readEnvironmentVariable('MELINDA_API_VERSION', null);
const alephUrl = readEnvironmentVariable('ALEPH_URL');
const apiPath = apiVersion !== null ? `/${apiVersion}` : '';

const fakeApiUrl = `${alephUrl}/API${apiPath}`;
const fakeXServerUrl = `${alephUrl}/X`;

const FAKE_RESULT_OK = { status: 200 };
const FAKE_RESULT_ERROR = { status: 503 };

describe('Aleph health check service', () => {  
  let fetchStub;
  
  beforeEach(() => {
    fetchStub = sinon.stub();
    RewireAPI.__Rewire__('fetch', fetchStub);
  
  });
  afterEach(() => {
    RewireAPI.__ResetDependency__('fetch');
  });

  describe('checkAlephHealth', () => {

    describe('when aleph is working properly', () => {

      beforeEach(() => {
        fetchStub.withArgs(fakeApiUrl).resolves(FAKE_RESULT_OK);
        fetchStub.withArgs(fakeXServerUrl).resolves(FAKE_RESULT_OK);
      });

      it('resolves the promise', () => {
        return expect(checkAlephHealth()).to.be.fulfilled;
      });

    });

    describe('when X-server is misbehaving', () => {

      beforeEach(() => {

        fetchStub.withArgs(fakeApiUrl).resolves(FAKE_RESULT_OK);
        fetchStub.withArgs(fakeXServerUrl).resolves(FAKE_RESULT_ERROR);

      });

      it('rejects the promise with error', () => {
        return expect(checkAlephHealth()).to.be.rejectedWith('X-Server failed. status=503');
      });

    });

    describe('when api is misbehaving', () => {

      beforeEach(() => {

        fetchStub.withArgs(fakeApiUrl).resolves(FAKE_RESULT_ERROR);
        fetchStub.withArgs(fakeXServerUrl).resolves(FAKE_RESULT_OK);

      });

      it('rejects the promise with error', () => {
        return expect(checkAlephHealth()).to.be.rejectedWith('Melinda api failed. status=503');
      });

    });
  });
});