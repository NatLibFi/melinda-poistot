import React from 'react';
import {connect} from 'react-redux';
import { setSelectedLowTag, setDeleteOption, setReplicateOption } from '../action-creators/record-list-form-actions';
import '../../styles/components/job-configuration-panel';
import { LowTagSelectField } from './lowtag-select-field';
import _ from 'lodash';
import classNames from 'classnames';

export class JobConfigurationPanel extends React.Component {
  static propTypes = {
    availableLowTags: React.PropTypes.array.isRequired,
    setSelectedLowTag: React.PropTypes.func.isRequired,
    setDeleteOption:  React.PropTypes.func.isRequired,
    setReplicateOption:  React.PropTypes.func.isRequired,
    deleteUnusedRecords: React.PropTypes.bool.isRequired,
    replicateRecords: React.PropTypes.bool.isRequired
  }

  handleDeleteOptionChange(event) {
    this.props.setDeleteOption(event.target.checked);
  }  

  handleReplicateOptionChange(event) {
    this.props.setReplicateOption(event.target.checked);
  }

  renderReplicationCheckbox() {
    const replicateRecordsTipClasses = classNames('checkbox-tip', {
      visible: this.props.replicateRecords
    });

    return (
      <p>
        <input type="checkbox" className="filled-in" id="replicate-records-option" onChange={(e) => this.handleReplicateOptionChange(e)} checked={this.props.replicateRecords} />
        <label htmlFor="replicate-records-option">Haluan poistojen replikoituvan paikalliskantaan</label>
        <span className={replicateRecordsTipClasses}>Tietuejoukon replikointi paikalliskantaan hidastaa muiden tietueiden siirtymistä melindasta paikalliskantaan.</span>
      </p>
    );
  }

  renderRemoveRecordCheckbox() {
    const deleteRecordTipClasses = classNames('checkbox-tip', {
      visible: this.props.deleteUnusedRecords
    });

    return ( 
      <p>
        <input type="checkbox" className="filled-in" id="delete-record-option" onChange={(e) => this.handleDeleteOptionChange(e)} checked={this.props.deleteUnusedRecords} />
        <label htmlFor="delete-record-option">Poista tietue Melindasta jos siihen ei jää yhtään tietokantatunnusta.</label>
        <span className={deleteRecordTipClasses}>Poista Melindasta vain turhat tietueet, älä sellasia joista on iloa muille.</span>
      </p>
    );
  }

  render() {

    return (
      <div className="job-configuration-container">

        <div className="row">
          <div className="col l7 s10 offset-l1">
            <h5>Tietokantatunnusten poiston asetukset</h5>
          </div>
        </div>

        <div className="row">
          <div className="col l7 s10 offset-l1">
            <form autoComplete="off">
              <LowTagSelectField availableLowTags={this.props.availableLowTags} onSelectLowTag={(lowtag) => this.props.setSelectedLowTag(lowtag)} />
              { this.renderReplicationCheckbox() }
              { this.renderRemoveRecordCheckbox() }
            </form>
          </div>
        </div>

      </div>
    );
  }
}

function mapStateToProps(state) {

  const userinfo = state.getIn(['session', 'userinfo']);
  const availableLowTags = _.get(userinfo, 'lowtags', []);

  return {
    availableLowTags,
    deleteUnusedRecords: state.getIn(['jobconfig', 'deleteUnusedRecords']),
    replicateRecords: state.getIn(['jobconfig', 'replicateRecords'])
  };
}

export const JobConfigurationPanelContainer = connect(
  mapStateToProps,
  { setSelectedLowTag, setDeleteOption, setReplicateOption }
)(JobConfigurationPanel);
