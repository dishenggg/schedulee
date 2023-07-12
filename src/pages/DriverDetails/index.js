import React, { useState, useEffect } from "react";
import DriverList from "./driverList.js";
import AddDriver from "./addDriver.js";
import AddMultipleDrivers from "./addMultipleDrivers.js";
import { Title } from "../../components/Typography/Title";
import { Space } from "antd";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const DriverDetails = () => {
  const [drivers, setDrivers] = useState([]);

  const fetchDrivers = async () => {
    const driversRef = collection(db, "Bus Drivers");
    const snapshot = await getDocs(driversRef);
    const driverData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDrivers(driverData);
  };

  const updateList = () => {
    fetchDrivers();
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  return (
    <>
      <Title>Drivers </Title>
      <Space style={{ marginBottom: "0.5rem" }}>
        <AddDriver updateList={updateList} />
        <AddMultipleDrivers updateList={updateList} />
      </Space>
      <DriverList drivers={drivers} updateList={updateList} />
    </>
  );
};

export default DriverDetails;
