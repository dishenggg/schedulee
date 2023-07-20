import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useEffect, useState, useRef } from "react";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  runTransaction,
} from "firebase/firestore";
import { Title } from "../../components/Typography/Title";
import {
  ParseTimeFromFirestoreToString,
  parseDateTimeFromStringToFireStore,
  ParseTimeFromFirestore,
} from "../../utils/ParseTime";
import { message } from "antd";

export default function SchedulingApp({
  selectedDate,
  editable,
  listOfTripsByDriver,
  drivers,
  subCons,
  updateListOfTripsByDriver,
}) {
  const unscheduledTrips = "Unscheduled Trips";

  const [driverDetails, setDriverDetails] = useState({});
  const gridRefs = useRef({});
  const [gridMapToDriverId, setGridMapToDriverId] = useState({});
  const [dragStartId, setDragStartId] = useState(null);
  const [dragStarted, setDragStarted] = useState(false);

  const populateDriverDetails = async () => {
    const res = {};
    drivers.forEach((row) => {
      res[row.busNumber] = { ...row };
    });
    subCons.forEach((row) => {
      res[row.busNumber] = { ...row };
    });
    setDriverDetails(res);
  };

  const getRowId = (params) => params.data.id;

  const onGridReady = (params, gridKey) => {
    const newDropZoneParams = params.api.getRowDropZoneParams();

    for (const grid in gridRefs.current) {
      const oldDropZoneParams = gridRefs.current[grid].getRowDropZoneParams();

      params.api.addRowDropZone(oldDropZoneParams); // Add all exising gridRefs to params dropzone
      gridRefs.current[grid].addRowDropZone(newDropZoneParams); // Add params too all existing gridRefs
    }

    // Add params to gridRefs and gridMap
    gridRefs.current[gridKey] = params.api;
    gridMapToDriverId[params.api.getGridId()] = gridKey;
  };

  useEffect(() => {
    populateDriverDetails();
  }, [drivers, subCons]);

  const onRowDragEnter = (params) => {
    const gridId = params.api.getGridId();
    if (!dragStarted) {
      setDragStarted(!dragStarted);
      setDragStartId(gridId);
    }
  };

  const onRowDragEnd = async (params) => {
    try {
      const oldId = gridMapToDriverId[dragStartId];
      const newId = gridMapToDriverId[params.api.getGridId()];
      const data = params.node.data;
      // Do nothing if dropped in same grid
      if (oldId === newId) {
        return;
      }

      // do nothing if it clashes
      if (newId !== unscheduledTrips) {
        const newTripStartTime = parseDateTimeFromStringToFireStore(
          data.startTime,
          selectedDate
        );
        const newTripEndTime = parseDateTimeFromStringToFireStore(
          data.endTime,
          selectedDate
        );

        for (const trip of listOfTripsByDriver[newId]) {
          const tripStartTime = ParseTimeFromFirestore(trip.startTime);
          const tripEndTime = ParseTimeFromFirestore(trip.endTime);
          const diffNewStartOldEnd = newTripStartTime.diff(
            tripEndTime,
            "minute"
          );
          const diffNewEndOldStart = newTripEndTime.diff(
            tripStartTime,
            "minute"
          );
          if (
            (diffNewStartOldEnd >= -15 && diffNewStartOldEnd <= 15) ||
            (diffNewEndOldStart >= -15 && diffNewEndOldStart <= 15)
          ) {
            message.error(
              `${newId} cannot be scheduled this trip as it is within 15 minutes of another trip.`
            );
            return;
          }
        }
      }

      if (newId === unscheduledTrips) {
        await runTransaction(db, async (transaction) => {
          const docRef = doc(db, "Dates", selectedDate, "trips", data.id);
          const docSnapshot = await transaction.get(docRef);
          transaction.update(docSnapshot.ref, {
            bus: arrayRemove(oldId),
            numBusAssigned: docSnapshot.data().numBusAssigned - 1,
          });
        });
      } else {
        await runTransaction(db, async (transaction) => {
          const docRef = doc(db, "Dates", selectedDate, "trips", data.id);
          const docSnapshot = await transaction.get(docRef);
          transaction.update(docSnapshot.ref, {
            bus: arrayUnion(newId),
            numBusAssigned: docSnapshot.data().numBusAssigned + 1,
          });
        });
      }
      updateListOfTripsByDriver();
      setDragStarted(false);
      setDragStartId(null);
    } catch (error) {
      message.error(error.toString());
    }
  };

  const columnDefs = (driverId) => {
    return driverId === unscheduledTrips
      ? [
          {
            headerName: "Time",
            field: "startTime",
            maxWidth: 100,
            rowDrag: editable,
          },
          {
            headerName: "Desc",
            flex: 11,
            field: "tripDescription",
            autoHeight: true,
            wrapText: true,
          },
          {
            headerName: "Pax",
            flex: 2,
            field: "numPax",
          },
          {
            headerName: "",
            flex: 2,
            valueGetter: (params) =>
              `${params.data.numBus - params.data.numBusAssigned}/${
                params.data.numBus
              }`,
          },
        ]
      : [
          {
            headerName: "Time",
            field: "startTime",
            maxWidth: 100,
            rowDrag: editable,
          },
          {
            headerName: "Trip Description",
            flex: 2,
            field: "tripDescription",
            autoHeight: true,
            wrapText: true,
          },
        ];
  };

  const generateGrid = (driverId, style) => {
    const driverTrips = listOfTripsByDriver[driverId] || [];
    const driverTripData = JSON.parse(JSON.stringify(driverTrips)); // Deep copy to not mutate values

    driverTripData.map((row) => {
      row.startTime = ParseTimeFromFirestoreToString(row.startTime);
      if (row.startTime2) {
        row.startTime2 = ParseTimeFromFirestoreToString(row.startTime2);
      }
      if (row.endTime) {
        row.endTime = ParseTimeFromFirestoreToString(row.endTime);
      }
      return row;
    });

    var busSize = "";
    var contactNumber = "";
    var remarks = "";
    const driverObj = driverDetails[driverId];
    const driverData = { ...driverObj }; // it doesnt work without this i dont know why
    if (driverId !== unscheduledTrips) {
      busSize = driverData["busSize"];
      contactNumber = driverData["contactNumber"];
      remarks = driverData["remarks"];
    }

    return (
      <>
        <Title level={4}>
          {driverId === unscheduledTrips
            ? `${driverId}`
            : `${driverId} (${busSize}) HP: ${contactNumber} ${remarks || ""}`}
        </Title>
        <div
          className={
            localStorage.getItem("darkMode") === "true"
              ? "ag-theme-alpine-dark"
              : "ag-theme-alpine"
          }
          style={style}
        >
          <AgGridReact
            columnDefs={columnDefs(driverId)}
            rowData={driverTripData}
            suppressHorizontalScroll={true}
            onGridReady={(params) => onGridReady(params, driverId)}
            animateRows={true}
            getRowId={getRowId}
            onRowDragEnter={onRowDragEnter}
            onRowDragEnd={onRowDragEnd}
          />
        </div>
      </>
    );
  };

  const generateGrids = (drivers, gridStyle) => {
    return [...drivers].map((driver) => {
      const driverId = driver.id;
      return (
        <div key={driverId} style={gridStyle}>
          {generateGrid(driverId, gridStyle)}{" "}
          {/* Pass the gridStyle to generateGrid */}
        </div>
      );
    });
  };

  return (
    <div>
      <div
        style={{
          position: "fixed",
          height: "600px",
          width: "550px",
          marginLeft: "20px",
        }}
      >
        {generateGrid(unscheduledTrips, { height: "550px", width: "100%" })}
      </div>
      <div style={{ marginLeft: "600px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "10px",
          }}
        >
          {generateGrids(drivers, {
            height: "400px",
            width: "400px",
            margin: "10px 0px 30px 0px",
          })}
        </div>
        <Title level={2} style={{ marginTop: "60px" }}>
          Sub Con
        </Title>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
            gap: "10px",
            marginBottom: "50px",
          }}
        >
          {generateGrids(subCons, {
            height: "400px",
            width: "400px",
            margin: "10px 0px 30px 00px",
          })}
        </div>
      </div>
    </div>
  );
}
