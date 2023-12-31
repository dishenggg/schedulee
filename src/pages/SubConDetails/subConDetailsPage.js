import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { Space, DatePicker } from "antd";
import dayjs from "dayjs";
import { Title } from "../../components/Typography/Title";
import SubConTrips from "./subConTrips";
import { ParseDateToFirestore } from "./../../utils/ParseTime";

const SubConDetailsPage = () => {
  const { SubConName } = useParams();
  const [listOfTrips, setListOfTrips] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const populateListOfTrips = async (date) => {
    const year = date.year();
    const month = date.month();
    const dates = getFirstAndLastDayOfMonth(month, year);
    const trips = await fetchTrips(SubConName, dates);
    setListOfTrips(trips);
  };

  function getFirstAndLastDayOfMonth(month, year) {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 1);
    return { firstDayOfMonth, lastDayOfMonth };
  }

  const updateListOfTripsByDriver = useCallback(() => {
    populateListOfTrips(selectedDate);
  }, [selectedDate]);

  const fetchTrips = async (SubConName, dates) => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "Trips"),
          where("bus", "array-contains", SubConName),
          where("startTime", ">=", ParseDateToFirestore(dates.firstDayOfMonth)),
          where("startTime", "<=", ParseDateToFirestore(dates.lastDayOfMonth))
        )
      );
      const list = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      return list;
    } catch (error) {
      console.error("Error fetching trips:", error);
      return [];
    }
  };

  useEffect(() => {
    // Fetch the trips and update the state when the component mounts
    const initialDate = new Date();
    const initialYear = initialDate.getFullYear();
    const initialMonth = initialDate.getMonth();
    const initialDateArray = getFirstAndLastDayOfMonth(
      initialMonth,
      initialYear
    );

    const fetchInitialTrips = async () => {
      const trips = await fetchTrips(SubConName, initialDateArray);
      setListOfTrips(trips);
    };

    fetchInitialTrips();
  }, [SubConName]);

  return (
    <>
      <div>
        <Title level={2}>All Trips for: {SubConName}</Title>
        <Space align="center">
          <Title level={3} style={{ marginTop: "12px" }}>
            Date selected:
          </Title>
          <DatePicker
            allowClear={false}
            id="date-input"
            format="MM-YYYY"
            defaultValue={dayjs()}
            onChange={(date) => populateListOfTrips(date)}
            picker="month"
          />
        </Space>
      </div>
      <SubConTrips
        trips={listOfTrips}
        selectedDate={selectedDate}
        updateListOfTripsByDriver={updateListOfTripsByDriver}
      />
    </>
  );
};

export default SubConDetailsPage;
