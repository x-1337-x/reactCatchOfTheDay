/*
  INVENTORY
*/
import React from 'react';
import AddFishForm from './AddFishForm';
import autobind from 'autobind-decorator';
import Firebase from 'firebase';

/*Firebase config*/
const config = {
  apiKey: "AIzaSyBH2zpo5dIlExZdCpiTqyEt9d3gPLQbxyk",
  authDomain: "project-5942253166857656660.firebaseapp.com",
  databaseURL: "https://project-5942253166857656660.firebaseio.com",
  storageBucket: "project-5942253166857656660.appspot.com",
  messagingSenderId: "944787628946"
};
Firebase.initializeApp(config);

const rootRef = Firebase.database().ref();


@autobind
class Inventory extends React.Component {

  constructor() {
    super();

    this.state = {
      uid : ''
    };
  };

  // componentWillMount() {
  //   // var token = localStorage.getItem('token');
  //   // console.log(token)
  //   // if(token) {
  //   //   Firebase.auth().signInWithCustomToken(token).catch(function(error) {
  //   //       var errorCode = error.code;
  //   //       var errorMessage = error.message;
  //   //       console.log(errorCode, errorMessage)
  //   //   });
  //   // }   

  //   var credential = localStorage.getItem('credential');
  //   console.log(credential)
  //   if(credential) {
  //     Firebase.auth().signInWithCredential(JSON.parse(localStorage.getItem('credential')))
  //   }
  // };

  authenticate(provider) {
    console.log(provider)
    
    if(provider === 'github') {
      var provider = new Firebase.auth.GithubAuthProvider();
    } else if(provider === 'facebook') {
      var provider = new Firebase.auth.FacebookAuthProvider();
    } else if(provider === 'twitter') {
      var provider = new Firebase.auth.TwitterAuthProvider();
    } else {
      throw provider + " is not a valid provider"
    }
      
    let auth = Firebase.auth();
    auth.signInWithPopup(provider)
      .then((result) => {

        // localStorage.setItem('credential', JSON.stringify(result.credential))

        localStorage.setItem('token', result.credential.accessToken)

        // Firebase.auth().currentUser.getToken(true)
        //   .then((idToken) => {localStorage.setItem('token', idToken)})
        //   .catch((err) => {
        //     console.log(err)
        //   });

        // console.log(localStorage.getItem('token'))

        const storeRef = rootRef.child(this.props.params.storeId);

        storeRef.on('value', (snapshot) => {
          var data = snapshot.val() || {};
          if(!data.owner) {
            storeRef.set({
              owner : result.user.uid
            })
          }

          this.setState({
            uid : result.user.uid,
            owner : data.owner || result.user.uid
          });
        });
      })
      .catch((err) => console.log(err))
  };

  logout() {
    Firebase.auth().signOut()
      .then(() => {
        localStorage.removeItem('token');
        this.setState({
          uid : null
        });
      })
      .catch((err) => {
        console.log(err)
      });
  };

  renderLogin() {
    return (
      <nav className="login">
        <p style={{textAlign: 'center'}}>Sign in to manage your store's inventory</p>
        <button className="github" 
                onClick={this.authenticate.bind(this, 'github')}
        >
          Log in with github
        </button>
      </nav>
    )
  }
  
  renderInventory(key) {
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
  };

  render() {
    let logoutButton = <button onClick={this.logout}>Log Out</button>

    if(!this.state.uid) {
      return (
        <div>
          {this.renderLogin()}
        </div>
      )
    };

    if(this.state.uid !== this.state.owner) {
      return (
        <div>
          <p>Only the owner can edit the inventory</p>
          {logoutButton}
        </div>
      )
    }

    return (
      <div>
        <h2>Inventory</h2>
        {logoutButton}
        {Object.keys(this.props.fishes).map(this.renderInventory)}

        <AddFishForm {...this.props}/>
        <button 
          onClick={this.props.loadSamples}>
          Load Samples
        </button>
      </div>
    )
  }
};

Inventory.propTypes = {
  addFish : React.PropTypes.func.isRequired, 
  removeFish : React.PropTypes.func.isRequired, 
  loadSamples : React.PropTypes.func.isRequired, 
  fishes : React.PropTypes.object.isRequired, 
  linkState : React.PropTypes.func.isRequired 
};

export default Inventory;