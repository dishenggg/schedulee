import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useEffect, useState, useRef } from 'react';
import { db } from '../../firebase';
import {
    doc,
    getDoc,
    updateDoc,
    arrayRemove,
    arrayUnion,
    runTransaction,
} from 'firebase/firestore';
import { Title } from '../../components/Typography/Title';
import {
    ParseTimeFromFirestoreToString,
    parseDateTimeFromStringToFireStore,
    ParseTimeFromFirestore,
} from '../../utils/ParseTime';
import { message } from 'antd';

export default function SchedulingApp({
    selectedDate,
    editable,
    listOfTripsByDriver,
    drivers,
    updateListOfTripsByDriver,
}) {
    const unscheduledTrips = 'Unscheduled Trips';

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
        setDriverDetails(res);
    };

    const getRowId = (params) => params.data.id;

    const onGridReady = (params, gridKey) => {
        const newDropZoneParams = params.api.getRowDropZoneParams();

        for (const grid in gridRefs.current) {
            const oldDropZoneParams =
                gridRefs.current[grid].getRowDropZoneParams();

            params.api.addRowDropZone(oldDropZoneParams); // Add all exising gridRefs to params dropzone
            gridRefs.current[grid].addRowDropZone(newDropZoneParams); // Add params too all existing gridRefs
        }

        // Add params to gridRefs and gridMap
        gridRefs.current[gridKey] = params.api;
        gridMapToDriverId[params.api.getGridId()] = gridKey;
    };

    useEffect(() => {
        if (drivers.length > 0) {
            populateDriverDetails();
        }
    }, [drivers]);

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
                    const tripStartTime = ParseTimeFromFirestore(
                        trip.startTime
                    );
                    const tripEndTime = ParseTimeFromFirestore(trip.endTime);
                    const diffNewStartOldEnd = newTripStartTime.diff(
                        tripEndTime,
                        'minute'
                    );
                    const diffNewEndOldStart = newTripEndTime.diff(
                        tripStartTime,
                        'minute'
                    );
                    if (
                        (diffNewStartOldEnd >= -15 &&
                            diffNewStartOldEnd <= 15) ||
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
                    const docRef = doc(
                        db,
                        'Dates',
                        selectedDate,
                        'trips',
                        data.id
                    );
                    const docSnapshot = await transaction.get(docRef);
                    transaction.update(docSnapshot.ref, {
                        bus: arrayRemove(oldId),
                        numAssigned: docSnapshot.data().numAssigned - 1,
                    });
                });
            } else {
                await runTransaction(db, async (transaction) => {
                    const docRef = doc(
                        db,
                        'Dates',
                        selectedDate,
                        'trips',
                        data.id
                    );
                    const docSnapshot = await transaction.get(docRef);
                    transaction.update(docSnapshot.ref, {
                        bus: arrayUnion(newId),
                        numAssigned: docSnapshot.data().numAssigned + 1,
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
                      headerName: 'Time',
                      field: 'startTime',
                      maxWidth: 100,
                      rowDrag: editable,
                  },
                  {
                      headerName: 'Desc',
                      flex: 3,
                      field: 'tripDescription',
                      autoHeight: true,
                      wrapText: true,
                  },
                  {
                      headerName: 'Pax',
                      flex: 2,
                      field: 'numberPax',
                  },
                  {
                      headerName: 'Assigned',
                      flex: 2,
                      valueGetter: (params) =>
                          `${params.data.numAssigned}/${params.data.numberBus}`,
                  },
              ]
            : [
                  {
                      headerName: 'Time',
                      field: 'startTime',
                      maxWidth: 100,
                      rowDrag: editable,
                  },
                  {
                      headerName: 'Trip Description',
                      flex: 2,
                      field: 'tripDescription',
                      autoHeight: true,
                      wrapText: true,
                  },
              ];
    };

    const generateGrid = (driverId) => {
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

        var busSize = '';
        var contactNumber = '';
        var remarks = '';
        const driverObj = driverDetails[driverId];
        const driverData = { ...driverObj }; // it doesnt work without this i dont know why
        if (driverId !== unscheduledTrips) {
            busSize = driverData['busSize'];
            contactNumber = driverData['contactNumber'];
            remarks = driverData['remarks'];
        }

        return (
            <>
                <Title level={4}>
                    {driverId === unscheduledTrips
                        ? `${driverId}`
                        : `${driverId} (${busSize}) HP: ${contactNumber} ${
                              remarks || ''
                          }`}
                </Title>
                <div
                    className={
                        localStorage.getItem('darkMode') === 'true'
                            ? 'ag-theme-alpine-dark'
                            : 'ag-theme-alpine'
                    }
                    style={{ height: '400px', width: '100%' }}
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

    return (
        <div
            style={{
                padding: '10px 5px 40px 5px',
            }}
        >
            <div
                style={{
                    position: 'fixed',
                    height: '600px',
                    width: '400px',
                    marginLeft: '20px',
                }}
            >
                {generateGrid(unscheduledTrips)}
            </div>
            <div
                className="driver-tables-container"
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginLeft: '270px',
                }}
            >
                {Object.keys(listOfTripsByDriver).map((driverId, i) => {
                    if (driverId === unscheduledTrips) {
                        return <></>;
                    }
                    return (
                        <div
                            key={driverId}
                            style={{
                                height: '400px',
                                width: '33%',
                                marginBottom: '40px',
                                marginRight: '15px',
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
