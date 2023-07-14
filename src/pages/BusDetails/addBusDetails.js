import { Firestore } from "firebase/firestore";
import React, { useState } from 'react';
import { db } from "../../firebase.js";
import { addDoc, collection } from "firebase/firestore";
import "../../assets/BusDetails.css";
import { Input, message } from "antd"

const AddBusDetails = () => {
  const { Search } = Input
  const ref = collection(db, "test_data");
  const [searchValue, setSearchValue] = useState('')
  const [loading, setLoading] = useState(false)
  const handleSearch = (value) => {
    setLoading(true)
    const data = {
      busNo: value,
    };

    try {
      addDoc(ref, data);
    } catch (e) {
      console.log(e);
    }
    setSearchValue('')
    setTimeout(() => {
      setLoading(false)
      message.info(`Search value: ${value}`)
    }, 1500);
    
  };
  return (
    <div>
    <Search
      placeholder="Enter License Number"
      allowClear
      size="large"
      loading={loading}
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
