import React from 'react';
import CodeMirror from 'codemirror';
import { parse } from '../../../common/input-parser';
import _ from 'lodash';
import { MAX_VISIBLE_ERROR_AMOUNT } from '../constants/general-constants';
import { isFileApiSupported } from '../utils';

import '../../styles/components/record-id-input-area';

export class RecordIdInputArea extends React.Component {

  static propTypes = {  
    onChange: React.PropTypes.func.isRequired,
    recordParseErrors: React.PropTypes.array,
    readOnly: React.PropTypes.bool,
    submitStatus: React.PropTypes.string.isRequired,
  }
  
  constructor(props) {
    super(props);

    const readOnly = _.get(props, 'readOnly', false);

    this.state = {
      recordParseErrors: [],
      readOnly
    };
  }

  componentDidMount() {
    this._editor = CodeMirror.fromTextArea(this._textarea, {
      lineNumbers: true,
      gutters: ['CodeMirror-gutter-error']
    });

    const updater = _.debounce(this.handleUpdate.bind(this), 150);
    this._editor.on('change', updater);

  }

  componentWillReceiveProps(nextProps) {
    const readOnly = _.get(nextProps, 'readOnly', false);
    const { recordParseErrors, submitStatus } = nextProps;

    this.updateErrorMarkers(recordParseErrors || []);

    if (this.state.readOnly !== readOnly) {
      this.setReadOnly(readOnly || false);  
    }
    if (this.state.submitStatus === 'SUCCESS' && submitStatus === 'NOT_SUBMITTED') {
      this.clearEditor();
    }
    this.setState({ readOnly, submitStatus });
  }

  shouldComponentUpdate() {
    return false;
  }

  handleUpdate() {
    const value = this._editor.getValue();
    const list = parse(value);
    this.props.onChange(list);
  }

  updateErrorMarkers(nextParseErrors) {
    const visibleErrorMarkers = _.take(nextParseErrors, MAX_VISIBLE_ERROR_AMOUNT);

    const nextErrorRows = nextParseErrors.map(err => err.row).reduce((acc, row) => _.set(acc, row, true), {});

    this.state.recordParseErrors.forEach(err => {
      if (!nextErrorRows[err.row]) {
        const lineHandle = this._editor.getLineHandle(err.row);
        if (lineHandle) this._editor.setGutterMarker(lineHandle, 'CodeMirror-gutter-error', null);
      }
    });
    
    visibleErrorMarkers.forEach(visibleParseError => {
      const lineHandle = this._editor.getLineHandle(visibleParseError.row);
      const markers = _.get(lineHandle, 'gutterMarkers', {}) || {};
      const hasErrorMarker = Object.keys(markers).some(marker => marker == 'CodeMirror-gutter-error');

      if (!hasErrorMarker) {
        const marker = this.makeMarker(visibleParseError.error.message);
        if (lineHandle) this._editor.setGutterMarker(lineHandle, 'CodeMirror-gutter-error', marker);
      }
    });

    this.setState({
      recordParseErrors: visibleErrorMarkers
    });
  }

  setReadOnly(readOnlyFlag) {

    this._editor.setOption('readOnly', readOnlyFlag);
    if (readOnlyFlag) {
      window.$(this._editor.getWrapperElement()).addClass('CodeMirror-disabled');
    } else {
      window.$(this._editor.getWrapperElement()).removeClass('CodeMirror-disabled');
    }
  }

  clearEditor() {
    this._editor.setValue('');
  }
  
  makeMarker(msg) {
    var marker = window.$(`<i class="material-icons gutter-tooltip" title="${msg}">error_outline</i>`).get(0);
    marker.style.color = '#822';
    return marker;
  }

  handleFileSelect(event) {
    const fileList = event.target.files;

    if (fileList.length > 0) {
      const file = fileList[0];
      const reader = new FileReader();

      this.clearEditor();
      reader.addEventListener('load', (e) => {
        const fileContents = e.target.result;
        this._editor.setValue(fileContents);
      });

      reader.readAsText(file);
    }
  }

  renderFileUploadInput() {

    if (!isFileApiSupported()) {
      return null;
    }

    return (    
      <div className="file-field input-field">
        <div className="btn">
          <span>TIEDOSTO</span>
          <input type="file" ref={(c) => this._fileInput = c} onChange={(e) => this.handleFileSelect(e)}/>
        </div>
        <div className="file-path-wrapper">
          <input className="file-path validate" type="text" />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="record-id-input-controls">
        { this.renderFileUploadInput() }

        <div className="record-id-input-container">
          <textarea className="record-id-input" ref={(c) => this._textarea = c} />
        </div>
      </div>
    );
  }
}
