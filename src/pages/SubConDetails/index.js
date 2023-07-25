import React, { useState, useEffect } from "react";
import { Title } from "../../components/Typography/Title.js";
import { db } from "../../firebase.js";
import { collection, getDocs } from "firebase/firestore";
import SubConList from "./subConList.js";
import { Space } from "antd";
import AddSubCon from "./addSubCon.js";

const SubConDetails = () => {
  const [subCons, setSubCons] = useState([]);

  const fetchSubCons = async () => {
    const ref = collection(db, "Sub Cons");
    const snapshot = await getDocs(ref);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setSubCons(data);
  };

  const updateSubConsList = () => {
    fetchSubCons();
  };

  useEffect(() => {
    fetchSubCons();
  }, []);

  return (
    <>
      <Title level={2}>Sub Con </Title>
      <Space style={{ marginBottom: "0.5rem" }}>
        <AddSubCon updateSubConsList={updateSubConsList} />
      </Space>
      <SubConList subCons={subCons} updateSubConsList={updateSubConsList} />
    </>
  );
};

export default SubConDetails;
