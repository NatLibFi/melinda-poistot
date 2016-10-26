import React from 'react';
import {connect} from 'react-redux';
import { setSelectedLowTag, setDeleteOption } from '../action-creators/job-configuration-actions';
import '../../styles/components/job-configuration-panel';
import { LowTagSelectField } from './lowtag-select-field';
import _ from 'lodash';
import classNames from 'classnames';

export class JobConfigurationPanel extends React.Component {
  static propTypes = {
    availableLowTags: React.PropTypes.array.isRequired,
    setSelectedLowTag: React.PropTypes.func.isRequired,
    setDeleteOption:  React.PropTypes.func.isRequired,
    deleteUnusedRecords: React.PropTypes.bool.isRequired
  }

  handleDeleteOptionChange(event) {
    this.props.setDeleteOption(event.target.checked);
  }

  renderReplicationCheckbox() {
    return (
      <p>
        <input type="checkbox" className="filled-in" id="filled-in-box" />
        <label htmlFor="filled-in-box">Haluan poistojen replikoituvan paikalliskantaan</label>
        <span className="checkbox-tip">Tämä näkyy vain jos checkbox on raksittu</span>
      </p>
    );
  }

  renderRemoveRecordCheckbox() {
    return ( 
      <p>
        <input type="checkbox" className="filled-in" id="filled-in-box-2" />
        <label htmlFor="filled-in-box-2">Poista tietue Melindasta jos siihen ei jää yhtään tietokantatunnusta</label>
        <span className="checkbox-tip">Poista vain turhat tietueet kuten älä sellasia mistä on iloa muille.</span>
      </p>
    );
  }

  render() {

    const deleteRecordTipClasses = classNames('checkbox-tip', {
      visible: this.props.deleteUnusedRecords
    });

    return (
      <div className="job-configuration-container">

        <div className="row">
          <div className="col l5 s8 offset-l1">
            <h5>Tietokantatunnusten poiston asetukset</h5>
          </div>
        </div>

        <div className="row">
          <div className="col l5 s8 offset-l1">
            <form autoComplete="off">
              <LowTagSelectField availableLowTags={this.props.availableLowTags} onSelectLowTag={(lowtag) => this.props.setSelectedLowTag(lowtag)} />

              <p>
                <input type="checkbox" className="filled-in" id="delete-record-option" onChange={(e) => this.handleDeleteOptionChange(e)} checked={this.props.deleteUnusedRecords} />
                <label htmlFor="delete-record-option">Poista tietue Melindasta jos siihen ei jää yhtään tietokantatunnusta</label>
                <span className={deleteRecordTipClasses}>Poista Melindasta vain turhat tietueet, älä sellasia joista on iloa muille.</span>
              </p>
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
    deleteUnusedRecords: state.getIn(['jobconfig', 'deleteUnusedRecords'])
  };
}

export const JobConfigurationPanelContainer = connect(
  mapStateToProps,
  { setSelectedLowTag, setDeleteOption }
)(JobConfigurationPanel);
