import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useEffect, useState, useRef } from 'react';
import { db } from '../../firebase';
import {
    doc,
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
import { Button, message } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

export default function SchedulingApp({
    selectedDate,
    editable,
    listOfTripsByDriver,
    drivers,
    subCons,
    updateListOfTripsByDriver,
}) {
    const unscheduledTrips = 'Unscheduled Trips';

    const [driverDetails, setDriverDetails] = useState({});
    const gridRefs = useRef({});
    const [gridMapToDriverId, setGridMapToDriverId] = useState({});
    const [dragStartId, setDragStartId] = useState(null);
    const [dragStarted, setDragStarted] = useState(false);
    const [displayedGridIds, setDisplayedGridIds] = useState([]);

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
        for (const grid in gridRefs.current) {
            const oldDropZoneParams =
                gridRefs.current[grid].getRowDropZoneParams();

            params.api.addRowDropZone(oldDropZoneParams); // Add all exising gridRefs to params dropzone
            const newDropZoneParams = params.api.getRowDropZoneParams();
            gridRefs.current[grid].addRowDropZone(newDropZoneParams); // Add params too all existing gridRefs
        }

        // Add params to gridRefs and gridMap
        gridRefs.current[gridKey] = params.api;
        gridMapToDriverId[params.api.getGridId()] = gridKey;
    };

    useEffect(() => {
        populateDriverDetails();
    }, [drivers, subCons]);

    useEffect(() => {
        setDisplayedGridIds(Object.keys(listOfTripsByDriver));
    }, [listOfTripsByDriver]);

    const checkTimeClash = (data, driverId) => {
        if (driverId === unscheduledTrips) return false;
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
            const tripStartTime = ParseTimeFromFirestore(trip.startTime);
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
                (diffNewStartOldEnd >= -15 && diffNewStartOldEnd <= 15) ||
                (diffNewEndOldStart >= -15 && diffNewEndOldStart <= 15)
            ) {
                return true; // Hide grid if there is a timing clash
            }
        }
        return false;
    };

    const onRowDragEnter = (params) => {
        const gridId = params.api.getGridId();
        if (!dragStarted) {
            setDragStarted(true);
            setDragStartId(gridId);

            // Conditionally hide grids with busSize < paxSize or timing clashes
            const gridsToHide = Object.keys(listOfTripsByDriver).filter(
                (driverId) => {
                    if (driverId === unscheduledTrips) {
                        return false; // Always display unscheduled trips grid
                    }

                    const driverObj = driverDetails[driverId];
                    const busSize = driverObj.busSize;
                    const draggedRowData = params.node.data;
                    const paxSize = draggedRowData.numPax;

                    if (busSize < paxSize) {
                        return true; // Hide grid if bus size is smaller than required
                    }

                    return checkTimeClash(draggedRowData, driverId); // Display grid if there are no clashes or bus size issues
                }
            );

            const allGrids = Object.keys(listOfTripsByDriver);
            const displayedGridIds = allGrids.filter(
                (gridId) => !gridsToHide.includes(gridId)
            );
            setDisplayedGridIds(displayedGridIds);
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

            // Do nothing if it clashes
            if (checkTimeClash(data, newId)) {
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
            const docRef = doc(db, 'Dates', selectedDate, 'trips', data.id);
            if (newId === unscheduledTrips) {
                await runTransaction(db, async (transaction) => {
                    const docSnapshot = await transaction.get(docRef);
                    transaction.update(docSnapshot.ref, {
                        bus: arrayRemove(oldId),
                        numBusAssigned: docSnapshot.data().numBusAssigned - 1,
                    });
                });
            } else if (oldId === unscheduledTrips) {
                await runTransaction(db, async (transaction) => {
                    const docSnapshot = await transaction.get(docRef);
                    transaction.update(docSnapshot.ref, {
                        bus: arrayUnion(newId),
                        numBusAssigned: docSnapshot.data().numBusAssigned + 1,
                    });
                });
            } else {
                await runTransaction(db, async (transaction) => {
                    const docSnapshot = await transaction.get(docRef);
                    transaction.update(docSnapshot.ref, {
                        bus: arrayRemove(oldId),
                    });
                    transaction.update(docSnapshot.ref, {
                        bus: arrayUnion(newId),
                    });
                });
            }
            updateListOfTripsByDriver();
        } catch (error) {
            message.error(error.toString());
        } finally {
            setDragStarted(false);
            setDragStartId(null);
            setDisplayedGridIds(Object.keys(listOfTripsByDriver));
        }
    };

    const defaultColDef = {
        suppressMovable: true,
    };

    const columnDefs = (driverId) => {
        const cols = [
            {
                headerName: 'Time',
                valueGetter: (params) => {
                    return params.data.type === 'disposal'
                        ? `${params.data.startTime} - ${params.data.endTime}`
                        : `${params.data.startTime}`;
                },
                maxWidth: 145,
                rowDrag: editable,
                autoHeight: true,
                wrapText: true,
            },
            {
                headerName: 'Trip Description',
                flex: 22,
                field: 'tripDescription',
                autoHeight: true,
                wrapText: true,
            },
        ];
        if (driverId !== unscheduledTrips) {
            return cols;
        } else {
            return [
                ...cols,
                {
                    headerName: 'Pax',
                    flex: 5,
                    field: 'numPax',
                },
                {
                    headerName: '',
                    flex: 5,
                    valueGetter: (params) =>
                        `${params.data.numBus - params.data.numBusAssigned}/${
                            params.data.numBus
                        }`,
                },
            ];
        }
    };

    const copyToText = (e, driverTripData) => {
        e.preventDefault();
        const textDate = `${selectedDate.substring(
            0,
            2
        )}/${selectedDate.substring(2, 4)}`;
        const res = [textDate, '\n'];
        driverTripData.forEach((data) => {
            if (data.type === 'disposal') {
                res.push(`Time: ${data.startTime} to ${data.endTime}\n`);
                res.push(`Disposal: ${data.tripDescription}`);
            } else {
                res.push(`Time: ${data.startTime}\n`);
                res.push(`From: ${data.pickUpPoint}\n`);
                res.push(`To: ${data.dropOffPoint}`);
            }
            res.push('\n\n');
        });
        res.pop();
        navigator.clipboard.writeText(res.join(''));
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
                    {driverId !== unscheduledTrips && (
                        <Button
                            onClick={(e) => copyToText(e, driverTripData)}
                            shape={'circle'}
                        >
                            <CopyOutlined />
                        </Button>
                    )}
                </Title>

                <div
                    className={
                        localStorage.getItem('darkMode') === 'true'
                            ? 'ag-theme-alpine-dark'
                            : 'ag-theme-alpine'
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
            // Check if the gridId is present in the displayedGridIds state
            const isDisplayed = displayedGridIds.includes(driverId);

            return (
                <div
                    key={driverId}
                    style={{
                        ...gridStyle,
                        display: isDisplayed ? 'block' : 'none',
                    }}
                >
                    {generateGrid(driverId, gridStyle)}
                    {/* Pass the gridStyle to generateGrid */}
                </div>
            );
        });
    };

    return (
        <div>
            <div
                style={{
                    position: 'fixed',
                    height: '600px',
                    width: '550px',
                    marginLeft: '20px',
                }}
            >
                {generateGrid(unscheduledTrips, {
                    height: '550px',
                    width: '100%',
                })}
            </div>
            <div style={{ marginLeft: '600px' }}>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '10px',
                    }}
                >
                    {generateGrids(drivers, {
                        height: '400px',
                        width: '400px',
                        margin: '10px 0px 30px 0px',
                    })}
                </div>
                <Title level={2} style={{ marginTop: '60px' }}>
                    Sub Con
                </Title>
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns:
                            'repeat(auto-fit, minmax(400px, 1fr))',
                        gap: '10px',
                        marginBottom: '50px',
                    }}
                >
                    {generateGrids(subCons, {
                        height: '400px',
                        width: '400px',
                        margin: '10px 0px 30px 00px',
                    })}
                </div>
            </div>
        </div>
    );
}
