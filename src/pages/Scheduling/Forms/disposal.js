import { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  InputNumber,
  message,
  Space,
} from "antd";
import { Title } from "../../../components/Typography/Title";
import dayjs from "dayjs";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  ParseTimeToFirestore,
  ParseDateToFirestore,
} from "../../../utils/ParseTime";

const Disposal = ({ setOpenModal, updateListOfTripsByDriver }) => {
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
      const unassignedBus = [];
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
        tripDescription: values.tripDescription,
        startTime: ParseTimeToFirestore(values.startTime, values.date),
        endTime: ParseTimeToFirestore(values.endTime, values.date),
      };
      // console.log(tripDetails);
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
      <Title level={2}>Disposal Form</Title>
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
        <Space size={"large"}>
          <Form.Item
            label="Contact Person Name"
            name="contactName"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Contact Person Number"
            name="contactNumber"
            rules={[
              {
                required: true,
                pattern: /^[689]\d{7}$/,
                message: "Check Phone Number Format",
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Space>
        <Form.Item
          label="Trip Description"
          name="tripDescription"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Space size={"small"}>
          <Form.Item
            label="Date (YYYY-MM-DD)"
            name="date"
            rules={[{ required: true }]}
          >
            <DatePicker disabledDate={disabledDate} />
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
        </Space>
        <Space size={"large"}>
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
        </Space>
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
