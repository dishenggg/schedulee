import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useEffect, useState, useMemo } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

export default function SchedulingApp() {
  const [listOfDrivers, setListOfDrivers] = useState([]);
  const [listOfTrips, setListOfTrips] = useState([]);
  const [unscheduledTrips, setUnscheduledTrips] = useState([]);

  const fetchDrivers = async () => {
    const querySnapshot = await getDocs(collection(db, "Bus Drivers"));
    const drivers = [];
    querySnapshot.forEach((doc) => {
      drivers.push(doc.id);
    });
    setListOfDrivers(drivers); // Update the state with the fetched drivers
  };

  const fetchTrips = async () => {
    const scheduledTrips = query(
      collection(db, "Trips"),
      where("bus", "==", "")
    );
    const querySnapshot = await getDocs(scheduledTrips);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    setUnscheduledTrips(trips); // Update the state with the fetched unscheduled trips
  };

  const fetchDriverTrips = async (driverId) => {
    const driverTrips = query(
      collection(db, "Trips"),
      where("bus", "==", driverId)
    );
    const querySnapshot = await getDocs(driverTrips);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    setListOfTrips((prevTrips) => [...prevTrips, { driverId, trips }]); // Update the state with the fetched driver trips
  };

  useEffect(() => {
    fetchDrivers();
    fetchTrips();
  }, []);

  useEffect(() => {
    listOfDrivers.forEach((driverId) => {
      fetchDriverTrips(driverId);
    });
  }, [listOfDrivers]);

  console.log(listOfTrips);

  return (
    <div
      className="driver-tables-container"
      style={{ display: "flex", flexWrap: "wrap" }}
    >
      <div
        className="driver-table"
        style={{ width: "33%", marginBottom: "20px" }}
      >
        <h3>Unscheduled Trips</h3>
        <div
          className="ag-theme-alpine"
          style={{ height: "400px", width: "100%" }}
        >
          <AgGridReact
            columnDefs={[
              { headerName: "Trip ID", field: "id" },
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
        console.log(driverTrips);

        return (
          <div
            className="driver-table"
            key={driverId}
            style={{ width: "33%", marginBottom: "20px" }}
          >
            <h3>{driverId}</h3>
            <div
              className="ag-theme-alpine"
              style={{ height: "400px", width: "100%" }}
            >
              <AgGridReact
                columnDefs={[
                  { headerName: "Trip ID", field: "id" },
                  { headerName: "Description", field: "description" },
                ]}
                rowData={driverTrips}
                suppressHorizontalScroll={true}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
