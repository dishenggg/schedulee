import React from "react";
import "../../assets/BusDetails.css";
import AddBusDetails from "./addBusDetails";
import { Title } from "../../components/Typography/Title";

const BusDetails = () => {
  return (
    <>
      <Title level={3}>Page to view Past/Current/Future trips </Title>
      <AddBusDetails />
    </>
  );
};

export default BusDetails;
