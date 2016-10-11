import React from 'react';
import '../../styles/main.scss';

export class App extends React.Component {

  static propTypes = {
    children: React.PropTypes.element.isRequired
  }

  render() {
    return this.props.children;
  }
}
