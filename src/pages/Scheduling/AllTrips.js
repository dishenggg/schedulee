import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { ParseTimeFromFirestoreToString } from "../../utils/ParseTime";
import { Title } from "../../components/Typography/Title";

function AllTrips({ trips, selectedDate }) {
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

  const columnDefs = [
    {
      headerName: "Start Time",
      field: "startTime",
      flex: 2,
      valueFormatter: formatTime,
      maxWidth: 100,
    },
    {
      headerName: "Customer Name",
      field: "customerName",
      flex: 2,
    },
    {
      headerName: "Contact Name",
      field: "contactName",
      flex: 2,
    },
    {
      headerName: "Contact Number",
      field: "contactNumber",
      flex: 2,
    },
    {
      headerName: "Pick Up",
      field: "pickUpPoint",
      flex: 4,
    },
    {
      headerName: "Drop Off",
      field: "dropOffPoint",
      flex: 4,
    },
    {
      headerName: "No. Pax",
      field: "numberPax",
      flex: 1,
    },
    {
      headerName: "No. Bus",
      field: "numberBus",
      flex: 1,
    },
    {
      headerName: "Bus",
      field: "bus",
      flex: 2,
    },
  ];

  return (
    <>
      <Title level={2}> {selectedDate}</Title>
      <div
        className={
          localStorage.getItem("darkMode") === "true"
            ? "ag-theme-alpine-dark"
            : "ag-theme-alpine"
        }
        style={{ height: "400px", width: "100%" }}
      >
        <AgGridReact
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
