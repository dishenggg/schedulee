import { useState, useEffect, useRef } from "react";
import { PlusOutlined, UserOutlined } from "@ant-design/icons";
import {
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  message,
  InputNumber,
  Select,
  Divider,
  Space,
} from "antd";
import { Title } from "../../../components/Typography/Title";
import { db } from "../../../firebase";
import dayjs from "dayjs";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";
import {
  ParseDateToFirestore,
  ParseTimeToFirestore,
} from "../../../utils/ParseTime";

const ContractForm = ({ setOpenModal, updateListOfTripsByDriver }) => {
  const [form] = Form.useForm();
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  const fetchDrivers = async () => {
    const driverRef = collection(db, "Bus Drivers");
    const snapshot = await getDocs(driverRef);
    const driverData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDrivers(driverData);
  };

  const fetchCustomers = async () => {
    const customerRef = collection(db, "Customers");
    const snapshot = await getDocs(customerRef);
    const customerData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCustomers(customerData);
  };

  const onNameChange = (event) => {
    setName(event.target.value);
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
    fetchCustomers();
    fetchDrivers();
  }, []);

  const disabledDate = (current) => {
    return current < dayjs().startOf("day");
  };

  const disabledEndDate = (current) => {
    const formValues = form.getFieldsValue();
    return current < dayjs().startOf("day") || current < formValues.startDate;
  };

  const handleSubmit = async (values) => {
    // console.log(values);
    try {
      const tripDetails = {
        contractId: "", // Will be updated with the contractId once it's generated
        customerName: values.customerName,
        contactPerson: values.contactPerson,
        contactNumber: values.contactPersonNumber,
        startDate: dayjs(values.startDate).toDate(),
        endDate: dayjs(values.endDate).toDate(),
        recurringTrips: values.recurringTrips.map((trip) => ({
          dayOfWeek: trip.dayOfWeek,
          time: dayjs(trip.time).toDate(),
          numPax: trip.numPax,
          numBus: trip.numBus,
          pickUpPoint: trip.pickUpPoint,
          dropOffPoint: trip.dropOffPoint,
        })),
      };

      const collectionRef = collection(db, "Contracts");
      const docRef = doc(collectionRef);
      const contractId = docRef.id;
      tripDetails.contractId = contractId; // Assign the generated contractId to the tripDetails object
      console.log(tripDetails);
      await setDoc(docRef, tripDetails);
      // console.log("Contract created with ID:", contractId)
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
          recurringTrips: [], // Initialize recurringTrips as an empty array
        }}
      >
        <Form.Item
          label="Customer Name:"
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
                    size="large"
                    placeholder="Add New Customer"
                    prefix={<UserOutlined className="site-form-item-icon" />}
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
        <Space size={"large"}>
          <Form.Item
            label="Contact Person:"
            name="contactPerson"
            rules={[{ required: true }]}
            style={{ width: 200 }}
          >
            <Input placeholder="Input Name" />
          </Form.Item>
          <Form.Item
            label="Contact Person Number:"
            name="contactPersonNumber"
            rules={[{ required: true }]}
          >
            <Input placeholder="Input Number" />
          </Form.Item>
          <Form.Item
            label="Start Date (DD/MM/YYYY):"
            name="startDate"
            rules={[{ required: true }]}
          >
            <DatePicker
              disabledDate={disabledDate}
              placeholder="Start Date"
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
          <Form.Item
            label="End Date (DD/MM/YYYY):"
            name="endDate"
            rules={[{ required: true }]}
          >
            <DatePicker
              disabledDate={disabledEndDate}
              placeholder="End Date"
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
        </Space>
        <Form.List name="recurringTrips">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <div key={field.key}>
                  <Title level={3}>Trip {index + 1}</Title>
                  <Space size={"large"}>
                    <Form.Item
                      label="Day of Week:"
                      name="dayOfWeek"
                      rules={[
                        {
                          required: true,
                          message: "Please select a day of the week.",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select Day"
                        size="middle"
                        style={{ width: 200 }}
                      >
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="0">Sunday</option>
                      </Select>
                    </Form.Item>
                    <Form.Item
                      label="Time (HH:MM):"
                      name="time"
                      rules={[
                        { required: true, message: "Please select a time." },
                      ]}
                    >
                      <TimePicker
                        placeholder="Trip Time"
                        format="HH:mm"
                        style={{ width: 183 }}
                        popupStyle={{ display: "none" }}
                        changeOnBlur={true}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Number of Pax:"
                      name="numPax"
                      rules={[
                        {
                          required: true,
                          message: "Please input the number of passengers.",
                        },
                      ]}
                    >
                      <InputNumber min={1} step={1} />
                    </Form.Item>
                    <Form.Item
                      label="Number of Buses:"
                      name="numBus"
                      rules={[
                        {
                          required: true,
                          message: "Please input the number of buses.",
                        },
                      ]}
                    >
                      <InputNumber min={1} step={1} />
                    </Form.Item>
                  </Space>
                  <Space size={"large"}>
                    <Form.Item
                      label="Pick Up Point:"
                      name="pickUpPoint"
                      rules={[
                        {
                          required: true,
                          message: "Please input the pick-up point.",
                        },
                      ]}
                    >
                      <Input style={{ width: 350 }} />
                    </Form.Item>
                    <Form.Item
                      label="Drop Off Point:"
                      name="dropOffPoint"
                      rules={[
                        {
                          required: true,
                          message: "Please input the drop-off point.",
                        },
                      ]}
                    >
                      <Input style={{ width: 350 }} />
                    </Form.Item>
                  </Space>
                  <Form.Item label="Bus Assigned: " name="busAssignedToTrip">
                    <Select
                      mode="multiple"
                      style={{ width: "100%", height: "100%", marginBottom: 5 }}
                      placeholder="No Bus Assigned"
                      options={drivers.map((driver) => ({
                        label: driver.id,
                        value: driver.id,
                      }))}
                    ></Select>
                  </Form.Item>
                  <div>
                    <Button
                      type="primary"
                      danger
                      onClick={() => remove(field.name)}
                      size="middle"
                    >
                      Remove Trip
                    </Button>
                  </div>
                </div>
              ))}
              <div>
                <Button
                  type="primary"
                  onClick={() => add()}
                  size="middle"
                  style={{
                    marginTop: "0.5rem",
                    marginBottom: "0.5rem",
                    backgroundColor: "Green",
                    width: "108px",
                  }}
                >
                  Add Trip
                </Button>
              </div>
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
