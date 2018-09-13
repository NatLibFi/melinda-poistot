/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for removing references to local databases from Melinda
*
* Copyright (C) 2016-2017 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-local-ref-removal-ui
*
* melinda-local-ref-removal-ui program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-local-ref-removal-ui is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/

import { JSDOM } from 'jsdom';
import chai from 'chai';
import chaiImmutable from 'chai-immutable';

const { window } = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://foo.bar' });
const { document } = window;
// const win = doc.defaultView;

global.document = document;
global.window = window;
global.__DEV__ = true;

global.window.$ = require('jquery');

Object.keys(window).forEach((key) => {
  if (!(key in global)) {
    global[key] = window[key];
  }
});

chai.use(chaiImmutable);

global.document.createRange = function() {
  return {
    setEnd: function(){},
    setStart: function(){},
    getBoundingClientRect: function(){
      return {right: 0};
    }
  };
};
