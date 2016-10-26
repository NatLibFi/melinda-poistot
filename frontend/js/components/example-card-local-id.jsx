import React from 'react';

import '../../styles/components/example-cards.scss';

export class ExampleCardLocalId extends React.Component {

  render() {
    return (
      <div className="card info-card">
        <div className="card-content">
          <span className="card-title">Paikalliskannan tietuetunnisteen perusteella</span>

          <p>Mikäli tietueessa on 035 kentän osakentässä a tai z FCC­-alkuisia Melinda tietuetunnisteita, niin ne on lisättävä seuraavasti:</p>
          <div className="block">
            <span className="legend">BIB_ID  035</span>
            <span>1184996 FCC001173048</span>
            <span>1185010 FCC001167257</span>
            <span>1185286 FCC001175965</span>
          </div>

          <p>Jos tietueessa on useita FCC alkuisia tunnisteita, niin ne kaikki on lisättävä seuraavasti:</p>
          <div className="block">
            <span className="legend">BIB_ID  035          035</span>
            <span>1185010 FCC001167257 FCC001173048</span>
            <span>1185286 FCC001175965 FCC001167257</span>
          </div>

          <p>Mikäli tietueessa ei ole laisinkaan 035 kenttiä joissa on FCC alkuisia Melinda tietotunnisteita, niin tietueen voi listata pelkällä paikalliskannan tietuetunnisteella</p>
          <div className="block">
            <span className="legend">BIB_ID</span>
            <span>1185010</span>
            <span>1185286</span>
          </div>

        </div>
      </div>
    );
  }
}
