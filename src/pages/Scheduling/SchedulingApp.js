import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { db } from "../../firebase";
import {
  doc,
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
import { Button, message } from "antd";
import { CopyOutlined, RollbackOutlined } from "@ant-design/icons";

export default function SchedulingApp({
  selectedDate,
  editable,
  listOfTripsByDriver,
  listOfTripsBySubCon,
  listofUnscheduledTrips,
  drivers,
  subCons,
  updateListOfTripsByDriver,
  driverDetails,
}) {
  const unscheduledTrips = "Unscheduled Trips";
  const gridRefs = useRef({});
  const gridMapToDriverId = useRef({});
  const [dragStartId, setDragStartId] = useState(null);
  const [dragStarted, setDragStarted] = useState(false);
  const [displayedGridIds, setDisplayedGridIds] = useState(new Set());
  const [scheduledTrips, setScheduledTrips] = useState([]);
  const subConSet = useMemo(
    () => new Set(subCons.map((subCon) => subCon.tag)),
    [subCons]
  );

  const getRowId = useCallback((params) => params.data.id, []);

  const onGridReady = useCallback((params, gridKey) => {
    for (const grid in gridRefs.current) {
      const oldDropZoneParams = gridRefs.current[grid].getRowDropZoneParams();

      params.api.addRowDropZone(oldDropZoneParams); // Add all exising gridRefs to params dropzone
      const newDropZoneParams = params.api.getRowDropZoneParams();
      gridRefs.current[grid].addRowDropZone(newDropZoneParams); // Add params too all existing gridRefs
    }

    // Add params to gridRefs and gridMap
    gridRefs.current[gridKey] = params.api;
    gridMapToDriverId.current[params.api.getGridId()] = gridKey;
  }, []);

  const compactListOfTripsBySubcon = useMemo(() => {
    const res = {};
    Object.keys(listOfTripsBySubCon).forEach((subCon) => {
      const subConTrips = {};
      listOfTripsBySubCon[subCon].forEach((trip) => {
        if (subConTrips.hasOwnProperty(trip.id)) {
          const { count, ...rest } = subConTrips[trip.id];
          subConTrips[trip.id] = { count: count + 1, ...rest };
        } else {
          subConTrips[trip.id] = { ...trip, count: 1 };
        }
      });
      res[subCon] = Object.values(subConTrips);
    });
    return res;
  }, [listOfTripsBySubCon]);

  useEffect(() => {
    setScheduledTrips({ ...listOfTripsByDriver, ...listOfTripsBySubCon });
  }, [listOfTripsBySubCon, listOfTripsByDriver]);

  useEffect(() => {
    setDisplayedGridIds(new Set(Object.keys(scheduledTrips)));
  }, [scheduledTrips]);

  const checkTimeClash = useCallback(
    (data, driverId) => {
      if (subConSet.has(driverId)) return false;
      // Check for timing clashes with existing trips
      const newTripStartTime = parseDateTimeFromStringToFireStore(
        data.startTime,
        selectedDate
      );
      const newTripEndTime = parseDateTimeFromStringToFireStore(
        data.endTime,
        selectedDate
      );

      for (const trip of listOfTripsByDriver[driverId] || []) {
        const tripStartTime = ParseTimeFromFirestore(trip.startTime).add(
          -15,
          "minute"
        );
        const tripEndTime = ParseTimeFromFirestore(trip.endTime).add(
          15,
          "minute"
        );
        const diffNewStartOldEnd = newTripStartTime.diff(tripEndTime, "minute");
        const diffNewEndOldStart = newTripEndTime.diff(tripStartTime, "minute");
        if (diffNewEndOldStart >= 0 && diffNewStartOldEnd <= 0) {
          return true;
        }
      }
      return false;
    },
    [listOfTripsByDriver, selectedDate]
  );

  const onRowDragEnter = (params) => {
    const gridId = params.api.getGridId();
    if (!dragStarted) {
      setDragStarted(true);
      setDragStartId(gridId);

      // Conditionally show grids with busSize < paxSize or timing clashes
      const gridsToShow = new Set([...subCons.map((subcon) => subcon.id)]);
      drivers.forEach((driver) => {
        const driverId = driver.id;
        const driverObj = driverDetails[driverId];
        const busSize = driverObj.busSize;
        const draggedRowData = params.node.data;
        const paxSize = draggedRowData.numPax;

        if (busSize < paxSize) {
          // Hide grid if bus size is smaller than required
          return;
        }
        if (!checkTimeClash(draggedRowData, driverId)) {
          // Display grid if there are no clashes or bus size issues
          gridsToShow.add(driverId);
        }
      });
      setDisplayedGridIds(gridsToShow);
    }
  };

  const onRowDragEnd = async (params) => {
    const removeFromArr = (array, item) => {
      var index = array.indexOf(item);
      if (index !== -1) {
        array.splice(index, 1);
      }
    };
    try {
      const oldId = gridMapToDriverId.current[dragStartId];
      const newId = gridMapToDriverId.current[params.api.getGridId()];
      const data = params.node.data;
      // Do nothing if dropped in same grid
      if (oldId === newId) {
        return;
      }

      // Do nothing if it clashes
      if (newId !== unscheduledTrips && checkTimeClash(data, newId)) {
        message.error(
          `${newId} cannot be scheduled this trip as it is within 15 minutes of another trip.`
        );
        return;
      }

      // Do nothing if busSize is smaller than required
      const driverObj = driverDetails[newId];
      const driverData = { ...driverObj }; // it doesnt work without this i dont know why
      const busSize = driverData.busSize;
      if (data.numPax > busSize) {
        message.error(
          `${newId} cannot be scheduled this trip as the bus size is too small.`
        );
        return;
      }

      const docRef = doc(db, "Trips", data.id);
      if (newId === unscheduledTrips) {
        await runTransaction(db, async (transaction) => {
          const docSnapshot = await transaction.get(docRef);
          const busArr = docSnapshot.data().bus;
          removeFromArr(busArr, oldId);
          transaction.update(docSnapshot.ref, {
            bus: busArr,
            numBusAssigned: busArr.length,
          });
        });
      } else if (oldId === unscheduledTrips) {
        await runTransaction(db, async (transaction) => {
          const docSnapshot = await transaction.get(docRef);
          const busArr = docSnapshot.data().bus;
          busArr.push(newId);
          transaction.update(docSnapshot.ref, {
            bus: busArr,
            numBusAssigned: busArr.length,
          });
        });
      } else {
        await runTransaction(db, async (transaction) => {
          const docSnapshot = await transaction.get(docRef);
          const busArr = docSnapshot.data().bus;
          removeFromArr(busArr, oldId);
          busArr.push(newId);
          transaction.update(docSnapshot.ref, {
            bus: busArr,
          });
        });
      }
      updateListOfTripsByDriver();
    } catch (error) {
      message.error(error.toString());
    } finally {
      setDragStarted(false);
      setDragStartId(null);
      setDisplayedGridIds(new Set(Object.keys(scheduledTrips)));
    }
  };

  const onDragStopped = () => {
    setDisplayedGridIds(new Set(Object.keys(scheduledTrips)));
  };

  const defaultColDef = useMemo(() => {
    return {
      suppressMovable: true,
    };
  }, []);

  const unassignCellRenderer = useCallback(
    (params) => {
      const handleClick = async (e) => {
        e.preventDefault();
        const data = params.node.data;
        const docRef = doc(db, "Trips", data.id);
        try {
          await runTransaction(db, async (transaction) => {
            const docSnapshot = await transaction.get(docRef);
            transaction.update(docSnapshot.ref, {
              bus: arrayRemove(params.driverId),
              numBusAssigned: docSnapshot.data().numBusAssigned - 1,
            });
          });
          message.success(`Removed trip from ${params.driverId}`);
          updateListOfTripsByDriver();
        } catch (error) {
          message.error(error);
        }
      };

      return (
        <Button
          onClick={handleClick}
          icon={<RollbackOutlined />}
          size="small"
        />
      );
    },
    [selectedDate, updateListOfTripsByDriver]
  );

  const columnDefs = useCallback(
    (driverId) => {
      const cols = [
        {
          headerName: "Time",
          valueGetter: (params) => {
            return params.data.type === "disposal" ||
              params.data.type === "tour"
              ? `${params.data.startTime}\n${params.data.endTime}`
              : `${params.data.startTime}`;
          },
          maxWidth: 100,
          rowDrag: true,
          autoHeight: true,
          wrapText: true,
          cellStyle: (params) => {
            return (
              (params.data.type === "disposal" ||
                params.data.type === "tour") && {
                "white-space": "pre",
                "line-height": "20px",
                "padding-top": "5px",
                "padding-bottom": "5px",
              }
            );
          },
        },
        {
          headerName: "Trip Description",
          flex: 22,
          field: "tripDescription",
          autoHeight: true,
          wrapText: true,
        },
      ];

      if (driverId !== unscheduledTrips) {
        return [
          ...cols,
          {
            headerName: "",
            flex: 5,
            cellRenderer: unassignCellRenderer,
            cellRendererParams: {
              driverId: driverId,
            },
          },
          {
            headerName: "count",
            field: "count",
            flex: 1,
          },
        ];
      } else {
        return [
          ...cols,
          {
            headerName: "Pax",
            flex: 5,
            field: "numPax",
          },
          {
            headerName: "",
            flex: 5,
            valueGetter: (params) =>
              `${params.data.numBus - params.data.numBusAssigned}/${
                params.data.numBus
              }`,
          },
        ];
      }
    },
    [editable, unassignCellRenderer]
  );

  const copyToText = useCallback(
    (e, driverId, driverTripData) => {
      console.log(driverTripData);
      e.preventDefault();
      const textDate = `${selectedDate.substring(
        0,
        2
      )}/${selectedDate.substring(3, 5)}`;
      const res = [textDate, " ", driverId, "\n"];
      driverTripData.forEach((data) => {
        if (data.type === "disposal" || data.type === "tour") {
          res.push(`Time: ${data.startTime} to ${data.endTime}\n`);
          res.push(`${data.type}: ${data.tripDescription}`);
        } else {
          res.push(`Time: ${data.startTime}\n`);
          res.push(`From: ${data.pickUpPoint}\n`);
          res.push(`To: ${data.dropOffPoint}`);
        }
        res.push("\n\n");
      });
      res.pop();
      navigator.clipboard.writeText(res.join(""));
    },
    [selectedDate]
  );

  const generateGrid = (driverId, driverTrips, style) => {
    driverTrips = driverTrips || [];

    const driverTripData = driverTrips.map(
      ({ startTime, startTime2, endTime, ...rest }) => {
        startTime = ParseTimeFromFirestoreToString(startTime);
        if (startTime2) {
          startTime2 = ParseTimeFromFirestoreToString(startTime2);
        }
        if (endTime) {
          endTime = ParseTimeFromFirestoreToString(endTime);
        }
        return { startTime, startTime2, endTime, ...rest };
      }
    );

    const driverObj = driverDetails[driverId];
    const driverData = { ...driverObj }; // it doesnt work without this i dont know why

    const busSize = driverData["busSize"] ? `(${driverData["busSize"]})` : "";
    const contactNumber = driverData["contactNumber"]
      ? `HP: ${driverData["contactNumber"]}`
      : "";
    const remarks = driverData["remarks"] ? driverData["remarks"] : "";
    if (subConSet.has(driverId)) {
      driverId = driverDetails[driverId].tag;
    }

    return (
      <>
        <Title level={4}>
          {`${driverId} ${busSize} ${contactNumber} ${remarks}`}
          {driverId !== unscheduledTrips && (
            <Button
              onClick={(e) => copyToText(e, driverId, driverTripData)}
              shape={"circle"}
              icon={<CopyOutlined />}
            />
          )}
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
            defaultColDef={defaultColDef}
            columnDefs={columnDefs(driverId)}
            rowData={driverTripData}
            suppressHorizontalScroll={true}
            onGridReady={(params) => onGridReady(params, driverId)}
            animateRows={true}
            //getRowId={getRowId}
            onRowDragEnter={onRowDragEnter}
            onRowDragEnd={onRowDragEnd}
            onDragStopped={onDragStopped}
          />
        </div>
      </>
    );
  };

  const generateGrids = (drivers, listOfTripsByDriver, gridStyle) => {
    return [...drivers].map((driver) => {
      const driverId = driver.id;

      // Check if the gridId is present in the displayedGridIds state
      const isDisplayed = displayedGridIds.has(driverId);

      return (
        <div
          key={driverId}
          style={{
            ...gridStyle,
            display: isDisplayed ? "block" : "none",
          }}
        >
          {generateGrid(driverId, listOfTripsByDriver[driverId], gridStyle)}
          {/* Pass the gridStyle to generateGrid */}
        </div>
      );
    });
  };

  return (
    <div style={{ display: "flex" }}>
      <div
        style={{
          position: "sticky",
          top: "15%",
          height: "60dvh",
          width: "550px",
          marginLeft: "20px",
        }}
      >
        {generateGrid(unscheduledTrips, listofUnscheduledTrips, {
          height: "60dvh",
        })}
      </div>
      <div style={{ marginLeft: "50px", flexGrow: 1 }}>
        <Title level={2} style={{ marginTop: "0px" }}>
          Sub Cons
        </Title>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
            gap: "10px",
            marginBottom: "50px",
          }}
        >
          {generateGrids(subCons, compactListOfTripsBySubcon, {
            height: "400px",
            width: "500px",
            margin: "10px 0px 30px 00px",
          })}
        </div>
        <Title level={2} style={{ marginTop: "60px" }}>
          Drivers
        </Title>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(500px, 1fr))",
            gap: "10px",
          }}
        >
          {generateGrids(drivers, listOfTripsByDriver, {
            height: "400px",
            width: "500px",
            margin: "10px 0px 30px 0px",
          })}
        </div>
      </div>
    </div>
  );
}
