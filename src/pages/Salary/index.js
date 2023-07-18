import React from "react";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";

const Salary = () => {
  return (
    <div>
      <h1>Salary Page</h1>
      List of driver's salary + breakdown of salary
    </div>
  );
};

export default Salary;
