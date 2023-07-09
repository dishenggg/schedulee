import { db } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Radio } from 'antd';

const AddDriver = () => {
  const [openModal, setOpenModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [form] = Form.useForm();

  const onCreate = async (values) => {
    try {
      console.log(values);
      const busNumber = values.busNumber.toUpperCase();
      const driverRef = doc(db, 'Bus Drivers', busNumber);
      const driverSnapshot = await getDoc(driverRef);

      if (driverSnapshot.exists()) {
        alert('Bus Number already exists. Please choose a different Bus Number.');
      } else {
        const updatedValues = {
          ...values,
          busNumber, // Update the busNumber value to the capitalized version
          local: values.local === '1',
        };
        setConfirmLoading(true);
        await setDoc(driverRef, updatedValues);
        alert('Driver added successfully!');
        setOpenModal(false);
        setConfirmLoading(false);
        window.location.reload(); // Refresh the page
      }
    } catch (error) {
      console.log(error);
      alert(error);
    }
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setOpenModal(true);
        }}
      >
        Add Driver
      </Button>
      <Modal
        open={openModal}
        title="Add A Driver"
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
              console.log('Validation Error:', info);
            });
        }}
      >
        <Form
          form={form}
          layout="vertical"
          name="driver form"
          initialValues={{
            local: '1',
          }}
        >
          <Form.Item
            name="busNumber"
            label="Bus Number"
            rules={[
              {
                required: true,
                message: "'${name}' Required",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="name"
            label="Name"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="icNumber"
            label="NRIC (Last 4 Characters)"
            rules={[
              {
                required: true,
              },
              {
                pattern: /^\d{3}[A-Z]$/,
                message: 'Correct Format: 123C',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="contactNumber"
            label="Contact No."
            rules={[
              {
                required: true,
              },
              {
                pattern: /^[689]\d{7}$/,
                message: "Check '${label}' Format",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="minSalary"
            label="Minimum Salary"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber min={1} step={0.01} />
          </Form.Item>
          <Form.Item
            name="normalSalary"
            label="Normal Salary"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <InputNumber min={1} step={0.01} />
          </Form.Item>
          <Form.Item
            name="peakHourSalary"
            label="Peak Hour Salary"
            rules={[
              {
                required: true,
                message: "'${label}' Required",
              },
            ]}
          >
            <InputNumber min={1} step={0.01} />
          </Form.Item>
          <Form.Item name="local">
            <Radio.Group>
              <Radio value="1">Local</Radio>
              <Radio value="0">Non-Local</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddDriver;
