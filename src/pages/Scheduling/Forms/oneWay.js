import { Form, Input, Button, DatePicker, TimePicker } from "antd";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";

const OneWayForm = ({ setOpenModal }) => {
  const [dates, setDates] = useState([
    { id: uuidv4(), date: null, time: null },
  ]); // Initialize with an empty date

  const handleSubmit = (values) => {
    // Perform validation and submit the form data
    if (
      values.customerName &&
      values.description &&
      values.contactPersonName &&
      values.contactPersonPhoneNumber &&
      values.pickupPoint &&
      values.dropOffPoint &&
      dates.length > 0 &&
      dates.every((date) => date.date && date.time) // Check if every date has both date and time selected
    ) {
      const formData = {
        customerName: values.customerName,
        description: values.description,
        contactPersonName: values.contactPersonName,
        contactPersonPhoneNumber: values.contactPersonPhoneNumber,
        dates,
        pickupPoint: values.pickupPoint,
        dropOffPoint: values.dropOffPoint,
      };
      console.log("Form data:", formData);
      // Add your logic here to submit the form data to the backend or perform further actions
      setOpenModal(false);
    } else {
      alert(
        "Please fill in all required fields, including at least one date with both date and time."
      );
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleAddDate = () => {
    const newDate = { id: uuidv4(), date: null, time: null }; // Generate a unique identifier for the date
    setDates([...dates, newDate]); // Add a new date object with null date and time values
  };

  const handleRemoveDate = (id) => {
    const updatedDates = dates.filter((date) => date.id !== id); // Filter out the date with the specified id
    setDates(updatedDates);
  };

  const handleDateChange = (id, date) => {
    const updatedDates = dates.map((dateObj) => {
      if (dateObj.id === id) {
        return { ...dateObj, date: date };
      }
      return dateObj;
    });
    setDates(updatedDates);
  };

  const handleTimeChange = (id, time) => {
    const updatedDates = dates.map((dateObj) => {
      if (dateObj.id === id) {
        return { ...dateObj, time: time };
      }
      return dateObj;
    });
    setDates(updatedDates);
  };

  return (
    <div>
      <h2>Form</h2>
      <Form onFinish={handleSubmit} onFinishFailed={onFinishFailed}>
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
        {dates.map((date) => (
          <div key={date.id}>
            <Form.Item
              label={`Date ${date.id}`}
              rules={[{ required: true, message: "Please select a date." }]}
            >
              <DatePicker
                format="DD/MM/YY"
                onChange={(date) => handleDateChange(date.id, date)}
              />
            </Form.Item>
            <Form.Item
              label={`Time ${date.id}`}
              rules={[{ required: true, message: "Please select a time." }]}
            >
              <TimePicker
                format="HH:mm"
                onChange={(time) => handleTimeChange(date.id, time)}
              />
            </Form.Item>
            <Button onClick={() => handleRemoveDate(date.id)}>
              Remove Date
            </Button>
          </div>
        ))}
        <Button
          type="dashed"
          onClick={handleAddDate}
          style={{ marginBottom: "16px" }}
        >
          Add Date
        </Button>
        <Form.Item
          label="Pick Up Point"
          name="pickupPoint"
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
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OneWayForm;
