import { useMemo } from "react";
import { db } from "../../firebase";
import { deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Link } from "react-router-dom";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button, Popconfirm, message } from "antd";
import { FileTextOutlined } from "@ant-design/icons";

function SubConList({ subCons, updateSubConsList }) {
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
      field: "companyName",
      flex: 4,
    },
    {
      headerName: "Tag",
      field: "tag",
      editable: true,
      flex: 2,
    },
    {
      headerName: "Contact Number",
      field: "contactNumber",
      editable: true,
      flex: 2,
    },
    {
      headerName: "Trips",
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
        title="Delete Sub Con"
        description="Confirm Delete Sub Con?"
        onConfirm={handleClick}
      >
        <Button size="small" type="primary" danger>
          Delete
        </Button>
      </Popconfirm>
    );
  }

  function handleDelete(data) {
    deleteDoc(doc(db, "Sub Cons", data.id))
      .then(() => {
        message.success(data.id + " deleted successfully!");
        updateSubConsList();
      })
      .catch((error) => {
        message.error("Failed to delete Sub Con " + error);
      });
  }

  function onCellValueChanged(params) {
    const { id, ...updatedData } = params.data;
    try {
      const confirmUpdate = window.confirm(
        "Are you sure you want to Update this?"
      );
      if (confirmUpdate) {
        updateDoc(doc(db, "Sub Cons", id), updatedData)
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
    updateSubConsList();
  }

  function openModal(params) {
    const rowData = params.node.data;
    const detailsUrl = `/subcon-details/${rowData.companyName}`;
    return (
      <Link
        to={{
          pathname: detailsUrl,
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
        style={{ height: "600px", width: "100%" }}
      >
        <AgGridReact
          rowData={subCons}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={onCellValueChanged}
          stopEditingWhenCellsLoseFocus={true}
        />
      </div>
    </div>
  );
}

export default SubConList;
