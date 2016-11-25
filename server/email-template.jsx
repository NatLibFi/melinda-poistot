import React from 'react';
import _ from 'lodash';

export class ReportEmail extends React.Component {

  static propTypes = {
    taskResults: React.PropTypes.array.isRequired
  }

  renderRow(taskResult, key) {

    const {lowTag} = taskResult;
    const recordId = _.get(taskResult, 'recordId', 'ID-NOT-FOUND');
    const localId = _.get(taskResult.recordIdHints, 'localId' ,'');

    const meta = { lowTag, recordId, localId };

    if (taskResult.taskFailed) {
      return this.renderFailedTask(taskResult, meta, key);
    } else {
      return this.renderCompletedTask(taskResult, meta, key);
    }
  }

  renderFailedTask(taskResult, meta, key) {
    const { lowTag, recordId, localId } = meta;
    const status = 'VIRHE';

    return (
      <tr key={key} style={{color: 'red'}}>
        <td>{recordId}</td>
        <td>{localId}</td>
        <td>{lowTag}</td>
        <td>{status}</td>
        <td>{taskResult.failureReason}</td>
      </tr>
    );
  }

  renderCompletedTask(taskResult, meta, key) {
    const { lowTag, recordId, localId } = meta;

    const report = _.get(taskResult, 'report', []).join(', ');
    const {code, message} = _.head(taskResult.updateResponse.messages);

    const status = code === 20 ? 'OK' : code;
    return (
      <tr key={key}>
        <td>{recordId}</td>
        <td>{localId}</td>
        <td>{lowTag}</td>
        <td>{status}</td>
        <td>{message}</td>
        <td>{report}</td>
      </tr>
    );

  }

  render() {
    const rows = this.props.taskResults || [];
    const renderRow = this.renderRow.bind(this);

    const columnStyle = {
      paddingRight: '35px'
    };

    return (
      <table cellSpacing="0" cellPadding="0">
        <thead>
          <tr style={{textAlign: 'left'}}>
            <th style={columnStyle}>melinda-id</th>
            <th style={columnStyle}>local-id</th>
            <th style={columnStyle}>lowTag</th>
            <th style={columnStyle}>status</th>
            <th style={columnStyle}>message</th>
            <th style={columnStyle}>report</th>
          </tr>
        </thead>
        <tbody>
        {rows.map(renderRow)}
        </tbody>
      </table>
    );
  }
}
