import React, { useState, useEffect } from "react";
import DriverList from "./driverList.js";
import AddDriver from "./addDriver.js";
import AddMultipleDrivers from "./addMultipleDrivers.js";
import AddSubCon from "./addSubCon.js";
import SubConList from "./subConList.js";
import { Title } from "../../components/Typography/Title";
import { Space } from "antd";
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";

const DriverDetails = () => {
  const [drivers, setDrivers] = useState([]);
  const [subCons, setSubCons] = useState([]);

  const fetchDrivers = async () => {
    const driversRef = collection(db, "Bus Drivers");
    const snapshot = await getDocs(driversRef);
    const driverData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDrivers(driverData);
  };

  const fetchSubCons = async () => {
    const subConRef = collection(db, "Sub Cons");
    const snapshot = await getDocs(subConRef);
    const subCons = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSubCons(subCons);
  };

  const updateDriverList = () => {
    fetchDrivers();
  };

  const updateSubConList = () => {
    fetchSubCons();
  };

  useEffect(() => {
    fetchDrivers();
    fetchSubCons();
  }, []);

  return (
    <>
      <Title level={2}>Drivers </Title>
      <Space style={{ marginBottom: "0.5rem" }}>
        <AddDriver updateDriverList={updateDriverList} />
        <AddMultipleDrivers updateDriverList={updateDriverList} />
      </Space>
      <DriverList drivers={drivers} updateDriverList={updateDriverList} />
      <Title level={2}>Sub Con </Title>
      <Space style={{ marginBottom: "0.5rem" }}>
        <AddSubCon updateSubConList={updateSubConList} />
      </Space>
      <SubConList subCons={subCons} updateSubConList={updateSubConList} />
    </>
  );
};

export default DriverDetails;
