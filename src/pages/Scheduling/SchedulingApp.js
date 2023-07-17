import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { useEffect, useState, useRef } from 'react';
import { db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';
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

    const populateDriverDetails = async () => {
        const res = {};
        drivers.forEach((row) => {
            res[row.busNumber] = { ...row };
        });
        setDriverDetails(res);
    };

    const getRowId = (params) => params.data.id;

    const onGridReady = (params, gridKey) => {
        gridRefs.current[gridKey] = params.api;
    };

    const gridDragOver = (event) => {
        const dragSupported = event.dataTransfer.types.length;
        if (dragSupported) {
            event.dataTransfer.dropEffect = 'move';
            event.preventDefault();
        }
    };

    const gridDrop = async (driverId, event) => {
        event.preventDefault();

        const jsonData = event.dataTransfer.getData('application/json');
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

        // do nothing if it clashes
        if (driverId !== unscheduledTrips) {
            const newTripStartTime = parseDateTimeFromStringToFireStore(
                data.startTime,
                selectedDate
            );
            const newTripEndTime = parseDateTimeFromStringToFireStore(
                data.endTime,
                selectedDate
            );

            for (const trip of listOfTripsByDriver[driverId]) {
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
                    message.error(
                        `${driverId} cannot be scheduled this trip as it is within 15 minutes of another trip.`
                    );
                    return;
                }
            }
        }

        if (driverId === unscheduledTrips) {
            await updateDoc(doc(db, 'Dates', selectedDate, 'trips', data.id), {
                bus: '',
            });
        } else {
            await updateDoc(doc(db, 'Dates', selectedDate, 'trips', data.id), {
                bus: driverId,
            });
        }
        updateListOfTripsByDriver();
    };

    useEffect(() => {
        if (drivers.length > 0) {
            populateDriverDetails();
        }
    }, [drivers]);

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
                    onDragOver={gridDragOver}
                    onDrop={(e) => gridDrop(driverId, e)}
                >
                    <AgGridReact
                        columnDefs={[
                            {
                                headerName: 'Time',
                                field: 'startTime',
                                maxWidth: 100,
                                dndSource: editable,
                            },
                            {
                                headerName: 'Trip Description',
                                flex: 2,
                                field: 'tripDescription',
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
                        return;
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
