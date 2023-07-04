import { Firestore } from "firebase/firestore";
import React, { useRef } from "react";
import { db } from "../../firebase.js";
import { addDoc, collection } from "firebase/firestore";
import "../../assets/BusDetails.css";

const AddBusDetails = () => {
  const busNoRef = useRef();
  const ref = collection(db, "test_data");

  const handleAddBusDetails = (e) => {
    e.preventDefault();

    let data = {
      busNo: busNoRef.current.value,
    };

    try {
      addDoc(ref, data);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div>
      <form onSubmit={handleAddBusDetails}>
        <label>Enter License Plate Number</label>
        <input type="text" ref={busNoRef} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default AddBusDetails;
