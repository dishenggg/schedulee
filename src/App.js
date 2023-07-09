//import React from "react";
import './assets/index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme, Switch } from 'antd';
import Navbar from './components/NavBar/NavBar';
import HideNavBarInLogin from './components/NavBar/HideNavBarInLogin';
import PrivateRoutes from './utils/PrivateRoutes';
import Salary from './/pages/Salary/';
import Scheduling from './/pages/Scheduling/';
import BusDetails from './/pages/BusDetails/';
import DriverDetails from './/pages/DriverDetails/';
import Login from './/pages/Login/';
import NotFound from './pages/NotFound';
import { useState } from 'react';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  return (
    <div
      style={{
        background: darkMode ? '#1e1f21' : 'white',
        height: '100vh',
      }}
    >
      <ConfigProvider
        theme={{ algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm }}
      >
        <BrowserRouter>
          <HideNavBarInLogin>
            <Navbar />
          </HideNavBarInLogin>
          <div style={{ margin: '0px 1vw 0px 1vw' }}>
            <Routes>
              <Route element={<PrivateRoutes />}>
                <Route exact path="/" element={<Scheduling />} />
                <Route path="/salary" element={<Salary />} />
                <Route path="/scheduling" element={<Scheduling />} />
                <Route path="/bus-details" element={<BusDetails />} />
                <Route path="/driver-details" element={<DriverDetails />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
        <Switch
          style={{
            position: 'absolute',
            bottom: 20,
            right: 20,
          }}
          checked={darkMode}
          checkedChildren="Dark Mode"
          unCheckedChildren="Light Mode"
          onChange={() => setDarkMode(!darkMode)}
        ></Switch>
      </ConfigProvider>
    </div>
  );
}

export default App;
