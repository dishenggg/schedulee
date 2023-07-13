import React, { useState } from "react";
import { Button, Modal, Upload, message, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { db } from "../../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  writeBatch,
  collection,
} from "firebase/firestore";
import Papa from "papaparse";
import {
  ParseTimeToAndFromFirestore,
  ParseDateToFirestore,
} from "../../../utils/ParseTime";
new Date().setSeconds(0)
const AddMultipleTrips = () => {
  const [openModal, setOpenModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [data, setData] = useState([]);
  const { Dragger } = Upload;

  const oneWayColumns = [
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Contact Name",
      dataIndex: "contactName",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
    },
    {
      title: "Date",
      dataIndex: "tripDate",
    },
    {
      title: "Pick Up",
      dataIndex: "pickUpPoint",
    },
    {
      title: "Drop Off",
      dataIndex: "dropOffPoint",
    },
    {
      title: "No. Pax",
      dataIndex: "numberPax",
    },
    {
      title: "No. Bus",
      dataIndex: "numberBus",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
    },
  ];

  const oneWayIndex = oneWayColumns.map((col) => col.dataIndex);

  const twoWayColumns = [
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Contact Name",
      dataIndex: "contactName",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
    },
    {
      title: "Date",
      dataIndex: "tripDate",
    },
    {
      title: "Pick Up",
      dataIndex: "pickUpPoint",
    },
    {
      title: "Drop Off",
      dataIndex: "dropOffPoint",
    },
    {
      title: "No. Pax",
      dataIndex: "numberPax",
    },
    {
      title: "No. Bus",
      dataIndex: "numberBus",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
    },
    {
      title: "Start Time 2",
      dataIndex: "startTime2",
    },
  ];

  const twoWayIndex = twoWayColumns.map((col) => col.dataIndex);

  const disposalColumns = [
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Contact Name",
      dataIndex: "contactName",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
    },
    {
      title: "Date",
      dataIndex: "tripDate",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
    },
    {
      title: "End Time",
      dataIndex: "endTime",
    },
    {
      title: "Pick Up",
      dataIndex: "pickUpPoint",
    },
    {
      title: "Drop Off",
      dataIndex: "dropOffPoint",
    },
  ];

  const disposalIndex = disposalColumns.map((col) => col.dataIndex);

  const displayColumns = [
    {
      title: "Type",
      dataIndex: "type",
    },
    {
      title: "Customer Name",
      dataIndex: "customerName",
    },
    {
      title: "Description",
      dataIndex: "description",
    },
    {
      title: "Date",
      dataIndex: "tripDate",
    },
    {
      title: "Pick Up",
      dataIndex: "pickUpPoint",
    },
    {
      title: "No. Pax",
      dataIndex: "numberPax",
    },
    {
      title: "No. Bus",
      dataIndex: "numberBus",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
    },
    {
      title: "End Time",
      dataIndex: "endTime",
    },
    {
      title: "Return Time(2 Way)",
      dataIndex: "startTime2",
    },
    {
      title: "Upload Status",
      dataIndex: "status",
    },
  ];

  const displayIndex = displayColumns.map((col) => col.dataIndex);

  const parseContentToRows = (content, fileType) => {
    if (fileType === "csv") {
      return Papa.parse(content, {
        delimiter: ",",
        header: false,
        skipEmptyLines: true,
      }).data;
    } else if (fileType === "txt") {
      return Papa.parse(content, {
        delimiter: " ",
        header: false,
        skipEmptyLines: true,
      }).data;
    } else {
      message.error("Unsupported file type.");
      return;
    }
  };

  const parseRowsToTrips = (parsedRows) => {
    const res = parsedRows.map((row, i) => {
      const trip = {};
      var currentIndex;
      trip["key"] = i;
      if (row[0] === "oneway") {
        currentIndex = oneWayIndex;
      } else if (row[0] === "twoway") {
        currentIndex = twoWayIndex;
      } else if (row[0] === "disposal") {
        currentIndex = disposalIndex;
      } else {
        currentIndex = displayIndex;
        trip["status"] = "Trip type is wrong.";
      }
      currentIndex.forEach((header, index) => {
        trip[header] = row[index];
      });

      trip["bus"] = "";
      return trip;
    });
    return res;
  };

  const props = {
    name: "file",
    accept: ".txt, .csv",
    action: "",
    maxCount: 1,
    beforeUpload: (file) => {
      const reader = new FileReader();
      const fileType = file.name.split(".").pop().toLowerCase();
      reader.onload = (e) => {
        const content = e.target.result;
        const parsedRows = parseContentToRows(content, fileType);
        const tripsData = parseRowsToTrips(parsedRows);
        setData(tripsData);
      };
      reader.readAsText(file);
      return false;
    },
    onRemove() {
      setData([]);
      return true;
    },
  };

  const onOk = async () => {
    const updatedData = [];

    const postOneWay = async ({ type, ...row }) => {
      const tripRef = collection(db, "Dates", row.tripDate, "trips");
      const concatTrips = `${row.pickUpPoint} --> ${row.dropOffPoint}`;
      const updatedValues = {
        ...row,
        endTime: row.startTime,
        tripDescription: concatTrips,
      };
      console.log(updatedValues);
      await setDoc(tripRef, updatedValues);
      console.log("SET");
      updatedData.push({ ...row, Type: type, status: "Success" });
    };

    const postTwoWay = async ({ type, ...row }) => {
      // post two OneWays
      const tripRef = collection(db, "Dates", row.tripDate, "trips");
      const batch = writeBatch(db);

      const trip1 = { ...row };
      const trip2 = { ...row };

      delete trip1.startTime2;
      trip2.startTime = trip2.startTime2;
      delete trip2.startTime2;

      batch.set(tripRef, trip1);
      batch.set(tripRef, trip2);

      await batch.commit();
      updatedData.push({ ...row, Type: type, status: "Success" });
    };

    const postDisposal = async ({ type, ...row }) => {
      const tripRef = collection(db, "Dates", row.tripDate, "trips");
      const updatedValues = {
        ...row,
      };
      await setDoc(tripRef, updatedValues);
      updatedData.push({ ...row, Type: type, status: "Success" });
    };

    const prepRowForFirebase = (row) => {
      const parseTime = (timeString) => {
        const parts = timeString.split(":");
        const datetimeObj = new Date();
        datetimeObj.setHours(parts[0]);
        datetimeObj.setMinutes(parts[1]);
        return ParseTimeToAndFromFirestore(datetimeObj);
      };

      const parseDate = (dateString) => {
        const parts = dateString.split("/");
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1; // Adjust month for zero-based index
        const year = parseInt(parts[2]);
        const date = new Date(year, month, day);
        return ParseDateToFirestore(date);
      };

      Object.entries(row).forEach(([key, value], index) => {
        if (key === "startTime" || key === "startTime2" || key === "endTime") {
          row[key] = parseTime(value);
        } else if (key === "tripDate") {
          row[key] = parseDate(value);
        }
      });
      return row;
    };

    setConfirmLoading(true);

    const dataWithoutStatus = data.map(({ status, ...rest }) => rest); // Remove status for firebase
    const DataForFirebase = dataWithoutStatus.map((row) =>
      prepRowForFirebase(row)
    );

    const promises = DataForFirebase.map(async (row) => {
      try {
        if (row.type === "oneway") {
          console.log("One way");
          await postOneWay(row);
        } else if (row.type === "twoway") {
          await postTwoWay(row);
        } else if (row.type === "disposal") {
          await postDisposal(row);
        } else {
          return; // Invalid row
        }
      } catch (error) {
        updatedData.push({ ...row, status: error.toString() });
      }
    });
    await Promise.all(promises);
    setData(updatedData);
    //console.log(updatedData);
    //updateList();
    setConfirmLoading(false);
    setFormSubmitted(true);
  };

  return (
    <>
      <Button
        type="primary"
        onClick={() => {
          setOpenModal(true);
        }}
      >
        Add Multiple Trips
      </Button>
      <Modal
        open={openModal}
        destroyOnClose={true}
        title="Upload CSV of Trips' Details"
        okText={formSubmitted ? "Close" : "Submit"}
        cancelText="Cancel"
        onCancel={() => {
          setOpenModal(false);
          setData([]);
        }}
        confirmLoading={confirmLoading}
        onOk={(e) => {
          e.preventDefault();
          if (formSubmitted) {
            setOpenModal(false);
            setFormSubmitted(false);
            setData([]);
          } else {
            onOk();
          }
        }}
        width={1200}
      >
        <Dragger {...props}>
          <p>
            <UploadOutlined />
          </p>
          <p>Click or drag CSV to upload Trip Details.</p>
        </Dragger>
        <Table dataSource={data} columns={displayColumns} />
      </Modal>
    </>
  );
};

export default AddMultipleTrips;
