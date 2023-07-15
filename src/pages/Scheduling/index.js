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

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    setSelectedDate(selectedDate);
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
      <SchedulingApp selectedDate={dateWithoutDashes} />
    </>
  );
};

export default Scheduling;
