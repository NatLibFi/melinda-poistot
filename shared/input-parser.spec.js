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
*/import { expect } from 'chai';
import { parse } from './input-parser';

const VALID_INPUT = `
1184996 FCC001173048
1184997  
(FI-MELINDA)0011730411  
1184991 FCC001173041 FCC001173044
`.trim();

const SOME_INVALID_INPUT = `
1184996 FCC001173048
FCC001173048  
1184997 FCC001173047

asd
`.trim();

const INVALID_INPUT_MULTIPLE_IDENTICAL_ROWS = `
1184996 FCC001173048
1184997 FCC001173047
1184996 FCC001173042
1184997  
(FI-MELINDA)0011730411  

1184991 FCC001173041 FCC001173044
1184997 FCC001173047
`.trim();


describe('Format parser', () => {

  describe('with valid input', () => {
    let result;
    beforeEach(() => {
      result = parse(VALID_INPUT);
    });

    it('creates one item for each row', () => {
      expect(result.length).to.equal(4);
    });

    it('extracts the local id', () => {
      expect(result[0].localId).to.equal('1184996');
    });

    it('extracts the links array', () => {
      expect(result[0].links).to.eql(['FCC001173048']);
    });

    it('extracts the melinda id', () => {
      expect(result[2].melindaId).to.eql('0011730411');
    });

  });

  describe('with some invalid input', () => {
    let result;
    beforeEach(() => {
      result = parse(SOME_INVALID_INPUT);
    });

    it('creates one item for each row', () => {
      expect(result.length).to.equal(5);
    });

    it('extracts the local id for valid row', () => {
      expect(result[0].localId).to.equal('1184996');
    });

    it('extracts the links array for valid row', () => {
      expect(result[0].links).to.eql(['FCC001173048']);
    });

    it('adds error message to invalid rows', () => {
      expect(result[1]).be.instanceof(Error);
      expect(result[4]).be.instanceof(Error);
    });
    
    it('sets empty rows as undefined', () => {
      expect(result[3]).be.undefined;
    });

  });


  describe('with invalid input of multiple identical rows', () => {
    let result;
    beforeEach(() => {
      result = parse(INVALID_INPUT_MULTIPLE_IDENTICAL_ROWS);
    });

    it('adds error message for first row that is a duplicate in the set', () => {
      expect(result[1]).be.instanceof(Error);
      expect(result[1].message).to.equal('Rivi on identtinen rivin 8 kanssa.');
    });

  });

});
