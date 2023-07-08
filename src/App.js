//import React from "react";
import "./assets/index.css";
import { BrowserRouter, Routes, Route} from "react-router-dom";
import {ConfigProvider, theme} from 'antd'
import Navbar from "./components/NavBar/NavBar";
import HideNavBarInLogin from "./components/NavBar/HideNavBarInLogin";
import PrivateRoutes from "./utils/PrivateRoutes";
import Salary from ".//pages/Salary/";
import Scheduling from ".//pages/Scheduling/";
import BusDetails from ".//pages/BusDetails/";
import DriverDetails from ".//pages/DriverDetails/";
import Login from ".//pages/Login/";
import NotFound from "./pages/NotFound";


function App() {
  return (
    <ConfigProvider theme={{algorithm:theme.defaultAlgorithm}}>
    <BrowserRouter>
      <HideNavBarInLogin>
        <Navbar />
      </HideNavBarInLogin>

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
    </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
