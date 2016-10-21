import React from 'react';
import CodeMirror from 'codemirror';
import { parse } from '../../../common/input-parser';
import _ from 'lodash';

import '../../styles/components/record-id-input-area';

const MAX_VISIBLE_ERROR_AMOUNT = 20;

export class RecordIdInputArea extends React.Component {

  static propTypes = {  
    onChange: React.PropTypes.func.isRequired,
    recordParseErrors: React.PropTypes.array
  }
  
  constructor(props) {
    super(props);
    this.state ={
      recordParseErrors: []
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

    this.updateErrorMarkers(nextProps.recordParseErrors || []);

    if (nextProps.disabled) {
      this._editor.setOption('readOnly', true);
      window.$(this._editor.getWrapperElement()).addClass('CodeMirror-disabled');
    } else {
      this._editor.setOption('readOnly', false);
      window.$(this._editor.getWrapperElement()).removeClass('CodeMirror-disabled');
    }
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
    const currentErrorRows = this.state.recordParseErrors.map(err => err.row).reduce((acc, row) => _.set(acc, row, true), {});

    
    this.state.recordParseErrors.forEach(err => {
      if (!nextErrorRows[err.row]) {
        this._editor.setGutterMarker(err.row, 'CodeMirror-gutter-error', null);
      }
    });

    visibleErrorMarkers.forEach(err => {
      if (!currentErrorRows[err.row]) {
        const marker = this.makeMarker();
        this._editor.setGutterMarker(err.row, 'CodeMirror-gutter-error', marker);        
      }
    });

    this.setState({
      recordParseErrors: visibleErrorMarkers
    });
  }
  
  makeMarker() {
    var marker = window.$('<i class="material-icons gutter-tooltip" title="Tämä rivi ei ole sallitussa muodossa">error_outline</i>').get(0);
    marker.style.color = '#822';
    return marker;
  }

  render() {
    return (
      <div className="record-id-input-container">
        <textarea className="record-id-input" ref={(c) => this._textarea = c} />
      </div>
    );
  }
}
