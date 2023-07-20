import { useMemo, useRef, useCallback, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {
    ParseDateToFirestore,
    ParseTimeFromFirestoreToString,
    ParseTimeToFirestore,
} from '../../utils/ParseTime';
import { Title } from '../../components/Typography/Title';
import { Button, Select, message } from 'antd';
import { db } from '../../firebase';
import { collection, updateDoc, doc } from 'firebase/firestore';
import BusCellRenderer from './BusCellRenderer';

function AllTrips({
    drivers,
    subCons,
    trips,
    selectedDate,
    listOfTripsByDriver,
    dateWithoutDashes,
}) {
    const gridRef = useRef();
    const [rowStatus, setRowStatus] = useState({});
    const listOfDriverIds = useMemo(() => {
        return [...drivers, ...subCons].map((driver) => ({
            label: driver.id,
            value: driver.id,
        }));
    }, [drivers, subCons]);

    const defaultColDef = useMemo(() => {
        return {
            editable: false,
            sortable: true,
            suppressMovable: true,
            flex: 3,
            minWidth: 100,
        };
    }, []);

    const formatTime = (params) => {
        return ParseTimeFromFirestoreToString(params.value);
    };

    const busCellRenderer = (params) => {
        return (
            <BusCellRenderer
                params={params}
                drivers={drivers}
                subCons={subCons}
                listOfDriverIds={listOfDriverIds}
                listOfTripsByDriver={listOfTripsByDriver}
                dateWithoutDashes={dateWithoutDashes}
            />
        );
    };

    const columnDefs = [
        {
            headerName: 'Start Time',
            field: 'startTime',
            flex: 2,
            valueFormatter: formatTime,
            maxWidth: 100,
        },
        {
            headerName: 'Customer Name',
            field: 'customerName',
            flex: 2,
        },
        {
            headerName: 'Contact Name',
            field: 'contactName',
            flex: 2,
        },
        {
            headerName: 'Contact Number',
            field: 'contactNumber',
            flex: 2,
        },
        {
            headerName: 'Pick Up',
            field: 'pickUpPoint',
            flex: 4,
        },
        {
            headerName: 'Drop Off',
            field: 'dropOffPoint',
            flex: 4,
        },
        {
            headerName: 'No. Pax',
            field: 'numPax',
            flex: 1,
        },
        {
            headerName: 'No. Bus',
            field: 'numBus',
            flex: 1,
        },
        {
            headerName: 'Bus',
            field: 'bus',
            flex: 4,
            cellRenderer: busCellRenderer,
            autoHeight: true,
            wrapText: true,
        },
    ];

    const exportToExcel = useCallback(() => {
        gridRef.current.api.exportDataAsCsv();
    }, []);

    return (
        <>
            <Title level={2}> {selectedDate}</Title>
            <Button onClick={exportToExcel}>Download</Button>
            <div
                className={
                    localStorage.getItem('darkMode') === 'true'
                        ? 'ag-theme-alpine-dark'
                        : 'ag-theme-alpine'
                }
                style={{ height: '400px', width: '100%' }}
            >
                <AgGridReact
                    ref={gridRef}
                    rowData={trips}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    stopEditingWhenCellsLoseFocus={true}
                />
            </div>
        </>
    );
}

export default AllTrips;
