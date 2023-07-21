import { useMemo, useRef, useCallback, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  ParseDateToFirestore,
  ParseTimeFromFirestoreToString,
  ParseTimeToFirestore,
} from "../../utils/ParseTime";
import { Title } from "../../components/Typography/Title";
import { Button, Checkbox, Select, message } from "antd";
import { db } from "../../firebase";
import { collection, updateDoc, doc } from "firebase/firestore";
import BusCellRenderer from "./BusCellRenderer";
import { CheckOutlined, WarningOutlined } from "@ant-design/icons";

function AllTrips({
  drivers,
  subCons,
  trips,
  selectedDate,
  listOfTripsByDriver,
  dateWithoutDashes,
  updateListOfTripsByDriver,
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
        updateListOfTripsByDriver={updateListOfTripsByDriver}
      />
    );
  };

  const numUnassignedRenderer = (params) => {
    const numUnassigned = params.data.numBus - params.data.numBusAssigned;
    if (numUnassigned > 0) {
      return (
        <span>
          {`${params.data.numBus - params.data.numBusAssigned}/${
            params.data.numBus
          }`}
        </span>
      );
    } else if (numUnassigned < 0) {
      return <WarningOutlined />;
    } else {
      return <CheckOutlined />;
    }
  };

  const columnDefs = [
    {
      headerName: "Trip Type",
      field: "type",
      flex: 3,
    },
    {
      headerName: "Start Time",
      field: "startTime",
      flex: 6,
      valueFormatter: formatTime,
      maxWidth: 100,
    },
    {
      headerName: "Contact Name",
      field: "contactName",
      flex: 6,
    },
    {
      headerName: "Contact Number",
      field: "contactNumber",
      flex: 6,
    },
    {
      headerName: "Pick Up",
      field: "pickUpPoint",
      flex: 12,
    },
    {
      headerName: "Drop Off",
      field: "dropOffPoint",
      flex: 12,
    },
    {
      headerName: "No. Pax",
      field: "numPax",
      flex: 3,
    },
    {
      headerName: "No. Bus",
      field: "numBus",
      flex: 3,
    },

    {
      headerName: "Bus",
      field: "bus",
      flex: 16,
      cellRenderer: busCellRenderer,
      autoHeight: true,
      wrapText: true,
    },
    {
      headerName: "",
      flex: 1,
      cellRenderer: numUnassignedRenderer,
      valueGetter: (params) => params.data.numBus - params.data.numBusAssigned,
      filter: "agNumberColumnFilter",
      filterParams: {
        // pass in additional parameters to the Number Filter
      },
    },
  ];

  const exportToExcel = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, []);

  var filtered = false;

  const externalFilterChanged = useCallback((newValue) => {
    filtered = newValue;
    gridRef.current.api.onFilterChanged();
  }, []);

  const isExternalFilterPresent = useCallback(() => {
    // if ageType is not everyone, then we are filtering
    return filtered;
  }, []);

  const doesExternalFilterPass = useCallback(
    (node) => {
      if (node.data) {
        return node.data.numBusAssigned < node.data.numBus;
      }
      return true;
    },
    [filtered]
  );

  return (
    <>
      <Title level={2}> {selectedDate}</Title>
      <Button onClick={exportToExcel}>Download</Button>
      <Checkbox
        onChange={(e) => {
          externalFilterChanged(e.target.checked);
        }}
      >
        Show Only Unassigned
      </Checkbox>
      <div
        className={
          localStorage.getItem("darkMode") === "true"
            ? "ag-theme-alpine-dark"
            : "ag-theme-alpine"
        }
        style={{ height: "400px", width: "100%" }}
      >
        <AgGridReact
          ref={gridRef}
          rowData={trips}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          stopEditingWhenCellsLoseFocus={true}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
        />
      </div>
    </>
  );
}

export default AllTrips;
