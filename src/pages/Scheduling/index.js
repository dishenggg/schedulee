import React, { useState, useEffect } from "react";
import { Space, DatePicker } from "antd";
import SchedulingApp from "./SchedulingApp";
import AddMultipleTrips from "./Forms/addMultipleTrips";
import { Title } from "../../components/Typography/Title";
import AddTrip from "./addTrip.js";
import AddContract from "./addContract";
import { db } from "../../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { ParseDateToFirestore } from "../../utils/ParseTime";
import dayjs from "dayjs";

const Scheduling = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editable, setEditable] = useState(true);
  const [listOfTripsByDriver, setListOfTripsByDriver] = useState({});
  const [listOfDrivers, setListOfDrivers] = useState({});

  const handleDateChange = (event) => {
    const selectedDate = new Date(event.target.value);
    //selectedDate.setHours(0, 0, 0, 0);
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
    const tripsQuery = await getDocs(
      query(
        collection(db, "Dates", ParseDateToFirestore(selectedDate), "trips"),
        orderBy("startTime")
      )
    );
    const trips = tripsQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const res = {};
    res["Unscheduled Trips"] = trips.filter(
      (trip) => trip.bus === "" || trip.bus === null
    );
    listOfDrivers.forEach((driver) => {
      res[driver.id] = trips.filter((trip) => trip.bus === driver.id);
    });
    setListOfTripsByDriver(res);
  };

  const populateListOfDrivers = async () => {
    const driverQuery = await getDocs(collection(db, "Bus Drivers"));
    const drivers = driverQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setListOfDrivers(drivers);
  };

  const updateListOfTripsByDriver = () => {
    populateListOfTripsByDriver();
  };

  useEffect(() => {
    populateListOfDrivers();
  }, []);

  useEffect(() => {
    if (listOfDrivers.length > 0) {
      populateListOfTripsByDriver();
    }
  }, [selectedDate, listOfDrivers]);

  return (
    <>
      <Title>Scheduling Page</Title>
      <div>
        <Space align="center">
          <Title level={3} style={{ marginTop: "12px" }}>
            Date selected:
          </Title>
          <DatePicker
            id="date-input"
            format="DD-MM-YYYY"
            defaultValue={dayjs()}
            onChange={handleDateChange}
          />
        </Space>
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
