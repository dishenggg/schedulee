import { useState, useRef, useEffect } from "react";
import { PlusOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  message,
  InputNumber,
  Space,
  Select,
  Divider,
} from "antd";
import { Title } from "../../../components/Typography/Title";
import { db } from "../../../firebase";
import {
  getDocs,
  addDoc,
  collection,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import {
  ParseDateToFirestore,
  ParseTimeToFirestore,
} from "../../../utils/ParseTime";
import dayjs from "dayjs";

const TwoWayForm = ({ setOpenModal, updateListOfTripsByDriver }) => {
  const [value, setValue] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  const onNameChange = (event) => {
    setName(event.target.value);
  };

  const fetchCustomers = async () => {
    console.log("Fetching");
    const customerRef = collection(db, "Customers");
    const snapshot = await getDocs(customerRef);
    const customerData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCustomers(customerData);
  };

  const addCustomer = async (values) => {
    try {
      const customerRef = doc(db, "Customers", values);
      const customerSnapshot = await getDoc(customerRef);

      if (customerSnapshot.exists()) {
        message.error(
          "Customer already exists. Please check if it is a duplicate."
        );
      } else {
        const customerDetails = {
          customerName: values,
          dateAdded: ParseTimeToFirestore(dayjs(), dayjs()),
        };
        console.log(customerDetails);
        await setDoc(customerRef, customerDetails);
        message.success("Customer added successfully!");
        fetchCustomers();
      }
    } catch (error) {
      message.error(error.toString());
    }
  };

  useEffect(() => {
    console.log("hi me");
    fetchCustomers();
  }, []);

  const onChange = (time) => {
    setValue(time);
  };

  const disabledDate = (current) => {
    // Can not select days before today
    return current < dayjs().startOf("day");
  };

  const handleSubmit = async (values) => {
    try {
      const date = ParseDateToFirestore(values.date);
      const unassignedBus = [];
      const concatTrips = values.pickUpPoint + " --> " + values.dropOffPoint;
      const concatTrips2 = values.dropOffPoint + " --> " + values.pickUpPoint;
      const TRIPTYPE = "standard";
      const tripDetails1 = {
        bus: unassignedBus,
        customerName: values.customerName,
        description: values.description,
        contactName: values.contactPersonName,
        contactNumber: values.contactPersonPhoneNumber,
        pickUpPoint: values.pickUpPoint,
        dropOffPoint: values.dropOffPoint,
        type: TRIPTYPE,
        numPax: values.numPax,
        numBus: values.numBus,
        numBusAssigned: 0,
        tripDescription: concatTrips,
        startTime: ParseTimeToFirestore(values.time, values.date),
        endTime: ParseTimeToFirestore(values.time, values.date),
      };
      const tripDetails2 = {
        bus: unassignedBus,
        customerName: values.customerName,
        description: values.description,
        contactName: values.contactPersonName,
        contactNumber: values.contactPersonPhoneNumber,
        pickUpPoint: values.dropOffPoint,
        dropOffPoint: values.pickUpPoint,
        type: TRIPTYPE,
        numPax: values.numPax,
        numBus: values.numBus,
        numBusAssigned: 0,
        tripDescription: concatTrips2,
        startTime: ParseTimeToFirestore(values.returnTime, values.date),
        endTime: ParseTimeToFirestore(values.returnTime, values.date),
      };
      const tripRef = collection(db, "Dates", date, "trips");
      console.log(tripDetails1);
      console.log(tripDetails2);
      Promise.all([
        addDoc(tripRef, tripDetails1),
        addDoc(tripRef, tripDetails2),
      ]);
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
      <Title level={2}>Two Way Form</Title>
      <Form
        onFinish={handleSubmit}
        onFinishFailed={onFinishFailed}
        layout="vertical"
        initialValues={{
          numBus: 1,
        }}
      >
        <Form.Item
          label="Customer Name"
          name="customerName"
          rules={[{ required: true }]}
        >
          <Select
            showSearch
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? "")
                .toLowerCase()
                .localeCompare((optionB?.label ?? "").toLowerCase())
            }
            placeholder="Customer Name"
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider
                  style={{
                    margin: "8px 0",
                  }}
                />
                <Space
                  style={{
                    padding: "0 8px 4px",
                  }}
                >
                  <Input
                    placeholder="New Customer"
                    ref={inputRef}
                    onChange={onNameChange}
                  />
                  <Button
                    type="text"
                    icon={<PlusOutlined />}
                    onClick={() => addCustomer(name)}
                  >
                    Add Customer
                  </Button>
                </Space>
              </>
            )}
            options={customers.map((customer) => ({
              label: customer.customerName,
              value: customer.customerName,
            }))}
          />
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true }]}
        >
          <Input placeholder="Input Description 'Volleyball Competition'" />
        </Form.Item>
        <Space size={"large"}>
          <Form.Item
            label="Contact Person Name"
            name="contactPersonName"
            rules={[{ required: true }]}
          >
            <Input placeholder="Input Name" />
          </Form.Item>
          <Form.Item
            label="Contact Person Number"
            name="contactPersonPhoneNumber"
            rules={[
              {
                required: true,
                pattern: /^[689]\d{7}$/,
                message: "Check Phone Number Format",
              },
            ]}
          >
            <Input placeholder="Input Number" />
          </Form.Item>
        </Space>
        <Space size={"large"}>
          <Form.Item
            label="Pick Up Point"
            name="pickUpPoint"
            rules={[{ required: true }]}
          >
            <Input placeholder="Input Pick Up Point" />
          </Form.Item>
          <Form.Item
            label="Drop Off Point"
            name="dropOffPoint"
            rules={[{ required: true }]}
          >
            <Input placeholder="Input Drop Off Point" />
          </Form.Item>
        </Space>
        <Space size={"small"}>
          <Form.Item
            label="Date (DD/MM/YYYY)"
            name="date"
            rules={[{ required: true }]}
          >
            <DatePicker
              disabledDate={disabledDate}
              placeholder="Trip Date"
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
          <Form.Item
            label="Pick Up Time (HH:MM)"
            name="time"
            rules={[
              {
                required: true,
              },
            ]}
          >
            <TimePicker
              format={"HH:mm"}
              value={value}
              onChange={onChange}
              popupStyle={{ display: "none" }}
              changeOnBlur={true}
              placeholder="Pick Up Time"
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
              placeholder="Return Time"
            />
          </Form.Item>
        </Space>
        <Space size={"large"}>
          <Form.Item
            label="Number of Pax"
            name="numPax"
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
            name="numBus"
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

export default TwoWayForm;
