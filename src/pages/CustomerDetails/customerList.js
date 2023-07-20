import { useMemo } from "react";
import { db } from "../../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button, Popconfirm, message } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

function CustomerList({ customers, updateCustomerList }) {
  const defaultColDef = useMemo(() => {
    return {
      editable: false,
      sortable: true,
      suppressMovable: true,
    };
  }, []);

  const columnDefs = [
    {
      headerName: "Customer Name",
      field: "customerName",
      flex: 4,
    },
    {
      headerName: "Total Trips",
      field: "",
      flex: 3,
    },
    {
      headerName: "Trips fulfilled by Drivers",
      field: "",
      flex: 3,
    },
    {
      headerName: "Trips fulfilled by Sub Con",
      field: "",
      flex: 3,
    },
    {
      headerName: "Total Trips Last Month",
      field: "",
      flex: 3,
    },
    {
      headerName: "History",
      field: "history",
      flex: 1,
      cellRenderer: openModal,
      sortable: false,
    },
    {
      headerName: "Delete",
      field: "delete",
      cellRenderer: deleteCellRenderer,
      flex: 1,
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
        placement="leftTop"
        title="Delete Customer"
        description="Confirm Delete Customer?"
        onConfirm={handleClick}
      >
        <Button size="small" type="primary" danger>
          Delete
        </Button>
      </Popconfirm>
    );
  }

  function handleDelete(data) {
    deleteDoc(doc(db, "Customers", data.id))
      .then(() => {
        message.success(data.id + " deleted successfully!");
        updateCustomerList();
      })
      .catch((error) => {
        message.error("Failed to delete Customer: " + error);
      });
  }

  function onCellValueChanged(params) {
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
            message.error("Failed to update customer: " + error);
          });
      }
    } catch (error) {
      message.error(error.toString());
    }
    updateCustomerList();
  }

  function openModal(params) {
    const rowData = params.node.data;
    const customerDetailsUrl = `/customer-details/${rowData.customerName}`;
    return (
      <Link
        to={{
          pathname: customerDetailsUrl,
        }}
        target="_blank"
      >
        <Button shape="circle" icon={<FileTextOutlined />}></Button>
      </Link>
    );
  }

  return (
    <div>
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
    </div>
  );
}

export default CustomerList;
