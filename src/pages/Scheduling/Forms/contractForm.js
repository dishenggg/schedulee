import { useState } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  message,
  InputNumber,
  Select,
} from "antd";
import { Title } from "../../../components/Typography/Title";
import { db } from "../../../firebase";
import dayjs from "dayjs";
import { addDoc, collection } from "firebase/firestore";
import { ParseDateToFirestore } from "../../../utils/ParseTime";

const { Option } = Select;

const ContractForm = ({ setOpenModal, updateListOfTripsByDriver }) => {
  const [form] = Form.useForm();
  const [value, setValue] = useState(null);
  const [recurringTrips, setRecurringTrips] = useState([]);

  const onChange = (time) => {
    setValue(time);
  };

  const disabledDate = (current) => {
    return current < dayjs().startOf("day");
  };

  const disabledEndDate = (current) => {
    const formValues = form.getFieldsValue();
    return current < dayjs().startOf("day") || current < formValues.startDate;
  };

  const handleAddTrip = (values) => {
    const trip = {
      dayOfWeek: values.dayOfWeek,
      time: values.time,
      numberPax: values.numberPax,
      numberBus: values.numberBus,
      location: values.location,
    };
    setRecurringTrips([...recurringTrips, trip]);
  };

  const handleRemoveTrip = (index) => {
    const updatedTrips = [...recurringTrips];
    updatedTrips.splice(index, 1);
    setRecurringTrips(updatedTrips);
  };

  const handleSubmit = async (values) => {
    try {
      const startDate = ParseDateToFirestore(values.startDate);
      const endDate = ParseDateToFirestore(values.endDate);

      const tripDetails = {
        customerName: values.customerName,
        contactPerson: values.contactPerson,
        contactNumber: values.contactPersonNumber,
        startDate: dayjs(values.startDate).toDate(),
        endDate: dayjs(values.endDate).toDate(),
        recurringTrips: recurringTrips.map((trip) => ({
          dayOfWeek: trip.dayOfWeek,
          time: dayjs(trip.time).toDate(),
          numberPax: trip.numberPax,
          numberBus: trip.numberBus,
          location: trip.location,
        })),
      };
      const tripRef = collection(db, "Contracts");
      await addDoc(tripRef, tripDetails);
      updateListOfTripsByDriver();
      message.success("Contract added successfully!");
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
      <Title level={2}>Contract Form</Title>
      <Form
        form={form}
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
          label="Contact Person"
          name="contactPerson"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Contact Person Number"
          name="contactPersonNumber"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Start Date"
          name="startDate"
          rules={[{ required: true }]}
        >
          <DatePicker disabledDate={disabledDate} />
        </Form.Item>
        <Form.Item label="End Date" name="endDate" rules={[{ required: true }]}>
          <DatePicker disabledDate={disabledEndDate} />
        </Form.Item>
        <Form.List name="recurringTrips">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <div key={field.key}>
                  <h3>Trip {index + 1}</h3>
                  <Form.Item
                    label="Day of Week"
                    name={[field.name, "dayOfWeek"]}
                    rules={[{ required: true }]}
                  >
                    <Select>
                      <Option value="Monday">Monday</Option>
                      <Option value="Tuesday">Tuesday</Option>
                      <Option value="Wednesday">Wednesday</Option>
                      <Option value="Thursday">Thursday</Option>
                      <Option value="Friday">Friday</Option>
                      <Option value="Saturday">Saturday</Option>
                      <Option value="Sunday">Sunday</Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    label="Time"
                    name={[field.name, "time"]}
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
                    name={[field.name, "numberPax"]}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} step={1} />
                  </Form.Item>
                  <Form.Item
                    label="Number of Buses"
                    name={[field.name, "numberBus"]}
                    rules={[{ required: true }]}
                  >
                    <InputNumber min={1} step={1} />
                  </Form.Item>
                  <Form.Item
                    label="Pick Up Point"
                    name={[field.name, "pickUpPoint"]}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    label="Drop Off Point"
                    name={[field.name, "dropOffPoint"]}
                    rules={[{ required: true }]}
                  >
                    <Input />
                  </Form.Item>
                  <Button
                    type="primary"
                    danger
                    onClick={() => remove(field.name)}
                    size={"middle"}
                  >
                    Remove Trip
                  </Button>
                </div>
              ))}
              <Button
                type="primary"
                onClick={() => add()}
                size={"middle"}
                style={{
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                  backgroundColor: "Green ",
                  width: "108px",
                }}
              >
                Add Trip
              </Button>
            </>
          )}
        </Form.List>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ContractForm;
