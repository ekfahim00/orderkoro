import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

import {
  BrowserRouter as Router,
  Routes,
  Route
} from 'react-router-dom';

import Signup from './pages/Signup.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import RestaurantDashboard from './pages/RestaurantDashboard.jsx';
import Login from './pages/Login.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard/user" element={<UserDashboard />} />
        <Route path="/dashboard/restaurant" element={<RestaurantDashboard />} />
      </Routes>
    </Router>
  </React.StrictMode>
);
