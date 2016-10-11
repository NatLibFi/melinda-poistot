import sinon from 'sinon';
import chai from 'chai';
import sinonChai from 'sinon-chai';
import { sessionController } from './session-controller';
import { authProvider } from './melinda-auth-provider';
import request from 'supertest';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line

chai.use(sinonChai);
const expect = chai.expect;

describe('Session controller', () => {

  describe('start', () => {

    let validateCredentialsStub;

    beforeEach(() => {
      validateCredentialsStub = sinon.stub(authProvider, 'validateCredentials');
    });

    afterEach(() => {
      authProvider.validateCredentials.restore();
    });

    it('returns 200 if credentials are ok', (done) => {

      validateCredentialsStub.resolves({
        credentialsValid: true
      });

      request(sessionController)
        .post('/start')
        .send({'username': 'test', 'password': 'test'})
        .expect(200, done);

    });

    it('returns 400 if credentials are missing', (done) => {

      request(sessionController)
        .post('/start')
        .expect(400, done);
        
    });

    it('returns 401 if credentials are not ok', (done) => {

      validateCredentialsStub.resolves({
        credentialsValid: false
      });

      request(sessionController)
        .post('/start')
        .send({'username': 'test', 'password': 'test'})
        .expect(401, done);
        
    });

    it('returns encrypted session token if credentials are ok', (done) => {
      const requestBody = {'username': 'test', 'password': 'test'};

      const expectedSessionTokenFragment = 'test';

      validateCredentialsStub.resolves({
        credentialsValid: true
      });

      request(sessionController)
        .post('/start')
        .send(requestBody)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);

          const { sessionToken } = res.body;
          
          expect(sessionToken.substr(0,4)).to.equal(expectedSessionTokenFragment);
          
          done();
        });
     
    });
  });

});



