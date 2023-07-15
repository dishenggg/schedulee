import { useMemo } from "react";
import { db } from "../../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button, Popconfirm, message } from "antd";

function DriverList({ drivers, updateDriverList }) {
  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      sortable: true,
      suppressMovable: true,
      flex: 3,
      minWidth: 100,
    };
  }, []);

  const deleteCellRenderer = (params) => {
    const handleClick = () => {
      const rowData = params.node.data;
      handleDelete(rowData);
    };

    return (
      <Popconfirm
        title="Delete Driver"
        description="Confirm Delete Driver?"
        onConfirm={handleClick}
      >
        <Button danger size="small">
          Delete
        </Button>
      </Popconfirm>
    );
  };

  const handleDelete = (data) => {
    deleteDoc(doc(db, "Bus Drivers", data.id))
      .then(() => {
        message.success(data.id + " deleted successfully!");
        updateDriverList();
      })
      .catch((error) => {
        message.error("Failed to delete driver: " + error);
      });
  };

  const validateRow = (row) => {
    if (!/^\d{8}$/i.test(row.contactNumber)) {
      throw new Error("Contact number should only have 8 digits!");
    }

    if (!(row.busSize > 0)) {
      throw new Error("Bus Size should be atleast 1");
    }

    if (
      !(row.minSalary > 0) ||
      !(row.normalSalary > 0) ||
      !(row.peakHourSalary > 0)
    ) {
      throw new Error("Salary must be above 0");
    }
    return true;
  };

  const onCellValueChanged = (params) => {
    const { id, ...updatedData } = params.data;
    try {
      validateRow(updatedData);
      const confirmUpdate = window.confirm(
        "Are you sure you want to Update this?"
      );
      if (confirmUpdate) {
        updateDoc(doc(db, "Bus Drivers", id), updatedData)
          .then(() => {
            message.success("Successfully Updated");
          })
          .catch((error) => {
            message.error("Failed to update driver: " + error);
          });
      }
    } catch (err) {
      message.error(err);
    }
    updateDriverList();
  };

  const stringFormatter = (params) => {
    var number = params.value;
    var firstFour = number.slice(0, 4);
    var lastFour = number.slice(4, 8);
    return firstFour + " " + lastFour;
  };

  const columnDefs = [
    {
      headerName: "Bus Number",
      field: "busNumber",
      editable: false,
      flex: 2,
    },
    {
      headerName: "Driver Name",
      field: "name",
      flex: 4,
    },
    {
      headerName: "Contact Number",
      field: "contactNumber",
      valueFormatter: stringFormatter,
    },
    {
      headerName: "Bus Size",
      field: "busSize",
      flex: 2,
    },
    {
      headerName: "Local",
      field: "local",
      maxWidth: 75,
    },
    {
      headerName: "Minimum Salary",
      field: "minSalary",
      flex: 2,
    },
    {
      headerName: "Normal Salary",
      field: "normalSalary",
      flex: 2,
    },
    {
      headerName: "Peak Hour Salary",
      field: "peakHourSalary",
      flex: 2,
    },
    {
      headerName: "Remarks",
      field: "remarks",
      flex: 2,
    },
    {
      headerName: "Delete",
      field: "delete",
      editable: false,
      cellRenderer: deleteCellRenderer,
      flex: 2,
      sortable: false,
      cellClass: "delete-cell",
    },
  ];

  return (
    <div
      className={
        localStorage.getItem("darkMode") === "true"
          ? "ag-theme-alpine-dark"
          : "ag-theme-alpine"
      }
      style={{ height: "400px", width: "100%" }}
    >
      <AgGridReact
        rowData={drivers}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        stopEditingWhenCellsLoseFocus={true}
      />
    </div>
  );
}

export default DriverList;
