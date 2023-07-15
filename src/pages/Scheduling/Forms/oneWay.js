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
import { addDoc, collection } from "firebase/firestore";
import {
  ParseDateToFirestore,
  ParseTimeToFirestore,
} from "../../../utils/ParseTime";
import dayjs from "dayjs";

const OneWayForm = ({ setOpenModal, updateListOfTripsByDriver }) => {
  const [value, setValue] = useState(null);

  const onChange = (time) => {
    setValue(time);
  };

  const disabledDate = (current) => {
    return current < dayjs().startOf("day");
  };

  const handleSubmit = async (values) => {
    try {
      const date = ParseDateToFirestore(values.date);
      const unassignedBus = "";
      const concatTrips = values.pickUpPoint + " --> " + values.dropOffPoint;
      const tripDetails = {
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
        startTime: ParseTimeToFirestore(values.time, values.date),
        endTime: ParseTimeToFirestore(values.time, values.date),
      };
      console.log(tripDetails);
      const tripRef = collection(db, "Dates", date, "trips");
      await addDoc(tripRef, tripDetails);
      updateListOfTripsByDriver();
      message.success("Trip added successfully!");
      setOpenModal(false);
    } catch (error) {
      message.error(error.toString());
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div>
      <Title level={2}>One Way Form</Title>
      <Form
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        layout="vertical"
        initialValues={{
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
          rules={[
            {
              required: true,
              pattern: /^[689]\d{7}$/,
              message: "Check '${label}' Format",
            },
          ]}
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
          <DatePicker disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item
          label="Time (HH:MM)"
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

export default OneWayForm;
