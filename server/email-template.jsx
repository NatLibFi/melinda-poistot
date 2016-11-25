import React from 'react';
import _ from 'lodash';

export class ReportEmail extends React.Component {

  static propTypes = {
    taskResults: React.PropTypes.array.isRequired,
    jobId: React.PropTypes.string.isRequired
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
      <div>
      <p>Melindan poistot-käyttöliittymästä lähettämäsi tietuelistaus on käsitelty. Alta näet tulokset tietuekohtaisesti.</p>
      <p>Tähän viestiin ei voi vastata. Tarvittaessa ota yhteyttä Melinda-tukeen (melinda-posti@helsinki.fi) 
      ja liitä viestiisi poistoajon id: job ${this.props.jobId}</p>
      
      <table cellSpacing="0" cellPadding="0">
        <thead>
          <tr style={{textAlign: 'left'}}>
            <th style={columnStyle}>Melinda-ID</th>
            <th style={columnStyle}>paikalliskannan ID</th>
            <th style={columnStyle}>tietokantatunnus</th>
            <th style={columnStyle}>tila</th>
            <th style={columnStyle}>viesti</th>
            <th style={columnStyle}>raportti</th>
          </tr>
        </thead>
        <tbody>
        {rows.map(renderRow)}
        </tbody>
      </table>
      </div>
    );
  }
}