import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { Title } from "../../components/Typography/Title";

export default function SchedulingApp({ selectedDate, editable }) {
  const [listOfTripsByDriver, setListOfTripsByDriver] = useState({});
  const [driverDetails, setDriverDetails] = useState({});
  const gridRefs = useRef({});

  const populateDriverDetails = async () => {
    const res = {};
    const driverQuery = await getDocs(collection(db, "Bus Drivers"));
    driverQuery.docs
      .map((doc) => doc.data())
      .forEach((row) => {
        res[row.busNumber] = { ...row };
      });
    setDriverDetails(res);
  };
  const populateListOfTripsByDriver = async () => {
    const driverQuery = await getDocs(collection(db, "Bus Drivers"));
    const drivers = driverQuery.docs.map((doc) => doc.id);
    const tripsQuery = await getDocs(
      collection(db, "Dates", selectedDate, "trips")
    );
    const trips = tripsQuery.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const res = {};
    res["Unscheduled Trips"] = trips.filter(
      (trip) => trip.bus === "" || trip.bus === null
    );
    drivers.forEach((driverId) => {
      res[driverId] = trips.filter((trip) => trip.bus === driverId);
    });
    setListOfTripsByDriver(res);
  };

  const getRowId = (params) => params.data.id;

  const onGridReady = (params, gridKey) => {
    gridRefs.current[gridKey] = params.api;
  };

  const gridDragOver = (event) => {
    const dragSupported = event.dataTransfer.types.length;
    if (dragSupported) {
      event.dataTransfer.dropEffect = "move";
      event.preventDefault();
    }
  };

  const gridDrop = async (driverId, event) => {
    event.preventDefault();

    const jsonData = event.dataTransfer.getData("application/json");
    const data = JSON.parse(jsonData);

    // if data missing or data has no it, do nothing
    if (!data || data.id == null) {
      return;
    }
    const gridApi = gridRefs.current[driverId];

    // do nothing if row is already in the grid, otherwise we would have duplicates
    const rowAlreadyInGrid = !!gridApi.getRowNode(data.id);
    if (rowAlreadyInGrid) {
      return;
    }

    if (driverId === "Unscheduled Trips") {
      await updateDoc(doc(db, "Dates", selectedDate, "trips", data.id), {
        bus: "",
      });
    } else {
      await updateDoc(doc(db, "Dates", selectedDate, "trips", data.id), {
        bus: driverId,
      });
    }
    populateListOfTripsByDriver();
  };

  useEffect(() => {
    populateListOfTripsByDriver();
    populateDriverDetails();
  }, []);

  useEffect(() => {
    populateListOfTripsByDriver();
  }, [selectedDate]);

  const generateGrid = (driverId) => {
    const driverTripData = listOfTripsByDriver[driverId] || [];
    //({busSize}) {phoneNumber} {remarks}
    var busSize = "";
    var contactNumber = "";
    var remarks = "";
    const driverObj = driverDetails[driverId];
    const driverData = { ...driverObj }; // it doesnt work without this i dont know why
    if (driverId !== "Unscheduled Trips") {
      busSize = driverData["busSize"];
      contactNumber = driverData["contactNumber"];
      remarks = driverData["remarks"];
    }

    return (
      <>
        <Title level={4}>
          {driverId}({busSize}) {contactNumber} {remarks}
        </Title>
        <div
          className={
            localStorage.getItem("darkMode") === "true"
              ? "ag-theme-alpine-dark"
              : "ag-theme-alpine"
          }
          style={{ height: "400px", width: "100%" }}
          onDragOver={gridDragOver}
          onDrop={(e) => gridDrop(driverId, e)}
        >
          <AgGridReact
            columnDefs={[
              {
                headerName: "Time",
                field: "startTime",
                dndSource: editable,
              },
              {
                headerName: "Description",
                field: "description",
              },
            ]}
            rowData={driverTripData}
            suppressHorizontalScroll={true}
            onGridReady={(params) => onGridReady(params, driverId)}
            rowDragManaged={true}
            animateRows={true}
            getRowId={getRowId}
          />
        </div>
      </>
    );
  };

  return (
    <div
      style={{
        padding: "10px 5px 40px 5px",
      }}
    >
      <div
        style={{
          position: "fixed",
          height: "600px",
          width: "400px",
          marginLeft: "20px",
        }}
      >
        {generateGrid("Unscheduled Trips")}
      </div>
      <div
        className="driver-tables-container"
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          marginLeft: "270px",
        }}
      >
        {Object.keys(listOfTripsByDriver).map((driverId, i) => {
          var pos;
          if (driverId === "Unscheduled Trips") {
            return;
          }
          return (
            <div
              key={driverId}
              style={{
                height: "400px",
                width: "33%",
                marginBottom: "40px",
                marginRight: "15px",
              }}
            >
              {generateGrid(driverId)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
