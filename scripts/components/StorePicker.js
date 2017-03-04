/*
  STORE PICKER
*/

import React from 'react';
import { History } from 'react-router';
import helpers from '../helpers';

const StorePicker = React.createClass({
  mixins : [History],

  goToStore : function(e) {
    e.preventDefault();
    //get the data from the input
    const storeId = this.refs.storeId.value;
    this.history.pushState(null, '/store/' + storeId);
  },

  render : function() {
    return (
      <form className="store-selector" onSubmit={this.goToStore}>
        <h2>Please, Enter A Store</h2>
        <input type="text" ref="storeId" defaultValue={helpers.getFunName()} required/>
        <input type="submit"/>
      </form>
    )
  }
});

export default StorePicker;