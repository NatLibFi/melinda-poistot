import React from 'react';

//import '../../styles/components/';

export class LocalIdFormat extends React.Component {

  render() {
    return (
      <div className="card info-card">
        <div className="card-content">
          <span className="card-title">Paikalliskannan tietuetunnisteen perusteella</span>

          <p>Mikäli tietueessa on 035 kentän osakentässä a tai z FCC­-alkuisia Melinda tietuetunnisteita, niin ne on lisättävä seuraavasti:</p>
          <pre><span className="legend">BIB_ID  035</span>
1184996 FCC001173048
1185010 FCC001167257
1185286 FCC001175965</pre>

          <p>Jos tietueessa on useita FCC alkuisia tunnisteita, niin ne kaikki on lisättävä seuraavasti:</p>
          <pre><span className="legend">BIB_ID  035          035</span>
1185010 FCC001167257 FCC001173048
1185286 FCC001175965 FCC001167257</pre>

          <p>Mikäli tietueessa ei ole laisinkaan 035 kenttiä joissa on FCC alkuisia Melinda tietotunnisteita, niin tietueen voi listata pelkällä paikalliskannan tietuetunnisteella</p>
          <pre><span className="legend">BIB_ID</span>
1031348
1046414</pre>

        </div>
      </div>
    );
  }
}
export class MelindaIdFormat extends React.Component {
  render() {
    return (
      <div className="card info-card">
        <div className="card-content">
          <span className="card-title">Melindan tietuetunnisteen perusteella</span>
        <pre><span className="legend">MELINDA_ID</span>
(FI-MELINDA)001173048
(FI-MELINDA)001167257</pre>
        </div>
      </div>
    );
  }
}