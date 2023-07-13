import { useState } from "react";
import { Form, Input, Button, DatePicker, TimePicker  } from "antd";
import { Title } from "../../../components/Typography/Title";

const Disposal = ({ setOpenModal }) => {
  
  const [value, setValue] = useState(null);

  const onChange = (time) => {
    setValue(time);
  };
  const handleSubmit = (values) => {
    if (
      values.customerName &&
      values.description &&
      values.contactPersonName &&
      values.contactPersonPhoneNumber &&
      values.date &&
      values.time &&
      values.tripDescription
    ) {
      const formData = {
        customerName: values.customerName,
        description: values.description,
        contactPersonName: values.contactPersonName,
        contactPersonPhoneNumber: values.contactPersonPhoneNumber,
        date: values.date,
        time: values.time,
        tripDescription : values.tripDescription
      };
      console.log("Form data:", formData);
      // Add your logic here to submit the form data to the backend or perform further actions
      setOpenModal(false);
    } else {
      alert("Please fill in all required fields");
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Title level={2}>Disposal Form</Title>
      <Form
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        layout="vertical"
      >
        <Form.Item
          label="Customer Name"
          name="customerName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Contact Person Name"
          name="contactPersonName"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Contact Person Phone Number"
          name="contactPersonPhoneNumber"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Pick Up Point"
          name="pickUpPoint"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Drop Off Point"
          name="dropOffPoint"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
        label = "Date"
        name = "date">
          <DatePicker />
        </Form.Item>
        <Form.Item
        label = "Time"
        name = "time">
          <TimePicker format={"HH:mm"} value={value} onChange={onChange} popupStyle={{display:"none"}} changeOnBlur={true}/>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Disposal;
