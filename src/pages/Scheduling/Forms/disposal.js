import { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  InputNumber,
  message,
} from "antd";
import { Title } from "../../../components/Typography/Title";
import dayjs from "dayjs";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase";
import { ParseDateToFirestore } from "../../../utils/ParseTime";

const Disposal = ({ setOpenModal }) => {
  const [value, setValue] = useState(null);

  const onChange = (time) => {
    setValue(time);
  };

  const handleSubmit = async (values) => {
    try {
      const date = ParseDateToFirestore(values.date);
      const unassignedBus = "";
      const concatTrips = values.tripDescription;
      const disposalTrip = "disposal";
      const tripDetails = {
        bus: unassignedBus,
        customerName: values.customerName,
        contactName: values.contactPersonName,
        contactNumber: values.contactPersonPhoneNumber,
        pickUpPoint: disposalTrip,
        dropOffPoint: disposalTrip,
        numberPax: values.numberPax,
        numberBus: values.numberBus,
        tripDescription: concatTrips,
        tripDate: dayjs(values.date).toDate(),
        startTime: dayjs(values.startTime).toDate(),
        endTime: dayjs(values.endTime).toDate(),
      };
      console.log(tripDetails);
      // const tripRef = collection(db, "Dates", date, "trips");
      // await addDoc(tripRef, tripDetails);
      // message.success("Trip added successfully!");
      // setOpenModal(false);
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
      <Title level={2}>Disposal Form</Title>
      <Form
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        layout="vertical"
        initialValues={{
          numberPax: "1",
          numberBus: "1",
        }}
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
          label="Contact Person Number"
          name="contactPersonPhoneNumber"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Trip Description"
          name="tripDescription"
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
          label="Start Time (HH:MM)"
          name="startTime"
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
          label="End Time (HH:MM)"
          name="endTime"
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

export default Disposal;
