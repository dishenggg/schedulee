import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  DatePicker,
  TimePicker,
  message,
  InputNumber,
  Select,
  Space,
  Tabs,
} from 'antd';
import { Title } from '../../../components/Typography/Title';
import { db } from '../../../firebase';
import dayjs from 'dayjs';
import { addDoc, collection } from 'firebase/firestore';
import { ParseDateToFirestore } from '../../../utils/ParseTime';

const { Option } = Select;

const ContractForm = ({ setOpenModal }) => {
  
  const [form] = Form.useForm();
  const [value, setValue] = useState(null);
  const [recurringTripsData, setRecurringTripsData] = useState([]);

  const onTimeChange = (time) => {
    setValue(time);
  };


  const ReusableFormFragment = (formNo) => {
    const [tripForm] = Form.useForm();
    return (
      <Form form={tripForm}
      onFinish={handleAddTrip}>
        <Form.Item
          label="Day of Week"
          name='dayOfWeek'
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
        <Form.Item label="Time" name='time' rules={[{ required: true }]}>
          <TimePicker
            format={'HH:mm'}
            value={value}
            onChange={onTimeChange}
            popupStyle={{ display: 'none' }}
            changeOnBlur={true}
          />
        </Form.Item>
        <Form.Item label="Number of Pax" name='numberPax' rules={[{ required: true }]}>
          <InputNumber min={1} step={1} />
        </Form.Item>
        <Form.Item
          label="Number of Buses"
          name='numberBus'
          rules={[{ required: true }]}
        >
          <InputNumber min={1} step={1} />
        </Form.Item>
        <Form.Item
          label="Pick Up Point"
          name='pickUpPoint'
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Drop Off Point"
          name='dropOffPoint'
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit">
          Add Trip
        </Button>
      </Form>
    );
  };
  const initTrips = [
    {
      label: 'Trip 1',
      children: <ReusableFormFragment formNo={1} />,
      key: 1,
      closable: false,
      forceRender: true,
    },
  ];
  const [trips, setTrips] = useState(initTrips);
  const [activeTab, setActiveTab] = useState(initTrips[0].key);
  const onTabChange = (newTabIndex) => {
    setActiveTab(newTabIndex);
  };
  const addTab = () => {
    const newActiveTab = trips.at(-1).key + 1;
    console.log(newActiveTab)
    const newPanes = [...trips];
    newPanes.push({
      label: `Trip ${newActiveTab}`,
      children: <ReusableFormFragment formNo={newActiveTab} />,
      key: newActiveTab,
    });
    setTrips(newPanes);
    setActiveTab(newActiveTab);
    console.log(activeTab)
  };

  const removeTab = (targetTab) => {
    let newActiveTab = activeTab;
    let lastIndex = -1;
    trips.forEach((trip, i) => {
      if (trip.key === targetTab) {
        lastIndex = i - 1;
      }
    });
    let newPanes = trips.filter((trip) => trip.key !== targetTab);

    console.log(targetTab)
    let newRecurringTripsData = recurringTripsData.filter((trip) => trip.key !== targetTab)
    if (newPanes.length && newActiveTab === targetTab) {
      if (lastIndex > 0) {
        newActiveTab = newPanes[lastIndex].key;
      } else {
        newActiveTab = newPanes[0].key;
        newPanes = [{ ...trips[0], closable: false }];
      }
    }
    setTrips(newPanes);
    setRecurringTripsData(newRecurringTripsData)
    console.log(recurringTripsData)
    setActiveTab(newActiveTab);
  };
  const onEdit = (targetTab, action) => {
    if (action === 'add') {
      addTab();
    } else {
      removeTab(targetTab);
    }
  };
  const disabledDate = (current) => {
    return current < dayjs().startOf('day');
  };

  const disabledEndDate = (current) => {
    const formValues = form.getFieldsValue();
    return current < dayjs().startOf('day') || current < formValues.startDate;
  };

  const handleAddTrip = (values) => {
    //console.log(recurringTripsData)
    console.log(activeTab)
    const trip = {
      dayOfWeek: values.dayOfWeek,
      time: values.time,
      numberPax: values.numberPax,
      numberBus: values.numberBus,
      pickUpPoint: values.pickUpPoint,
      dropOffPoint: values.dropOffPoint,
    };
    const newTripData = [...recurringTripsData];
    newTripData.push(trip)
    setRecurringTripsData(newTripData);
    console.log(newTripData)
    message.success("Trip Added.")
  }

  const handleRemoveTrip = (index) => {
    const updatedTrips = [...recurringTripsData];
    updatedTrips.splice(index, 1);
    setRecurringTripsData(updatedTrips);
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
        recurringTrips: recurringTripsData.map((trip) => ({
          dayOfWeek: trip.dayOfWeek,
          time: dayjs(trip.time).toDate(),
          numberPax: trip.numberPax,
          numberBus: trip.numberBus,
          location: trip.location,
        })),
      };
      console.log(tripDetails);
      // const tripRef = collection(db, 'Contracts');
      // await addDoc(tripRef, tripDetails);
      // message.success('Contract added successfully!');
      // setOpenModal(false);
      //window.location.reload(); // Refresh the page
    } catch (error) {
      message.error(error);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
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
          numberBus: '1',
        }}
      >
        <Form.Item label="Customer Name" name="customerName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Contact Person" name="contactPerson" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
          label="Contact Person Number"
          name="contactPersonNumber"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Space>
          <Form.Item label="Start Date" name="startDate" rules={[{ required: true }]}>
            <DatePicker disabledDate={disabledDate} />
          </Form.Item>
          <Form.Item label="End Date" name="endDate" rules={[{ required: true }]}>
            <DatePicker disabledDate={disabledEndDate} />
          </Form.Item>
        </Space>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
        </Form>
        <Tabs
          type="editable-card"
          onChange={onTabChange}
          activeKey={activeTab}
          onEdit={onEdit}
          items={trips}
        />
        
      
    </div>
  );
};

export default ContractForm;
