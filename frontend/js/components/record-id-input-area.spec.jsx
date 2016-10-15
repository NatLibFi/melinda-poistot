import React from 'react';
import { renderIntoDocument } from 'react-addons-test-utils';
import {expect} from 'chai';

import { RecordIdInputArea } from './record-id-input-area';

describe('RecordIdInputArea', () => {
  let editorEl;
  let editor;
  let component;
  beforeEach(() => {
    component = renderIntoDocument(
      <RecordIdInputArea />
    );
    editor = component._editor;
    editorEl = editor.getWrapperElement();
  });

  it('has a CodeMirror editor', () => {
    expect(editor).to.be.an.object;
  });
  
  describe('when editor is set to disabled', () => {
    
    beforeEach(() => {
      component.componentWillReceiveProps({disabled: true});
    });
    
    it('sets the editor into readOnly mode', () => {
      expect(editor.getOption('readOnly')).to.equal(true);
    });
    it('adds CodeMirror-disabled class', () => {
      expect(editorEl.className.split(' ')).to.contain('CodeMirror-disabled');
    });
   
    describe('when editor is enabled afterwards', () => {
      beforeEach(() => {
        component.componentWillReceiveProps({disabled: false});
      });
      it('sets the editor into editable mode', () => {
        expect(editor.getOption('readOnly')).to.equal(false);
      });
      it('removes the CodeMirror-disabled class', () => {
        expect(editorEl.className.split(' ')).not.to.contain('CodeMirror-disabled');
      });

    });

  });

});