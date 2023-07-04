import React from "react";
import DriverList from "./driverList.js";
import AddDriver from "./addDriver.js";
// import UpdateDriver from "./addDriver.js";
// import DeleteDriver from "./addDriver.js";

const DriverDetails = () => {
  return (
    <>
      <h1>Driver Details Page</h1>
      <h2> List of Drivers </h2>
      <DriverList />
      <h2>Create Driver</h2>
      <AddDriver />
    </>
  );
};

export default DriverDetails;
