import { useMemo, useCallback, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  ParseTimeFromFirestoreToString,
  ParseTimeFromFirestore,
} from "../../utils/ParseTime";
import { Input } from "antd";

const SubConTrips = ({ trips }) => {
  const gridRef = useRef();
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

  const getTime = (params) => {
    const date = ParseTimeFromFirestore(params.value);
    return date.format("DD/MM/YYYY");
  };

  const onFilterTextBoxChanged = useCallback(() => {
    gridRef.current.api.setQuickFilter(
      document.getElementById("filter-text-box").value
    );
  }, []);

  const columnDefs = [
    {
      headerName: "Booking Date",
      field: "startTime",
      flex: 2,
      valueFormatter: getTime,
    },
    {
      headerName: "Pick Up",
      field: "pickUpPoint",
      flex: 4,
    },
    {
      headerName: "Time",
      field: "startTime",
      flex: 1,
      valueFormatter: formatTime,
    },
    {
      headerName: "Drop Off",
      field: "dropOffPoint",
      flex: 3,
    },
    {
      headerName: "No. Bus",
      field: "",
      flex: 1,
    },
    {
      headerName: "Amount",
      field: "subConPayment",
      flex: 1,
      editable: true,
    },
  ];

  return (
    <>
      <Input
        type="text"
        id="filter-text-box"
        placeholder="Search for..."
        onInput={onFilterTextBoxChanged}
        style={{
          width: "320px",
          marginBottom: "5px",
        }}
      />
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
          cacheQuickFilter={true}
        />
      </div>
    </>
  );
};

export default SubConTrips;
