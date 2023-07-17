import { useMemo } from "react";
import { db } from "../../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button, Popconfirm, message } from "antd";

function SubConList({ subCons, updateSubConList }) {
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
        title="Delete Sub Con"
        description="Confirm Delete Sub Con?"
        onConfirm={handleClick}
      >
        <Button danger size="small">
          Delete
        </Button>
      </Popconfirm>
    );
  };

  const handleDelete = (data) => {
    deleteDoc(doc(db, "Sub Cons", data.id))
      .then(() => {
        message.success(data.id + " deleted successfully!");
        updateSubConList();
      })
      .catch((error) => {
        message.error("Failed to delete Sub Con: " + error);
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
        updateDoc(doc(db, "Sub Cons", id), updatedData).catch((error) => {
          message.error("Failed to update sub con: " + error);
        });
      }
    } catch (err) {
      message.error(err);
    }
    updateSubConList();
  };

  const stringFormatter = (params) => {
    var number = params.value;
    var firstFour = number.slice(0, 4);
    var lastFour = number.slice(4, 8);
    return firstFour + " " + lastFour;
  };

  const columnDefs = [
    {
      headerName: "Company Name",
      field: "companyName",
      flex: 2,
    },
    {
      headerName: "Bus Number",
      field: "busNumber",
      editable: false,
      flex: 2,
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
      style={{ height: "400px", width: "100%", padding: "10px 5px 20px 5px", }}
    >
      <AgGridReact
        rowData={subCons}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        stopEditingWhenCellsLoseFocus={true}
      />
    </div>
  );
}

export default SubConList;
