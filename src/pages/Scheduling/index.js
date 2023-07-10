import React, { useState } from "react";
import SchedulingApp from "./SchedulingApp";
import { Form } from "./forms.js";

const Scheduling = () => {
  const options = ["Standard 1-Way", "Standard 2-Way", "Disposal", "Tour"];
  const [myValue, setMyValue] = useState(options[0]);
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
      <SchedulingApp selectedDate={dateWithoutDashes} />
      <div>
        <select onChange={(e) => setMyValue(e.target.value)} value={myValue}>
          {options.map((option, idx) => (
            <option key={idx} value={option}>
              {option}
            </option>
          ))}
        </select>
        <Form value={myValue} />
        <h2>
          You selected{" "}
          <span style={{ backgroundColor: "yellow" }}>{myValue}</span>
        </h2>
      </div>
    </>
  );
};

export default Scheduling;
