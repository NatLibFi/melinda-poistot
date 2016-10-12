import React from 'react';
import {connect} from 'react-redux';
import _ from 'lodash';
import '../../styles/main.scss';
import { removeSession } from '../action-creators/session-actions';

import { NavBar } from './navbar';
import { SigninFormPanelContainer } from './signin-form-panel';
import { JobConfigurationPanelContainer } from './job-configuration-panel';

export class BaseComponent extends React.Component {

  static propTypes = {
    sessionState: React.PropTypes.string.isRequired,
    removeSession: React.PropTypes.func.isRequired,
    userinfo: React.PropTypes.object,
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
    userinfo: state.getIn(['session', 'userinfo'])
  };
}

export const BaseComponentContainer = connect(
  mapStateToProps,
  { removeSession }
)(BaseComponent);
