import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import '../../styles/main.scss';
import { removeSession } from '../action-creators/session-actions';
import { setRecordIdList, submitJob } from '../action-creators/job-configuration-actions';
import { resetWorkspace } from '../action-creators/ui-actions';
import { NavBar } from './navbar';
import { SigninFormPanelContainer } from './signin-form-panel';
import { JobConfigurationPanelContainer } from './job-configuration-panel';
import { RecordIdInputArea } from './record-id-input-area';
import { StatusCard } from './status-card';
import { validRecordCount, recordParseErrors, editorIsReadOnly, submitEnabled } from '../selectors/record-list-selectors';

export class BaseComponent extends React.Component {

  static propTypes = {
    sessionState: React.PropTypes.string.isRequired,
    removeSession: React.PropTypes.func.isRequired,
    setRecordIdList: React.PropTypes.func.isRequired,
    resetWorkspace: React.PropTypes.func.isRequired,
    submitJob: React.PropTypes.func.isRequired,
    userinfo: React.PropTypes.object,
    validRecordCount: React.PropTypes.number,
    submitStatus: React.PropTypes.string.isRequired,
    submitJobError: React.PropTypes.string,
    recordParseErrors: React.PropTypes.array,
    editorIsReadOnly: React.PropTypes.bool,
    submitEnabled: React.PropTypes.object
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
            <RecordIdInputArea 
              submitStatus={this.props.submitStatus}
              recordParseErrors={this.props.recordParseErrors}
              onChange={(list) => this.props.setRecordIdList(list)}
              readOnly={this.props.editorIsReadOnly} />
          </div>

          <div className="col s6 l5">
            <StatusCard 
              onSubmitList={() => this.props.submitJob()} 
              validRecordCount={this.props.validRecordCount}
              userinfo={this.props.userinfo}
              submitStatus={this.props.submitStatus}
              submitJobError={this.props.submitJobError}
              submitEnabled={this.props.submitEnabled}
              recordParseErrors={this.props.recordParseErrors}
              onStartNewList={() => this.props.resetWorkspace()}
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
    recordParseErrors: recordParseErrors(state),
    submitStatus: state.getIn(['jobconfig', 'submitStatus']),
    submitJobError: state.getIn(['jobconfig', 'submitJobError']),
    editorIsReadOnly: editorIsReadOnly(state),
    submitEnabled: submitEnabled(state)
  };
}

export const BaseComponentContainer = connect(
  mapStateToProps,
  { removeSession, setRecordIdList, submitJob, resetWorkspace }
)(BaseComponent);
