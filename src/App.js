// Handles the global variables and page routing.

import React from 'react';
import './App.css';
import UserForm from './userForm';
import ResultScreen from './result';

import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Global variables are stored in the parent.
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
      // Page Routing is done in this file.
      <Router>
        <Route exact path="/" render={(props) => <UserForm {...props} handleFormSubmit={this.handleFormSubmit} />} />
        <Route exact path="/result" render={(props) => <ResultScreen {...props} formData={this.state.formData} />} />
      </Router>
    );
  }

}

export default App;
