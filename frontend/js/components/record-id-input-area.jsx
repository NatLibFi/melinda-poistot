import React from 'react';
import CodeMirror from 'codemirror';

import '../../styles/components/record-id-input-area';

export class RecordIdInputArea extends React.Component {

  static propTypes = {  
    onChange: React.PropTypes.func.isRequired
  }

  componentDidMount() {
    this._editor = CodeMirror.fromTextArea(this._textarea, {
      lineNumbers: true,
      gutters: ['CodeMirror-gutter-error']
    });

    this._editor.on('change', () => {
      const value = this._editor.getValue();

      const list = value.split('\n');
      
      this.props.onChange(list);
    });

  }

  componentWillReceiveProps(nextProps) {
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
