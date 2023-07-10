import React, { useState, useEffect } from "react";
import SchedulingApp from "./SchedulingApp";
import { Form } from "./forms.js";

const Scheduling = () => {
  const options = ["Standard 1-Way", "Standard 2-Way", "Disposal", "Tour"];
  const [myValue, setMyValue] = useState(options[0]);

  useEffect(() => {
    // Convert the string value to a number when setting the initial state
    setMyValue(options.indexOf(myValue) + 1);
  }, []);

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
        <select
          onChange={(e) => setMyValue(parseInt(e.target.value))}
          defaultValue={myValue}
        >
          {options.map((option, idx) => (
            <option key={idx} value={idx + 1}>
              {option}
            </option>
          ))}
        </select>
        <Form value={myValue} />
      </div>
    </>
  );
};

export default Scheduling;
