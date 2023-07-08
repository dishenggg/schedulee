import React from "react";
import DriverList from "./driverList.js";
import AddDriver from "./addDriver.js";
import {Title} from "../../components/Typography/Title"
// import UpdateDriver from "./addDriver.js";
// import DeleteDriver from "./addDriver.js";

const DriverDetails = () => {
  return (
    <>
      <Title>Drivers </Title>
      <DriverList />
      <h2>Create Driver</h2>
      <AddDriver />
    </>
  );
};

export default DriverDetails;
