import React from 'react';
import {connect} from 'react-redux';
import '../../styles/main.scss';
import { removeSession } from '../action-creators/session-actions';

import { NavBar } from './navbar';
import { SigninFormPanelContainer } from './signin-form-panel';

export class BaseComponent extends React.Component {

  static propTypes = {
    sessionState: React.PropTypes.string.isRequired,
    removeSession: React.PropTypes.func.isRequired,
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
  
    return (
      <div>
        <NavBar onLogout={() => this.handleLogout()}/>
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
  };
}

export const BaseComponentContainer = connect(
  mapStateToProps,
  { removeSession }
)(BaseComponent);
