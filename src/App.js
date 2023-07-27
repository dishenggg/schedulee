//import React from "react";
import "./assets/index.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme, FloatButton } from "antd";
import Navbar from "./components/NavBar/NavBar";
import HideNavBarInLogin from "./components/NavBar/HideNavBarInLogin";
import PrivateRoutes from "./utils/PrivateRoutes";
import Salary from ".//pages/Salary/";
import Scheduling from ".//pages/Scheduling/";
import CustomerDetails from ".//pages/CustomerDetails/";
import CustomerDetailsPage from "./pages/CustomerDetails/customerDetailsPage";
import DriverDetails from ".//pages/DriverDetails/";
import SubConDetails from "./pages/SubConDetails";
import SubConDetailsPage from "./pages/SubConDetails/subConDetailsPage";
import Login from ".//pages/Login/";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";

function App() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("darkMode") === "true"
  );

  return (
    <div
      style={{
        background: darkMode ? "#1e1f21" : "white",
        minHeight: "100vh",
      }}
    >
      <ConfigProvider
        theme={{
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <BrowserRouter>
          <HideNavBarInLogin>
            <Navbar />
          </HideNavBarInLogin>
          <div style={{ margin: "0px 1vw 0px 1vw" }}>
            <Routes>
              <Route element={<PrivateRoutes />}>
                <Route exact path="/" element={<Scheduling />} />
                <Route path="/salary" element={<Salary />} />
                <Route path="/scheduling" element={<Scheduling />} />
                <Route path="/customer-details" element={<CustomerDetails />} />
                <Route
                  path="/customer-details/:customerName"
                  element={<CustomerDetailsPage />}
                />
                <Route path="/driver-details" element={<DriverDetails />} />
                <Route path="/subcon-details" element={<SubConDetails />} />
                <Route
                  path="/subcon-details/:SubConName"
                  element={<SubConDetailsPage />}
                />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
        <FloatButton
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
          }}
          icon={<FontAwesomeIcon icon={darkMode ? faMoon : faSun} />}
          onClick={() => {
            localStorage.setItem("darkMode", !darkMode);
            setDarkMode(!darkMode);
          }}
        ></FloatButton>
      </ConfigProvider>
    </div>
  );
}

export default App;
