import React from 'react';

import '../../styles/components/example-cards.scss';

export class ExampleCardMelindaId extends React.Component {
  render() {
    return (
      <div className="card info-card">
        <div className="card-content">
          <span className="card-title">Melindan tietuetunnisteen perusteella</span>
        
          <p>Tietueita voi listata myös Melinda tietuetunnisteen avulla seuraavasti:</p>
          <div className="block">
            <span className="legend">MELINDA_ID</span>
            <span>(FI-MELINDA)001173048</span>
            <span>(FI-MELINDA)001167257</span>
          </div>
          
        </div>
      </div>
    );
  }
}
