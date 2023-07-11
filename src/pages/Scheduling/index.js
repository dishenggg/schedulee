import React, { useState } from "react";
import SchedulingApp from "./SchedulingApp";
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
      <h1>Scheduling Page</h1>
      <div>
        <label htmlFor="date-input">Select Date:</label>
        <input
          type="date"
          id="date-input"
          value={selectedDate.toISOString().substr(0, 10)}
          onChange={handleDateChange}
        />
      </div>
      <p>Selected Date: {formattedDate}</p>
      <AddTrip />
      <SchedulingApp selectedDate={dateWithoutDashes} />
    </>
  );
};

export default Scheduling;
