import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { db } from "../../firebase";
import { Space, DatePicker } from "antd";
import dayjs from "dayjs";
import { Title } from "../../components/Typography/Title";
import CustomerTrips from "./customerTrips";

const CustomerDetailsPage = () => {
  const { customerName } = useParams();
  const [listOfTrips, setListOfTrips] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = async (date) => {
    setSelectedDate(date.toDate());

    // Extract the year and month from the selected date
    const year = date.year();
    const month = date.month() + 1; // month in dayjs is 0-based index, so we add 1

    // Generate the date array using the selected year and month
    const dateArray = generateDateArray(year, month);

    // Fetch the trips and update the state when the data is available
    const trips = await fetchTrips(dateArray);
    setListOfTrips(trips);
  };

  function generateDateArray(year, month) {
    const formattedDates = [];
    const daysInMonth = new Date(year, month, 0).getDate();

    for (let day = daysInMonth; day >= 1; day--) {
      const formattedDay = String(day).padStart(2, "0");
      const formattedMonth = String(month).padStart(2, "0");
      const formattedYear = String(year);
      const formattedDate = `${formattedDay}${formattedMonth}${formattedYear}`;
      formattedDates.push(formattedDate);
    }

    return formattedDates;
  }

  const fetchTrips = async (formattedDates) => {
    try {
      const promises = formattedDates.map(async (date) => {
        const querySnapshot = await getDocs(
          query(
            collection(db, "Dates", date, "trips"),
            where("customerName", "==", customerName)
          )
        );
        return querySnapshot.docs.map((trip) => trip.data());
      });
      const results = await Promise.all(promises);
      const list = results.flat(); // Flatten the array of arrays into a single array
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
    const initialMonth = initialDate.getMonth() + 1;
    const initialDateArray = generateDateArray(initialYear, initialMonth);

    const fetchInitialTrips = async () => {
      const trips = await fetchTrips(initialDateArray);
      setListOfTrips(trips);
    };

    fetchInitialTrips();
  }, [customerName]);

  return (
    <>
      <div>
        <Title level={2}>All Trips for: {customerName}</Title>
        <Space align="center">
          <Title level={3} style={{ marginTop: "12px" }}>
            Date selected:
          </Title>
          <DatePicker
            allowClear={false}
            id="date-input"
            format="MM-YYYY"
            defaultValue={dayjs()}
            onChange={handleDateChange}
            picker="month"
          />
        </Space>
      </div>
      <CustomerTrips trips={listOfTrips} selectedDate={selectedDate} />
    </>
  );
};

export default CustomerDetailsPage;
