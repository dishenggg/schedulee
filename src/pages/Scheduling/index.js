import React, { useState, useEffect } from "react";
import { Space } from "antd";
import SchedulingApp from "./SchedulingApp";
import AddMultipleTrips from "./Forms/addMultipleTrips";
import { Title } from "../../components/Typography/Title";
import AddTrip from "./addTrip.js";
import AddContract from "./addContract";
import { db } from "../../firebase";
import { collection, getDocs, orderBy } from "firebase/firestore";
import { ParseDateToFirestore } from "../../utils/ParseTime";

const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editable, setEditable] = useState(true);
  const [listOfTripsByDriver, setListOfTripsByDriver] = useState({});

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    selectedDate.setHours(0, 0, 0, 0);
    setSelectedDate(selectedDate);

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    if (selectedDate < currentDate) {
      setEditable(false);
    } else {
      setEditable(true);
    }
  };

  const formattedDate = selectedDate.toLocaleDateString("en-GB");
  const dateWithoutDashes = formattedDate.replace(/\//g, "");

  const populateListOfTripsByDriver = async () => {
    const driverQuery = await getDocs(collection(db, "Bus Drivers"));
    const drivers = driverQuery.docs.map((doc) => doc.id);
    const tripsQuery = await getDocs(
      collection(db, "Dates", ParseDateToFirestore(selectedDate), "trips"),
      orderBy("startTime")
    );
    const trips = tripsQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const res = {};
    res["Unscheduled Trips"] = trips
      .filter((trip) => trip.bus === "" || trip.bus === null)
      .sort((a, b) => a.startTime.seconds - b.startTime.seconds);
    drivers.forEach((driverId) => {
      res[driverId] = trips
        .filter((trip) => trip.bus === driverId)
        .sort((a, b) => a.startTime.seconds - b.startTime.seconds);
    });
    console.log(res);
    setListOfTripsByDriver(res);
  };

  const updateListOfTripsByDriver = () => {
    populateListOfTripsByDriver();
  };

  useEffect(() => {
    populateListOfTripsByDriver();
  }, [selectedDate]);

  return (
    <>
      <Title>Scheduling Page</Title>
      <div>
        <label>Date selected:</label>
        <input
          type="date"
          id="date-input"
          value={selectedDate.toISOString().substr(0, 10)}
          onChange={handleDateChange}
        />
      </div>
      <Space style={{ marginTop: "0.5rem", marginBottom: "0.5rem" }}>
        <AddTrip updateListOfTripsByDriver={updateListOfTripsByDriver} />
        <AddMultipleTrips
          updateListOfTripsByDriver={updateListOfTripsByDriver}
        />
        <AddContract updateListOfTripsByDriver={updateListOfTripsByDriver} />
      </Space>
      <SchedulingApp
        selectedDate={dateWithoutDashes}
        editable={editable}
        listOfTripsByDriver={listOfTripsByDriver}
        updateListOfTripsByDriver={updateListOfTripsByDriver}
      />
    </>
  );
};

export default Scheduling;
