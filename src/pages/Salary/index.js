import React from "react";
import { Space, DatePicker, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { Title } from "../../components/Typography/Title";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";

const Salary = () => {
  return (
    <>
      <Title level={2}>Salary Page</Title>
      <Space align="center">
        <Title level={3} style={{ marginTop: "12px" }}>
          Choose Month:{" "}
        </Title>
        <DatePicker picker="month" />
        <Button type="primary" icon={<SendOutlined />}>
          Generate
        </Button>
      </Space>
    </>
  );
};

export default Salary;
