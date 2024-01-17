// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import HomePage from './HomePage';
import SearchPage from './SearchPage';
import DoctorDetailsPage from './DoctorDetailsPage';

function App() {
  return (
    <Router>
      <div>
        <Switch>
          {/* Route for Home/Login Page */}
          <Route path="/" exact component={HomePage} />

          {/* Route for Search Page */}
          <Route path="/search" component={SearchPage} />

          {/* Route for Doctor Details Page */}
          <Route path="/doctor-details/:doctorId" component={DoctorDetailsPage} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
