import React from "react";
import "../../assets/BusDetails.css";
import AddBusDetails from "./addBusDetails";

const BusDetails = () => {
  return (
    <>
      <h1>Bus Details Page</h1>
      Page to view Past/Current/Future trips
      <AddBusDetails />
    </>
  );
};

export default BusDetails;
