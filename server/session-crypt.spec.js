import { expect } from 'chai';
import { createSessionToken, readSessionToken } from './session-crypt';

const USERNAME = 'test_username';
const PASSWORD = 'password';

describe('Session crypt', () => {
  describe('createSessionToken', () => {
    it('generates session token', () => {

      const generatedSessionToken = createSessionToken(USERNAME, PASSWORD);
      
      expect(generatedSessionToken).to.be.a('string');
      expect(generatedSessionToken.split(':')).to.have.length.of(4);

    });
  });

  describe('readSessionToken', () => {
    it('reads a generated session token and returns credentials', () => {

      const generatedSessionToken = createSessionToken(USERNAME, PASSWORD);
      
      const credentials = readSessionToken(generatedSessionToken);

      expect(credentials).to.eql({
        username: USERNAME,
        password: PASSWORD
      });

    });


    it('fails when the username is tampered with', () => {

      const generatedSessionToken = createSessionToken(USERNAME, PASSWORD);

      const tamperedSessionToken = generatedSessionToken.split(':')
        .map((val, i) => i == 0 ? 'changed_username' : val)
        .join(':');

      expect(() => {
        readSessionToken(tamperedSessionToken);
      }).to.throw('Unsupported state or unable to authenticate data');

    });
    
  });

});
