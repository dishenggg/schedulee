import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import React, { useState } from "react";
import { Button, Modal, Form, Input, message } from "antd";
import { UserAddOutlined } from "@ant-design/icons";
import { ParseTimeToFirestore } from "../../utils/ParseTime";
import dayjs from "dayjs";

const AddCustomer = ({ updateCustomerList }) => {
  const [openModal, setOpenModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  const onCreate = async (values) => {
    try {
      const customerName = values.customerName.toUpperCase();
      const customerRef = doc(db, "Customers", customerName);
      const driverSnapshot = await getDoc(customerRef);

      if (driverSnapshot.exists()) {
        message.error(
          "Customer already exists. Please check if it is a duplicate."
        );
      } else {
        setConfirmLoading(true);
        const customerDetails = {
          ...values,
          dateAdded: ParseTimeToFirestore(dayjs(), dayjs()),
        };
        console.log(customerDetails);
        await setDoc(customerRef, customerDetails);
        updateCustomerList();
        message.success("Customer added successfully!");
        setOpenModal(false);
        setConfirmLoading(false);
      }
    } catch (error) {
      message.error(error.toString());

    }
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<UserAddOutlined />}
        onClick={() => {
          setOpenModal(true);
        }}
      >
        Add Customer
      </Button>
      <Modal
        open={openModal}
        title="Add Customer"
        okText="Submit"
        cancelText="Cancel"
        onCancel={() => {
          setOpenModal(false);
        }}
        confirmLoading={confirmLoading}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              form.resetFields();
              onCreate(values);
            })
            .catch((info) => {
              console.log("Validation Error:", info);
            });
        }}
      >
        <Form form={form} layout="vertical" name="customer form">
          <Form.Item
            name="customerName"
            label="Customer Name"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddCustomer;
