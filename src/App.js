//import React from "react";
import "./assets/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/NavBar/NavBar";
import HideNavBarInLogin from "./components/NavBar/HideNavBarInLogin";
import PrivateRoutes from "./utils/PrivateRoutes";
import Salary from ".//pages/Salary/";
import Scheduling from ".//pages/Scheduling/";
import BusDetails from ".//pages/BusDetails/";
import DriverDetails from ".//pages/DriverDetails/";
import Login from ".//pages/Login/";

function App() {
  return (
    <BrowserRouter>
      <HideNavBarInLogin>
        <Navbar />
      </HideNavBarInLogin>

      <Routes>
        <Route element={<PrivateRoutes />}>
          <Route path="/" element={<Scheduling />} />
          <Route path="/salary" element={<Salary />} />
          <Route path="/scheduling" element={<Scheduling />} />
          <Route path="/bus-details" element={<BusDetails />} />
          <Route path="/driver-details" element={<DriverDetails />} />
        </Route>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
