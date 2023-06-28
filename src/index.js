import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from ".//components/NavBar/NavBar";
import Salary from ".//pages/Salary/";
import Scheduling from ".//pages/Scheduling/";
import BusDetails from ".//pages/BusDetails/";
import "./assets/index.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/salary" element={<Salary />} />
        <Route path="/scheduling" element={<Scheduling />} />
        <Route path="/bus-details" element={<BusDetails />} />
      </Routes>
    </BrowserRouter>
  );
}
ReactDOM.render(<App />, document.getElementById("root"));
