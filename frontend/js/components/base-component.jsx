import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import '../../styles/main.scss';
import { removeSession } from '../action-creators/session-actions';
import { setRecordIdList, submitJob } from '../action-creators/job-configuration-actions';
import { NavBar } from './navbar';
import { SigninFormPanelContainer } from './signin-form-panel';
import { JobConfigurationPanelContainer } from './job-configuration-panel';
import { RecordIdInputArea } from './record-id-input-area';
import { StatusCard } from './status-card';
import { validRecordCount } from '../selectors/record-list-selectors';

export class BaseComponent extends React.Component {

  static propTypes = {
    sessionState: React.PropTypes.string.isRequired,
    removeSession: React.PropTypes.func.isRequired,
    setRecordIdList: React.PropTypes.func.isRequired,
    submitJob: React.PropTypes.func.isRequired,
    userinfo: React.PropTypes.object,
    validRecordCount: React.PropTypes.number,
    submitStatus: React.PropTypes.string.isRequired
  }

  handleLogout() {
    this.props.removeSession();
  }

  renderValidationIndicator() {
    return null;
  }

  renderSignin() {
    if (this.props.sessionState === 'VALIDATION_ONGOING') {
      return this.renderValidationIndicator();
    } else {
      return (<SigninFormPanelContainer title='melinda-local-ref-removal'/>);
    }
  }

  renderMainPanel() {

    const firstName = _.head(_.get(this.props.userinfo, 'name', '').split(' '));
  
    return (
      <div>
        <NavBar 
          onLogout={() => this.handleLogout()}
          username={firstName}
          appTitle='Tietokantatunnusten poisto Melindasta'
        />
        <JobConfigurationPanelContainer />

        <div className="row">
          <div className="col s6 l4 offset-l1">
            <RecordIdInputArea onChange={(list) => this.props.setRecordIdList(list)} />
          </div>

          <div className="col s6 l5">
            <StatusCard 
              onSubmitList={() => this.props.submitJob()} 
              validRecordCount={this.props.validRecordCount}
              userinfo={this.props.userinfo}
              submitStatus={this.props.submitStatus}
              />
          </div>
        </div>


        
      </div>
    );
  }

  render() {

    if (this.props.sessionState == 'SIGNIN_OK') {
      return this.renderMainPanel();
    } else if (this.props.sessionState == 'VALIDATION_ONGOING') {
      return this.renderValidationIndicator();
    } else {
      return this.renderSignin();
    }

  }
}

function mapStateToProps(state) {

  return {
    sessionState: state.getIn(['session', 'state']),
    userinfo: state.getIn(['session', 'userinfo']),
    validRecordCount: validRecordCount(state),
    submitStatus: state.getIn(['jobconfig', 'submitStatus'])
  };
}

export const BaseComponentContainer = connect(
  mapStateToProps,
  { removeSession, setRecordIdList, submitJob }
)(BaseComponent);
