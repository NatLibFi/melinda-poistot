/* global $, Materialize */
import React from 'react';
import _ from 'lodash';

export class LowTagSelectField extends React.Component {

  static propTypes = {
    availableLowTags: React.PropTypes.array.isRequired,
    onSelectLowTag: React.PropTypes.func.isRequired
  }

  componentDidMount() {

    if (this.props.availableLowTags.length > 1) {

      const availableLowTags = this.props.availableLowTags.reduce((acc, r) => _.set(acc,r,null), {});

      $(this._input).autocomplete({
        data: availableLowTags
      });

      $(this._input)
        .closest('.input-field')
        .find('.autocomplete-content')
        .on('click', 'li', () => {
          this.onSelectLowTag(this._input.value);
        });

    } else {
      Materialize.updateTextFields();
      this.onSelectLowTag(_.head(this.props.availableLowTags));
    }

  }

  onSelectLowTag(selectedLowTag) {
    if (selectedLowTag == '') {
      this.props.onSelectLowTag(undefined);
    }
    if (this.props.availableLowTags.some((lowTag) => lowTag === selectedLowTag)) {
      this.props.onSelectLowTag(selectedLowTag);
    }
  }

  render() {

    if (this.props.availableLowTags.length === 1) {
      const fixedLowTag = this.props.availableLowTags[0];
      return (
        <div className="input-field low-tag">
          <label htmlFor="autocomplete-input-fixed">Tietokantatunnus</label>
          <input type="text" id="autocomplete-input-fixed" className="autocomplete low-tag-selector" value={fixedLowTag} disabled ref={(c) => this._input = c} />
        </div>
      );
    } else {
      return (
        <div className="input-field low-tag">
          <label htmlFor="autocomplete-input">Poistettava tietokantatunnus</label>
          <input type="text" id="autocomplete-input" className="autocomplete low-tag-selector" ref={(c) => this._input = c} onChange={(e) => this.onSelectLowTag(e.target.value)} />
        </div>
      );  
    }
    
  }
}


