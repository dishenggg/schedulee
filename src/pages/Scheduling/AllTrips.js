import { useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
  ParseTimeFromFirestoreToString,
  FormatDateAndTime,
  ParseStringToDateTime,
} from "../../utils/ParseTime";
import { Title } from "../../components/Typography/Title";
import { Button, Checkbox, Col, Row, message, Popconfirm } from "antd";
import BusCellRenderer from "./BusCellRenderer";
import { CheckOutlined, WarningOutlined } from "@ant-design/icons";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

function AllTrips({
  drivers,
  subCons,
  trips,
  selectedDate,
  listOfTripsByDriver,
  updateListOfTripsByDriver,
  driverDetails,
}) {
  const gridRef = useRef();
  const listOfDriverIds = useMemo(() => {
    return [...drivers, ...subCons].map((driver) => ({
      label: driver.id,
      value: driver.id,
    }));
  }, [drivers, subCons]);

  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      sortable: true,
      suppressMovable: true,
      flex: 3,
      minWidth: 100,
    };
  }, []);

  const busCellRenderer = useCallback(
    (params) => {
      return (
        <BusCellRenderer
          params={params}
          listOfDriverIds={listOfDriverIds}
          listOfTripsByDriver={listOfTripsByDriver}
          selectedDate={selectedDate}
          updateListOfTripsByDriver={updateListOfTripsByDriver}
          driverDetails={driverDetails}
        />
      );
    },
    [
      driverDetails,
      listOfDriverIds,
      listOfTripsByDriver,
      selectedDate,
      updateListOfTripsByDriver,
    ]
  );

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

  const disposalOrTourColSpan = (params) => {
    const type = params.data.type;
    if (type === "disposal" || type === "tour") {
      return 2;
    } else {
      return 1;
    }
  };

  const timeColSpan = (params) => {
    const type = params.data.type;
    if (type === "disposal" || type === "tour") {
      return 1;
    } else {
      return 2;
    }
  };

  const onCellValueChanged = (params) => {
    const { id, ...updatedData } = params.data;
    try {
      //   validateRow(updatedData);
      const confirmUpdate = window.confirm(
        "Are you sure you want to Update this?"
      );
      if (confirmUpdate) {
        updateDoc(doc(db, "Trips", id), updatedData)
          .then(() => {
            message.success("Successfully Updated");
          })
          .catch((error) => {
            message.error("Failed to update trip: " + error);
          });
      }
    } catch (error) {
      message.error(error.toString());
    }
    updateListOfTripsByDriver();
  };

  const deleteCellRenderer = (params) => {
    const handleClick = () => {
      const rowData = params.node.data;
      handleDelete(rowData);
    };

    return (
      <Popconfirm
        title="Cancel Trip"
        description="Confirm Cancel Trip?"
        onConfirm={handleClick}
      >
        <Button danger size="small">
          Cancel
        </Button>
      </Popconfirm>
    );
  };

  const handleDelete = (data) => {
    deleteDoc(doc(db, "Trips", data.id))
      .then(() => {
        message.success("Trip deleted successfully!");
        updateListOfTripsByDriver();
      })
      .catch((error) => {
        message.error("Failed to delete trip: " + error);
      });
  };

  const pickUpValueGetter = (params) => {
    const type = params.data.type;
    if (type === "disposal" || type === "tour") {
      return params.data.tripDescription;
    } else {
      return params.data.pickUpPoint;
    }
  };

  const pickUpValueSetter = (params) => {
    const type = params.data.type;
    const newVal = params.newValue;
    const oldVal =
      type === "disposal"
        ? params.data.tripDescription
        : params.data.pickUpPoint;
    const valueChanged = newVal !== oldVal;
    if (valueChanged) {
      if (type === "disposal") {
        params.data.tripDescription = newVal;
      } else {
        params.data.pickUpPoint = newVal;
      }
    }
    return valueChanged;
  };

  const getStartDateTime = (params) => {
    return FormatDateAndTime(params.data.startTime);
  };

  const getEndDateTime = (params) => {
    return FormatDateAndTime(params.data.endTime);
  };

  const startTimeSet = (params) => {
    const newVal = params.newValue;
    const oldVal = params.data.startTime;
    const type = params.data.type;
    console.log(newVal, oldVal);
    console.log(params.data);
    console.log(params);
    const valueChanged = newVal !== oldVal;
    if (valueChanged) {
      if (type === "disposal") {
        params.data.startTime = timeSet(newVal);
      } else {
        params.data.startTime = timeSet(newVal);
        params.data.endTime = timeSet(newVal);
      }
      return valueChanged;
    }
  };

  const endTimeSet = (params) => {
    const newVal = params.newValue;
    const oldVal = params.data.endTime;
    const valueChanged = newVal !== oldVal;
    if (valueChanged) {
      params.data.endTime = timeSet(newVal);
    }
    return valueChanged;
  };

  const timeSet = (timeString) => {
    return ParseStringToDateTime(timeString);
  };

  const showStartTime = (params) => {
    return ParseTimeFromFirestoreToString(params.data.startTime);
  };

  const showEndTime = (params) => {
    return ParseTimeFromFirestoreToString(params.data.endTime);
  };

  const columnDefs = useMemo(() => {
    return [
      {
        headerName: "ID",
        valueGetter: "node.rowIndex + 1",
        flex: 1,
        minWidth: 55,
        editable: false,
      },
      {
        headerName: "Trip Type",
        field: "type",
        flex: 6,
        editable: false,
      },
      {
        headerName: "Start Time",
        field: "startTime",
        flex: 12,
        valueGetter: getStartDateTime,
        valueFormatter: showStartTime,
        valueSetter: startTimeSet,
        colSpan: timeColSpan,
        maxWidth: 100,
      },
      {
        headerName: "End Time",
        field: "endTime",
        flex: 12,
        valueGetter: getEndDateTime,
        valueFormatter: showEndTime,
        valueSetter: endTimeSet,
        maxWidth: 100,
      },
      {
        headerName: "Contact Name",
        field: "contactName",
        flex: 12,
      },
      {
        headerName: "Contact Number",
        field: "contactNumber",
        flex: 12,
      },
      {
        headerName: "Pick Up",
        flex: 24,
        // field: "pickUpPoint",
        valueGetter: pickUpValueGetter,
        valueSetter: pickUpValueSetter,
        colSpan: disposalOrTourColSpan,
      },
      {
        headerName: "Drop Off",
        field: "dropOffPoint",
        flex: 24,
      },
      {
        headerName: "No. Pax",
        field: "numPax",
        flex: 6,
      },
      {
        headerName: "No. Bus",
        field: "numBus",
        flex: 6,
      },

      {
        headerName: "Bus",
        field: "bus",
        flex: 32,
        cellRenderer: busCellRenderer,
        autoHeight: true,
        wrapText: true,
        editable: false,
      },
      {
        headerName: "",
        flex: 1,
        editable: false,
        cellRenderer: numUnassignedRenderer,
        valueGetter: (params) =>
          params.data.numBus - params.data.numBusAssigned,
      },
      {
        headerName: "Cancel",
        field: "delete",
        editable: false,
        cellRenderer: deleteCellRenderer,
        flex: 2,
        sortable: false,
        cellClass: "delete-cell",
      },
    ];
  }, [busCellRenderer]);

  const exportToExcel = useCallback(() => {
    const cols = gridRef.current.columnApi.getColumns();
    cols.pop();
    gridRef.current.api.exportDataAsCsv({
      columnKeys: cols,
    });
  }, []);

  var filtered = false;

  const externalFilterChanged = useCallback((newValue) => {
    filtered = newValue;
    gridRef.current.api.onFilterChanged();
  }, []);

  const isExternalFilterPresent = useCallback(() => {
    return filtered;
  }, [filtered]);

  const doesExternalFilterPass = useCallback(
    (node) => {
      if (node.data) {
        return node.data.numBusAssigned < node.data.numBus;
      }
      return true;
    },
    [filtered]
  );

  const getRowId = useCallback((params) => params.data.id);

  return (
    <>
      <Row align="bottom">
        <Col span={6}>
          <Title level={2}> {selectedDate}</Title>
        </Col>
        <Col span={4} offset={14} style={{ marginBottom: "10px" }}>
          <Checkbox
            onChange={(e) => {
              externalFilterChanged(e.target.checked);
            }}
          >
            Show Only Unassigned
          </Checkbox>
          <Button onClick={exportToExcel}>Download</Button>
        </Col>
        {/* <Col span={2} style={{ marginBottom: '5px' }}></Col> */}
      </Row>

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
          onCellValueChanged={onCellValueChanged}
          isExternalFilterPresent={isExternalFilterPresent}
          doesExternalFilterPass={doesExternalFilterPass}
          getRowId={getRowId}
          suppressCellFocus={true}
        />
      </div>
    </>
  );
}

export default AllTrips;
