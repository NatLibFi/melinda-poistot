import {expect} from 'chai';
import { authProvider } from './melinda-auth-provider';
import { __RewireAPI__ as AuthProviderRewireAPI } from './melinda-auth-provider';
import sinon from 'sinon';
import sinonAsPromised from 'sinon-as-promised'; // eslint-disable-line

describe('melinda auth provider', () => {

  describe('validateCredentials', () => {
    let fetchStub;

    beforeEach(() => {
      fetchStub = sinon.stub();
      AuthProviderRewireAPI.__Rewire__('fetch', fetchStub);
    });
    afterEach(() => {
      AuthProviderRewireAPI.__ResetDependency__('fetch');
    });

    describe('with valid credentials', () => {
      let response;
      beforeEach(() => {
        fetchStub.resolves({
          text: sinon.stub().resolves(result_ok)
        });
        return authProvider.validateCredentials('master', 'master').then(res => {
          response = res;
        });
      });

      it('returns credentialsValid=true', function() {
        expect(response.credentialsValid).to.equal(true);
      });
      it('returns userinfo', function() {
        expect(response.userinfo).to.eql({
          'department': 'testlab',
          'email': 'user.name@testlab',
          'name': 'user name',
          'userLibrary': 'LIBRA'
        });
      });

    });

    describe('with invalid credentials', () => {
      let response;
      beforeEach(() => {
        fetchStub.resolves({
          text: sinon.stub().resolves(result_fail)
        });

        return authProvider.validateCredentials('master', 'master').then(res => {
          response = res;
        });
      });

      it('returns credentialsValid=false', function() {
        expect(response.credentialsValid).to.equal(false);
      });
      
      it('does not return userinfo', function() {
        expect(response.userinfo).to.be.undefined;
      });

    });

  });
});

const result_ok = `
<?xml version = "1.0" encoding = "UTF-8"?>
<user-auth>
<reply>ok</reply>
<z66>
<z66-user-library>LIBRA</z66-user-library>
<z66-name>user name</z66-name>
<z66-department>testlab</z66-department>
<z66-email>user.name@testlab</z66-email>
<z66-address></z66-address>
<z66-telephone></z66-telephone>
<z66-note-1></z66-note-1>
<z66-note-2></z66-note-2>
<z66-user-cat-level>30</z66-user-cat-level>
<z66-function-proxy></z66-function-proxy>
<z66-catalog-proxy></z66-catalog-proxy>
<z66-budget-proxy></z66-budget-proxy>
<z66-order-unit-proxy></z66-order-unit-proxy>
<z66-user-own-create></z66-user-own-create>
<z66-user-own-check></z66-user-own-check>
<z66-user-circ-level>00</z66-user-circ-level>
<z66-ill-unit></z66-ill-unit>
<z66-open-date></z66-open-date>
<z66-update-date></z66-update-date>
<z66-expiry-date></z66-expiry-date>
<z66-last-alert-date></z66-last-alert-date>
<z66-last-login-date></z66-last-login-date>
<z66-block>N</z66-block>
<z66-block-reason></z66-block-reason>
<z66-no-fail>0</z66-no-fail>
<z66-erm-user></z66-erm-user>
<z66-erm-password></z66-erm-password>
</z66>
<session-id></session-id>
</user-auth>`;

const result_fail = `
<?xml version = "1.0" encoding = "UTF-8"?>
<user-auth>
<error>No such staff member exist. Make sure both user and password are correct.</error>
<session-id></session-id>
</user-auth>`;