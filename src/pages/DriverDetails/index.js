import React from 'react';
import DriverList from './driverList.js';
import AddDriver from './addDriver.js';
import AddMultipleDrivers from './addMultipleDrivers.js';
import { Title } from '../../components/Typography/Title';
// import UpdateDriver from "./addDriver.js";
// import DeleteDriver from "./addDriver.js";
import { Space } from 'antd';

const DriverDetails = () => {
  return (
    <>
      <Title>Drivers </Title>
      <Space>
        <AddDriver />
        <AddMultipleDrivers />
      </Space>
      <DriverList />
    </>
  );
};

export default DriverDetails;
