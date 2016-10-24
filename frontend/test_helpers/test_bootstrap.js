import jsdom from 'jsdom';
import chai from 'chai';
import chaiImmutable from 'chai-immutable';

const doc = jsdom.jsdom('<!doctype html><html><body></body></html>');
const win = doc.defaultView;

global.document = doc;
global.window = win;
global.__DEV__ = true;

global.window.$ = require('jquery');

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

chai.use(chaiImmutable);

doc.createRange = function() {
  return {
    setEnd: function(){},
    setStart: function(){},
    getBoundingClientRect: function(){
      return {right: 0};
    }
  };
};