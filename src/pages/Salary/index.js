import React from "react";
import { Space, DatePicker, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";
import { Title } from "../../components/Typography/Title";

const Salary = () => {
  return (
    <>
      <Title>Salary Page</Title>
      <Space>
        Choose Month: <DatePicker picker="month" />
        <Button type="primary" icon={<SendOutlined />}>
          Generate
        </Button>
      </Space>
    </>
  );
};

export default Salary;
