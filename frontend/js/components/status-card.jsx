import React from 'react';

import '../../styles/components/status-card';

export class StatusCard extends React.Component {
  static propTypes = {
    onSubmitList: React.PropTypes.func.isRequired,
    validRecordCount: React.PropTypes.number,
    userinfo: React.PropTypes.object
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.onSubmitList();
  }

  render() {
    const userEmail = this.props.userinfo.email || '(sähköposti puuttuu)';

    return (
      <div className="status-card-container">
        <div className="card status-card">
          <div className="card-content">
            <span className="card-title"><i className='material-icons medium'>playlist_add_check</i>Tietuelistaus on valmiina</span>
        
            <p>Saat raportin sähköpostin osoitteeseen {userEmail} kun poistot on tehty</p>

            <p>Olet lähettämässä {this.props.validRecordCount} tietuetta käsiteltäväksi.</p>
          </div>
          
          <div className="card-action right-align">
            <a href="#" onClick={(e) => this.onSubmit(e)}>Lähetä käsiteltäväksi</a>
          </div>
        </div>
      </div>
    );    
  }
}
