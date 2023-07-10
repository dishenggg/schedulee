import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { collection, getDocs, where, query } from "firebase/firestore";

export default function SchedulingApp({ selectedDate }) {
  const [listOfDrivers, setListOfDrivers] = useState([]);
  const [listOfTrips, setListOfTrips] = useState([]);
  const [unscheduledTrips, setUnscheduledTrips] = useState([]);

  const fetchDrivers = async () => {
    const querySnapshot = await getDocs(collection(db, "Bus Drivers"));
    const drivers = querySnapshot.docs.map((doc) => doc.id);
    setListOfDrivers(drivers);
  };

  const fetchTrips = async (driverId = null) => {
    const tripsCollectionRef = collection(db, "Dates", selectedDate, "trips");
    let querySnapshot;

    if (driverId) {
      const driverTrips = query(
        tripsCollectionRef,
        where("bus", "==", driverId)
      );
      querySnapshot = await getDocs(driverTrips);
    } else {
      querySnapshot = await getDocs(tripsCollectionRef);
    }

    const trips = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (driverId) {
      setListOfTrips((prevTrips) => [
        ...prevTrips.filter((trip) => trip.driverId !== driverId),
        { driverId, trips },
      ]);
    } else {
      setUnscheduledTrips(trips.filter((trip) => trip.bus === ""));
      setListOfTrips([]);
    }
  };

  const fetchDriverTrips = async (driverId) => {
    await fetchTrips(driverId);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  useEffect(() => {
    fetchTrips(); // Fetch unscheduled trips
    listOfDrivers.forEach((driverId) => {
      fetchDriverTrips(driverId);
    });
  }, [selectedDate, listOfDrivers]);

  return (
    <div
      className="driver-tables-container"
      style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}
    >
      <div
        className="driver-table"
        style={{ width: "25%", marginBottom: "20px", marginRight: "15px" }}
      >
        <h3>Unscheduled Trips</h3>
        <div
          className="ag-theme-alpine"
          style={{ height: "400px", width: "100%" }}
        >
          <AgGridReact
            columnDefs={[
              { headerName: "Time", field: "time" },
              { headerName: "Description", field: "description" },
            ]}
            rowData={unscheduledTrips}
            suppressHorizontalScroll={true}
          />
        </div>
      </div>

      {listOfDrivers.map((driverId) => {
        const driverTripData = listOfTrips.find(
          (tripData) => tripData.driverId === driverId
        );
        if (!driverTripData) {
          return null;
        }

        const driverTrips = driverTripData.trips;
        const scheduledDriverTrips = driverTrips.filter(
          (trip) => trip.bus === driverId
        );

        return (
          <div
            className="driver-table"
            key={driverId}
            style={{ width: "25%", marginBottom: "20px", marginRight: "15px" }}
          >
            <h3>{driverId}</h3>
            <div
              className="ag-theme-alpine"
              style={{ height: "400px", width: "100%" }}
            >
              <AgGridReact
                columnDefs={[
                  { headerName: "Time", field: "time" },
                  { headerName: "Description", field: "description" },
                ]}
                rowData={scheduledDriverTrips}
                suppressHorizontalScroll={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
