import React from 'react';
import './App.css';
import UserForm from './userForm';
import ResultScreen from './result';
// import withGoogleApps from "./googlecale";

import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

class App extends React.Component {
  // withGoogleApps(App);

  constructor(props) {
    super(props);
    this.state = {
      formData: {
        startDate: '',
        endDate: '',
        googleLink: '',
        swimming: false,
        cifGym: false,
        pacGym: false,
        badminton: false,
        basketball: false,
        skating: false,
        studio: false,
        fieldHouse: false,
        avgHrsPerWk: 0,
        limit1Activity: false,
      },
    };
  };

  handleFormSubmit = (userData) => {
    this.setState({ formData: {...userData} });
  };

  render() {
    return (
      <Router>
        <Route exact path="/" render={(props) => <UserForm {...props} handleFormSubmit={this.handleFormSubmit} />} />
        <Route exact path="/result" render={(props) => <ResultScreen {...props} formData={this.state.formData} />} />
        {/* <Route exact path="/result" component={ResultScreen} /> */}
      </Router>
    );
  }

}

export default App;
