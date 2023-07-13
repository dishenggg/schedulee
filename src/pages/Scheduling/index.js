import React, { useState } from "react";
import SchedulingApp from "./SchedulingApp";
import { Form } from "./forms.js";
import AddMultipleTrips from "./Forms/addMultipleTrips";
import { Title } from "../../components/Typography/Title";
import AddTrip from "./addTrip.js";

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
      <AddMultipleTrips />
      <div>
        <label>Date selected:</label>
        <input
          type="date"
          id="date-input"
          value={selectedDate.toISOString().substr(0, 10)}
          onChange={handleDateChange}
        />
      </div>
      <AddTrip />
      <SchedulingApp selectedDate={dateWithoutDashes} />
    </>
  );
};

export default Scheduling;
