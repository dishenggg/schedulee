import React from "react";
import { db } from "../../firebase.js";
import { doc, getDoc } from "firebase/firestore";
const docRef = doc(db, "test_data", "eXzhx4lKoZYBo7C2Wq9g");
const docSnap = await getDoc(docRef);

const Salary = () => {
  if (docSnap.exists()) {
    console.log("Document data:", docSnap.data());
  } else {
    // docSnap.data() will be undefined in this case
    console.log("No such document!");
  }
  return (
    <div>
      <h1>Salary Page</h1>
      List of driver's salary + breakdown of salary
    </div>
  );
};

export default Salary;
