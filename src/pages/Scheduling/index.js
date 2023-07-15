import React, { useState } from "react";
import { Space } from "antd";
import SchedulingApp from "./SchedulingApp";
import { Form } from "./forms.js";
import AddMultipleTrips from "./Forms/addMultipleTrips";
import { Title } from "../../components/Typography/Title";
import AddTrip from "./addTrip.js";
import AddContract from "./addContract";

const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editable, setEditable] = useState(true);

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    selectedDate.setHours(0, 0, 0, 0);
    setSelectedDate(selectedDate);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (selectedDate < currentDate) {
      setEditable(false);
    } else {
      setEditable(true);
    }
  };

  const formattedDate = selectedDate.toLocaleDateString("en-GB");
  const dateWithoutDashes = formattedDate.replace(/\//g, "");

  return (
    <>
      <Title>Scheduling Page</Title>
      <div>
        <label>Date selected:</label>
        <input
          type="date"
          id="date-input"
          value={selectedDate.toISOString().substr(0, 10)}
          onChange={handleDateChange}
        />
      </div>
      <Space style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
        <AddTrip />
        <AddMultipleTrips />
        <AddContract />
      </Space>
      <SchedulingApp selectedDate={dateWithoutDashes} editable={editable} />
    </>
  );
};

export default Scheduling;
