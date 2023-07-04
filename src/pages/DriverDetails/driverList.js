import { useEffect, useState, useMemo } from "react";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

function DriverList() {
  const [drivers, setDrivers] = useState([]);

  const defaultColDef = useMemo(() => {
    return {
      editable: true,
      sortable: true,
      suppressMovable: true,
      flex: 3,
      minWidth: 100,
    };
  }, []);

  const fetchDrivers = async () => {
    const driversRef = collection(db, "Bus Drivers");
    const snapshot = await getDocs(driversRef);
    const driverData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setDrivers(driverData);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const deleteCellRenderer = (params) => {
    const handleClick = () => {
      const rowData = params.node.data;
      handleDelete(rowData);
    };

    return <button onClick={handleClick}>Delete</button>;
  };

  const handleDelete = (data) => {
    console.log(data);
    const confirmDelete = window.confirm(
      "Are you sure you want to delete " + data.id + "?"
    );
    if (confirmDelete) {
      deleteDoc(doc(db, "Bus Drivers", data.id))
        .then(() => {
          alert(data.id + "deleted successfully!");
          fetchDrivers();
        })
        .catch((error) => {
          console.log(error);
          alert("Failed to delete driver.");
        });
    }
  };

  const validateRow = (row) => {
    if (!/^\d{8}$/i.test(row.contactNumber)) {
      throw new Error("Contact number should only have 8 digits!");
    }

    if (!/^\d{3}[a-zA-Z]$/.test(row.icNumber)) {
      throw new Error("Invalid IC Number. IC Number should be in 123A format.");
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
    console.log(updatedData);
    try {
      validateRow(updatedData);
      const confirmUpdate = window.confirm(
        "Are you sure you want to Update this?"
      );
      if (confirmUpdate) {
        updateDoc(doc(db, "Bus Drivers", id), updatedData).catch((error) => {
          console.log(error);
          alert("Failed to update driver.");
        });
      }
    } catch (err) {
      alert(err);
    }
    fetchDrivers();
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
      headerName: "IC Number",
      field: "icNumber",
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
    <div className="ag-theme-alpine" style={{ height: "400px", width: "100%" }}>
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
