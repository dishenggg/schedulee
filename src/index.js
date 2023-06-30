import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from ".//components/NavBar/NavBar";
import Salary from ".//pages/Salary/";
import Scheduling from ".//pages/Scheduling/";
import BusDetails from ".//pages/BusDetails/";
import DriverDetails from ".//pages/DriverDetails/";
import Login from ".//pages/Login/"
import "./assets/index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/salary" element={<Login />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/bus-details" element={<BusDetails />} />
        <Route path="/driver-details" element={<DriverDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));
