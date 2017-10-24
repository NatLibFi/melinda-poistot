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

    const replicationEnabledMessage = 'Huomaa, että poistot paikalliskannasta toimivat vain, jos paikalliskannan tietueessa on 035 $a-osakentässä FCC-alkuinen Melinda-ID. Tietueeseen ei myöskään saa olla linkattuna varasto- tai tilaustietoja. Poistojen replikoiminen paikalliskantaan voi hidastaa muiden tietueiden siirtymistä Melindasta kaikkiin paikalliskantoihin.';

    return (
      <p>
        <input type="checkbox" className="filled-in" id="replicate-records-option" onChange={(e) => this.handleReplicateOptionChange(e)} checked={this.props.replicateRecords} />
        <label htmlFor="replicate-records-option">Haluan poistojen replikoituvan paikalliskantaan</label>
        <span className={replicateRecordsTipClasses}>{replicationEnabledMessage}</span>
      </p>
    );
  }

  renderRemoveRecordCheckbox() {
    const deleteRecordTipClasses = classNames('checkbox-tip', {
      visible: this.props.deleteUnusedRecords
    });

    const unusedRemovalEnabledMessage = 'Poista Melindasta vain turhat tietueet (esim. virhetietueet, tuplat, tai kokonaan poistetut opetusmonisteet), älä sellaisia, joista voi olla vielä iloa muille.';

    return ( 
      <p>
        <input type="checkbox" className="filled-in" id="delete-record-option" onChange={(e) => this.handleDeleteOptionChange(e)} checked={this.props.deleteUnusedRecords} />
        <label htmlFor="delete-record-option">Poista koko tietue Melindasta, jos siihen ei jää yhteen tietokantatunnusta</label>
        <span className={deleteRecordTipClasses}>{unusedRemovalEnabledMessage}</span>
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
    deleteUnusedRecords: state.getIn(['recordListForm', 'deleteUnusedRecords']),
    replicateRecords: state.getIn(['recordListForm', 'replicateRecords'])
  };
}

export const JobConfigurationPanelContainer = connect(
  mapStateToProps,
  { setSelectedLowTag, setDeleteOption, setReplicateOption }
)(JobConfigurationPanel);
