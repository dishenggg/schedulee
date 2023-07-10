import { Firestore } from "firebase/firestore";
import React, { useState } from 'react';
import { db } from "../../firebase.js";
import { addDoc, collection } from "firebase/firestore";
import "../../assets/BusDetails.css";
import { Input } from "antd"

const AddBusDetails = () => {
  const { Search } = Input
  const ref = collection(db, "test_data");
  const [searchValue, setSearchValue] = useState('')
  const handleSearch = (value) => {
    console.log(value)
    const data = {
      busNo: value,
    };

    try {
      addDoc(ref, data);
    } catch (e) {
      console.log(e);
    }
    setSearchValue('')
  };
  return (
    <div>
    <Search
      placeholder="Enter License Number"
      allowClear
      size="large"
      value={searchValue}
      onSearch={handleSearch}
      style={{
        width: "33vw",
      }}
      onChange={(e) => setSearchValue(e.target.value)}
    />
    </div>
  );
};

export default AddBusDetails;
