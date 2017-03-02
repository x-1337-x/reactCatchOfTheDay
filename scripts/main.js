const React = require('react');
const ReactDOM = require('react-dom');

const ReactRouter = require('react-router');
const Router = ReactRouter.Router;
const Route = ReactRouter.Route;
const Navigation = ReactRouter.Navigation;
const History = ReactRouter.History;

const createBrowserHistory = require('history/lib/createBrowserHistory');
const helpers = require('./helpers');

const Rebase = require('re-base');
const base = Rebase.createClass('https://project-5942253166857656660.firebaseio.com/');

const Catalyst = require('react-catalyst');
/*
  APP
*/
const App = React.createClass({
  mixins : [Catalyst.LinkedStateMixin],

  getInitialState : function() {
    return {
      fishes : {},
      order : {}
    }
  },

  componentDidMount : function() {
    base.syncState(this.props.params.storeId + '/fishes', {
      context : this,
      state : 'fishes'
    });

    let localStorageRef = localStorage.getItem('order-' + this.props.params.storeId);

    if(localStorageRef) {
      this.setState({
        order : JSON.parse(localStorageRef)
      })
    };
  },

  componentWillUpdate : function(nextProps, nextState) {
    localStorage.setItem('order-' + this.props.params.storeId, JSON.stringify(nextState.order));
  },

  addToOrder : function(key) {
    this.state.order[key] = this.state.order[key] + 1 || 1;
    this.setState({order : this.state.order});
  },

  removeFromOrder : function(key) {
    delete this.state.order[key];
    this.setState({order : this.state.order});
  },

  addFish : function(fish) {
    let timestamp = (new Date()).getTime();
    //update the state obj
    this.state.fishes['fish' + timestamp] = fish;
    //set the state
    this.setState({fishes : this.state.fishes});
  },

  removeFish : function(key) {
    if(confirm("You sure?")) {
      this.state.fishes[key] = null;
      this.setState({
        fishes: this.state.fishes
      });
    }
  },

  loadSamples : function() {
    this.setState({
      fishes: require('./sample-fishes')
    });
  },

  renderFish : function(key) {
    return <Fish key={key} 
                 index={key}
                 details={this.state.fishes[key]}
                 addToOrder={this.addToOrder}
            />
  },

  render : function() {
    return (
      <div className="catch-of-the-day">
        <div className="menu">
          <Header tagline="Fresh Seafood Market"/>
          <ul className="list-of-fishes">
            {Object.keys(this.state.fishes).map(this.renderFish)}
          </ul>
        </div>
        <Order fishes={this.state.fishes}
               order={this.state.order}
               removeFromOrder={this.removeFromOrder}
        />
        <Inventory 
          addFish={this.addFish}
          removeFish={this.removeFish}
          loadSamples={this.loadSamples}
          fishes={this.state.fishes}
          linkState={this.linkState}
        />    
      </div>
    )
  }

});

/*
  FISH
*/

const Fish = React.createClass({
  onButtonClick : function() {
    this.props.addToOrder(this.props.index);
  },

  render : function() {
    let details = this.props.details;
    let isAvailable = (details.status === 'available' ? true : false);
    let buttonText = (isAvailable ? 'Add To Order' : 'Sold Out');
    return (
      <li className="menu-fish">
        <img src={details.image} 
             alt={details.name}/>
        <h3 className="fish-name">
          {details.name}
          <span className="price">{helpers.formatPrice(details.price)}</span>
        </h3>
        <p>{details.desc}</p>
        <button 
          disabled={!isAvailable}
          onClick={this.onButtonClick}
        >
          {buttonText}
        </button>
      </li>
    )
  }
});

/*
  ADD FISH FORM
*/

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

/*
  HEADER
*/
const Header = React.createClass({

  render : function() {
    return (
      <header className="top">
        <h1>
          Catch 
          <span className="ofThe">
            <span className="of">of</span>
            <span className="the">the</span> 
          </span>
          Day
        </h1>
        <h3 className="tagline"><span>{this.props.tagline}</span></h3>
      </header>
    )
  }

});

/*
  ORDER
*/
const Order = React.createClass({
  renderOrder : function(key) {
    let fish = this.props.fishes[key];
    let count = this.props.order[key];
    let removeButton = <button onClick={this.props.removeFromOrder.bind(null, key)}>&times;</button>

    if(!fish) {
      return <li key={key}>Sorry, this fish is no longer available {removeButton}</li>
    }

    return (
      <li  key={key}>
        <span>{count}</span>lbs
        {fish.name}
        <span className="price">
          {helpers.formatPrice(count * fish.price)}
        </span>
        {removeButton}
      </li>
    )
  },

  render : function() {
    let orderIds = Object.keys(this.props.order);

    let total = orderIds.reduce((prevTotal, key) => {
      let fish = this.props.fishes[key];
      let count = this.props.order[key];
      let isAvailable = fish && fish.status === 'available';

      if(fish && isAvailable) {
        return prevTotal + (count * parseInt(fish.price) || 0);
      };

      return prevTotal;
    }, 0);

    return (
      <div className="order-wrap">
        <h2 className="order-wrap">Your Order</h2>
        <ul className="order">
          {orderIds.map(this.renderOrder)}
          <li className="total">
            <strong>Total:</strong>
            {helpers.formatPrice(total)}
          </li>
        </ul>
      </div>
    )
  }

});

/*
  INVENTORY
*/
const Inventory = React.createClass({
  renderInventory : function(key) {
    let linkState = this.props.linkState;
    return (
      <div className="fish-edit"
      key={key}>
        <input type="text" valueLink={linkState('fishes.' + key + '.name')} />
        <input type="text" valueLink={linkState('fishes.' + key + '.price')} />
        <select valueLink={linkState('fishes.' + key + '.status')}>
          <option value="available">In Stock</option>
          <option value="unavailable">Sold Out</option>
        </select>
        <textarea valueLink={linkState('fishes.' + key + '.desc')}></textarea>
        <input type="text" valueLink={linkState('fishes.' + key + '.image')}/>
        <button onClick={this.props.removeFish.bind(null, key)}>REMOVE</button>
      </div>
    )
  },

  render : function() {
    return (
      <div>
        <h2>Inventory</h2>

        {Object.keys(this.props.fishes).map(this.renderInventory)}

        <AddFishForm {...this.props}/>
        <button 
          onClick={this.props.loadSamples}>
          Load Samples
        </button>
      </div>
    )
  }

});

/*
  STORE PICKER
*/
const StorePicker = React.createClass({
  mixins : [History],

  goToStore : function(e) {
    e.preventDefault();
    //get the data from the input
    const storeId = this.refs.storeId.value;
    this.history.pushState(null, '/store/' + storeId);    
    //transition from <StorePicker/> to <App/>
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

/*
  NOT FOUND
*/
const NotFound = React.createClass({
  render : function() {
    return (
      <h1>Not Found</h1>
    )
  }
});


/*
  ROUTES
*/
const routes = (
  <Router history={createBrowserHistory()}>
    <Route path="/" component={StorePicker} />
    <Route path="/store/:storeId" component={App} />
    <Route path="*" component={NotFound} />
  </Router>
);

ReactDOM.render(routes, document.querySelector('#main'));