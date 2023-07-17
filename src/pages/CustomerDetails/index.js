import React, { useState, useEffect } from "react";
import CustomerList from "./customerList.js";
import AddCustomer from "./addCustomer.js";
import { Title } from "../../components/Typography/Title.js";
import { Space } from "antd";
import { db } from "../../firebase.js";
import { collection, getDocs } from "firebase/firestore";

const CustomerDetails = () => {
  const [customers, setCustomers] = useState([]);

  const fetchCustomers = async () => {
    const customerRef = collection(db, "Customers");
    const snapshot = await getDocs(customerRef);
    const customerData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCustomers(customerData);
  };

  const updateCustomerList = () => {
    fetchCustomers();
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return (
    <>
      <Title level={2}>Customers </Title>
      <Space style={{ marginBottom: "0.5rem" }}>
        <AddCustomer updateCustomerList={updateCustomerList} />
      </Space>
      <CustomerList
        customers={customers}
        updateCustomerList={updateCustomerList}
      />
    </>
  );
};

export default CustomerDetails;
