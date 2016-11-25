import React from 'react';

import '../../styles/components/example-cards.scss';

export class ExampleCardMelindaId extends React.Component {
  render() {
    return (
      <div className="card info-card">
        <div className="card-content">
          <span className="card-title">Poistot Melindan tietuetunnisteen perustella</span>
        
          <p>Tietueita voi listata myös Melindan tietuetunnisteen avulla seuraavasti:</p>
          <div className="block">
            <span className="legend">MELINDA_ID</span>
            <span>(FI-MELINDA)001173048</span>
            <span>(FI-MELINDA)001167257</span>
          </div>

          <p>Melindan tietuetunniste löytyy paikalliskannan tietueen kentästä 035 $a mm. Aurora-paikalliskannoissa.</p>          
        </div>
      </div>
    );
  }
}
