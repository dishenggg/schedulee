import { useMemo } from "react";
import { db } from "../../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button, Popconfirm, message } from "antd";

function CustomerList({ customers, updateCustomerList }) {
  const defaultColDef = useMemo(() => {
    return {
      editable: false,
      sortable: true,
      suppressMovable: true,
      flex: 3,
      minWidth: 100,
    };
  }, []);

  const columnDefs = [
    {
      headerName: "Customer Name",
      field: "customerName",
      editable: false,
      flex: 2,
    },
    {
      headerName: "Total Trips",
      field: "",
      editable: false,
      flex: 2,
    },
    {
      headerName: "Trips fulfilled  by Drivers",
      field: "",
      editable: false,
      flex: 2,
    },
    {
      headerName: "Trips fulfilled  by Sub Con",
      field: "",
      editable: false,
      flex: 2,
    },
    {
      headerName: "Total Trips Last Month",
      field: "",
      editable: false,
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

  function deleteCellRenderer(params) {
    const handleClick = () => {
      const rowData = params.node.data;
      handleDelete(rowData);
    };

    return (
      <Popconfirm
        title="Delete Customer"
        description="Confirm Delete Customer?"
        onConfirm={handleClick}
      >
        <Button danger size="small">
          Delete
        </Button>
      </Popconfirm>
    );
  };

  function handleDelete(data) {
    deleteDoc(doc(db, "Customers", data.id))
      .then(() => {
        message.success(data.id + " deleted successfully!");
        updateCustomerList();
      })
      .catch((error) => {
        message.error("Failed to delete Customer: " + error);
      });
  };

  function onCellValueChanged(params){
    const { id, ...updatedData } = params.data;
    try {
      const confirmUpdate = window.confirm(
        "Are you sure you want to Update this?"
      );
      if (confirmUpdate) {
        updateDoc(doc(db, "Customers", id), updatedData)
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
    updateCustomerList();
  }; 

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
        rowData={customers}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
        onCellValueChanged={onCellValueChanged}
        stopEditingWhenCellsLoseFocus={true}
      />
    </div>
  );
}

export default CustomerList;
