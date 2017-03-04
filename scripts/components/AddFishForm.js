/*
  ADD FISH FORM
*/
import React from 'react';

const AddFishForm = React.createClass({
  createFish : function(e) {
    e.preventDefault();
    let fish = {
      name : this.refs.name.value,
      price : this.refs.price.value,
      status : this.refs.status.value,
      desc : this.refs.desc.value,
      image : this.refs.image.value
    };
    this.props.addFish(fish);
    this.refs.fishForm.reset();
  },

  render : function() {
    return (
      <form 
      ref="fishForm"
      className="fish-edit" 
      onSubmit={this.createFish}>
        
        <input 
          type="text" 
          ref="name" 
          placeholder="Fish Name"/>

        <input 
          type="text" 
          ref="price" 
          placeholder="Fish Price"/>

        <select ref="status">
          <option value="available">Fresh</option>
          <option value="unavailable">Sold Out</option>
        </select>

        <textarea 
          type="text" 
          ref="desc" 
          placeholder="Desc">
        </textarea>

        <input type="text" 
          ref="image" 
          placeholder="URL to image"/>

        <button type="submit">+ Add Item</button>

      </form>
    )
  }
});

export default AddFishForm;