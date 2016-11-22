import React from 'react';

import '../../styles/components/example-cards.scss';

export class ExampleCardLocalId extends React.Component {

  render() {
    return (
      <div className="card info-card">
        <div className="card-content">
          <span className="card-title">Poistot paikalliskannan tietuetunnisteen perusteella</span>

          <p>Listaa paikalliskannan tietuetunniste eli bibid:</p>
          <div className="block">
            <span className="legend">BIB_ID</span>
            <span>1185010</span>
            <span>1185286</span>
          </div>

          <p>Mikäli paikalliskannan tietueessa on 035-kentän osakentässä $a tai $z FCC-alkuisia Melindan tietuetunnisteita, on ne lisättävä seuraavasti:</p>
          <div className="block">
            <span className="legend">BIB_ID  035</span>
            <span>1184996 FCC001173048</span>
            <span>1185010 FCC001167257</span>
            <span>1185286 FCC001175965</span>
          </div>

          <p>Jos FCC-alkuisia tunnisteita on useita, on ne kaikki lisättävä seuraavasti:</p>
          <div className="block">
            <span className="legend">BIB_ID  035          035</span>
            <span>1185010 FCC001167257 FCC001173048</span>
            <span>1185286 FCC001175965 FCC001167257</span>
          </div>

          <p>Jos tietueessa ei ole 035-kentissä lainkaan FCC-alkuisia tunnisteita, riittää pelkkä paikalliskannan tietuetunniste.</p>
          
        </div>
      </div>
    );
  }
}
