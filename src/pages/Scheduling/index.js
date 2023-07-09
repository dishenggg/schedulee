import React from "react";
import { useState, useEffect } from "react";
import "./style.css";
import { Form } from "./forms.js";
import SchedulingApp from "./SchedulingApp";

const Scheduling = () => {
  const options = ["Standard 1-Way", "Standard 2-Way", "Disposal", "Tour"];
  const [myValue, setMyValue] = useState(options[0]);

  useEffect(() => {
    // Convert the string value to a number when setting the initial state
    setMyValue(options.indexOf(myValue) + 1);
  }, []);

  return (
    <>
    <SchedulingApp />
      <h1>Scheduling Page</h1>
      <h2>Trip Type</h2>
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
        <h2>
          You selected{" "}
          <span style={{ backgroundColor: "yellow" }}>
            {options[myValue - 1]}
          </span>
        </h2>
      </div>
    </>
  );
};

export default Scheduling;
