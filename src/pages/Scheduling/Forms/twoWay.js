import { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  message,
  InputNumber,
} from "antd";
import { Title } from "../../../components/Typography/Title";
import { db } from "../../../firebase";
import dayjs from "dayjs";
import { doc, setDoc, addDoc, collection } from "firebase/firestore";
import { ParseDateToFirestore } from "../../../utils/ParseTime";

const TwoWayForm = ({ setOpenModal }) => {
  const [value, setValue] = useState(null);

  const onChange = (time) => {
    setValue(time);
  };

  const handleSubmit = async (values) => {
    try {
      const date = ParseDateToFirestore(values.date);
      const unassignedBus = "";
      const concatTrips = values.pickUpPoint + " --> " + values.dropOffPoint;
      const concatTrips2 = values.dropOffPoint + " --> " + values.pickUpPoint;
      const tripDetails1 = {
        bus: unassignedBus,
        customerName: values.customerName,
        description: values.description,
        contactName: values.contactPersonName,
        contactNumber: values.contactPersonPhoneNumber,
        pickUpPoint: values.pickUpPoint,
        dropOffPoint: values.dropOffPoint,
        numberPax: values.numberPax,
        numberBus: values.numberBus,
        tripDescription: concatTrips,
        tripDate: dayjs(values.date).toDate(),
        startTime: dayjs(values.time).toDate(),
        endTime: dayjs(values.time).toDate(),
      };
      const tripDetails2 = {
        bus: unassignedBus,
        customerName: values.customerName,
        description: values.description,
        contactName: values.contactPersonName,
        contactNumber: values.contactPersonPhoneNumber,
        pickUpPoint: values.dropOffPoint,
        dropOffPoint: values.pickUpPoint,
        numberPax: values.numberPax,
        numberBus: values.numberBus,
        tripDescription: concatTrips2,
        tripDate: dayjs(values.date).toDate(),
        startTime: dayjs(values.returnTime).toDate(),
        endTime: dayjs(values.returnTime).toDate(),
      };
      const tripRef = collection(db, "Dates", date, "trips");
      // await addDoc(tripRef, tripDetails1);
      // await addDoc(tripRef, tripDetails2);
      Promise.all([
        addDoc(tripRef, tripDetails1),
        addDoc(tripRef, tripDetails2),
      ]);
      message.success("Trip added successfully!");
      setOpenModal(false);
      //window.location.reload(); // Refresh the page
    } catch (error) {
      message.error(error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Title level={2}>Two Way Form</Title>
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
          label="Date (YYYY-MM-DD)"
          name="date"
          rules={[{ required: true }]}
        >
          <DatePicker />
        </Form.Item>
        <Form.Item
          label="Pick Up Time (HH:MM)"
          name="time"
          rules={[{ required: true }]}
        >
          <TimePicker
            format={"HH:mm"}
            value={value}
            onChange={onChange}
            popupStyle={{ display: "none" }}
            changeOnBlur={true}
          />
        </Form.Item>
        <Form.Item
          label="Return Time (HH:MM)"
          name="returnTime"
          rules={[{ required: true }]}
        >
          <TimePicker
            format={"HH:mm"}
            value={value}
            onChange={onChange}
            popupStyle={{ display: "none" }}
            changeOnBlur={true}
          />
        </Form.Item>
        <Form.Item
          label="Number of Pax"
          name="numberPax"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <InputNumber min={1} step={1} />
        </Form.Item>
        <Form.Item
          label="Number of Buses"
          name="numberBus"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <InputNumber min={1} step={1} />
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

export default TwoWayForm;
