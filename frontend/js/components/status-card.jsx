import React from 'react';
import { Preloader } from './preloader';

import '../../styles/components/status-card';


export class StatusCard extends React.Component {
  static propTypes = {
    onSubmitList: React.PropTypes.func.isRequired,
    validRecordCount: React.PropTypes.number,
    userinfo: React.PropTypes.object,
    submitStatus: React.PropTypes.string.isRequired
  }

  onSubmit(event) {
    event.preventDefault();
    this.props.onSubmitList();
  }

  renderSuccessCard() {
    const userEmail = this.props.userinfo.email || '(sähköposti puuttuu)';

    return (
      <div className="status-card-container">
        <div className="card status-card status-card-success">
          <div className="card-content">
            <span className="card-title"><i className='material-icons medium'>done_all</i>Tietuelistaus on lähetetty käsiteltäväksi</span>
            <p>Listan {this.props.validRecordCount} tietuetta on lähetetty käsiteltäväksi.</p>
            <p>Saat vielä sähköpostin osoitteeseen {userEmail} kun tietueet on käsitelty.</p>
          </div>
        </div>
      </div>
    );
  }

  renderDefaultCard() {
    const userEmail = this.props.userinfo.email || '(sähköposti puuttuu)';

    return (
      <div className="status-card-container">
        <div className="card status-card">
          <div className="card-content">
            <span className="card-title"><i className='material-icons medium'>playlist_add_check</i>Tietuelistaus on valmiina lähettäväksi</span>
            {this.props.submitStatus}
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

  render() {

    if (this.props.submitStatus == 'ONGOING') {
      return (
        <div className="status-card-container">
          <div className="card status-card">
            <div className="card-content">
              <Preloader />
            </div>
          </div>
        </div>
      );
    } else if (this.props.submitStatus == 'SUCCESS') {
      return this.renderSuccessCard();
    } else {
      return this.renderDefaultCard();
    }

  }
}
