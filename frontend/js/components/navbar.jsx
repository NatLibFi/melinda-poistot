import React from 'react';
import '../../styles/components/navbar.scss';

export class NavBar extends React.Component {

  static propTypes = {
    onLogout: React.PropTypes.func.isRequired,
    appTitle: React.PropTypes.string.isRequired,
    username: React.PropTypes.string
  }

  componentDidMount() {
    
    window.$('.dropdown-button').dropdown({
      inDuration: 300,
      outDuration: 225,
      constrain_width: false,
      hover: false,
      gutter: 0,
      belowOrigin: true,
      alignment: 'right'
    });
  }

  render() {
    const { username, appTitle } = this.props;

    return (
      <div className="navbar">
        <nav> 
          <div className="nav-wrapper">
            <ul id="nav" className="left">
              <li className="heading">{appTitle}</li>
            </ul>        
            <ul id="nav" className="right">
              <li><a className="dropdown-button dropdown-button-menu" href="#" data-activates="mainmenu"><i className="material-icons right">more_vert</i>{username ? username : ''}</a></li>
            </ul>
          </div>
        </nav>

        <ul id='mainmenu' className='dropdown-content'>
          <li className="divider" />
          <li><a href="#" onClick={this.props.onLogout}>Kirjaudu ulos</a></li>
        </ul>
      </div>
    );
  }
} 
