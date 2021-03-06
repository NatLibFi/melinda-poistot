/**
*
* @licstart  The following is the entire license notice for the JavaScript code in this file.
*
* UI for removing references to local libraries from Melinda
*
* Copyright (C) 2016-2019 University Of Helsinki (The National Library Of Finland)
*
* This file is part of melinda-poistot
*
* melinda-poistot program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Affero General Public License as
* published by the Free Software Foundation, either version 3 of the
* License, or (at your option) any later version.
*
* melinda-poistot is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Affero General Public License for more details.
*
* You should have received a copy of the GNU Affero General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*
* @licend  The above is the entire license notice
* for the JavaScript code in this file.
*
*/
import React from 'react';

import '../../styles/components/example-cards.scss';

export class ExampleCardLocalId extends React.Component {

  render() {
    return (
      <div className="card info-card">
        <div className="card-content">
          <span className="card-title">Poistot Voyager-paikalliskannan tietuetunnisteen perusteella</span>

          <p>Listaa Voyager-paikalliskannan tietuetunniste eli bibid:</p>
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
          <p>Koha-kirjastojärjestelmän käyttäjille lisätietoja tarvittavista tietue-ID:istä löytyy sivulta <a href="https://www.kiwi.fi/pages/viewpage.action?pageId=111706316">Poisto-ohje Koha-kirjastojärjestelmän käyttäjille</a></p>
          
        </div>
      </div>
    );
  }
}
