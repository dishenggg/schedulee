import React, { useState } from "react";
import { Button, Modal, Upload, message, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { db } from "../../../firebase";
import {
  setDoc,
  addDoc,
  writeBatch,
  collection,
  doc,
} from "firebase/firestore";
import Papa from "papaparse";
import { ParseDateToFirestore } from "../../../utils/ParseTime";

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
      //trip["key"] = i;
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

    const postOneWay = async ({ type, tripDate, ...row }) => {
      const tripRef = collection(db, "Dates", tripDate, "trips");
      const concatTrips = `${row.pickUpPoint} --> ${row.dropOffPoint}`;
      const updatedValues = {
        ...row,
        endTime: row.startTime,
        tripDescription: concatTrips,
      };
      await addDoc(tripRef, updatedValues);
    };

    const postTwoWay = async ({ type, tripDate, ...row }) => {
      // post two OneWays
      const tripRef = collection(db, "Dates", tripDate, "trips");
      const batch = writeBatch(db);

      const trip1 = { ...row };
      const trip2 = { ...row };

      trip2.startTime = trip2.startTime2;

      const documentsToAdd = [trip1, trip2];

      documentsToAdd.forEach((docData) => {
        delete docData.startTime2;
        const concatTrips = `${docData.pickUpPoint} --> ${docData.dropOffPoint}`;
        docData.endTime = docData.startTime;
        docData.tripDescription = concatTrips;

        const newDocRef = doc(tripRef);
        batch.set(newDocRef, docData);
      });

      await batch.commit();
    };

    const postDisposal = async ({ type, tripDate, ...row }) => {
      const tripRef = collection(db, "Dates", tripDate, "trips");
      const updatedValues = {
        ...row,
      };
      await setDoc(tripRef, updatedValues);
    };

    const prepRowForFirebase = (row) => {
      const parseTimeToDatetime = (datetimeObj, timeString) => {
        const timeParts = timeString.split(":");
        datetimeObj.setHours(timeParts[0]);
        datetimeObj.setMinutes(timeParts[1]);
        datetimeObj.setSeconds(0);
        return datetimeObj;
      };

      const parseDate = (dateString) => {
        const dateParts = dateString.split("/");
        const day = parseInt(dateParts[0]);
        const month = parseInt(dateParts[1]) - 1; // Adjust month for zero-based index
        const year = parseInt(dateParts[2]);
        const date = new Date(year, month, day);
        return date;
      };

      const rowCopy = { ...row };
      const rowTripDatetime = parseDate(rowCopy.tripDate);
      rowCopy.tripDate = ParseDateToFirestore(rowTripDatetime);
      Object.entries(rowCopy).forEach(([key, value], index) => {
        if (key === "startTime" || key === "startTime2" || key === "endTime") {
          rowCopy[key] = parseTimeToDatetime(new Date(rowTripDatetime), value);
        }
      });
      return rowCopy;
    };

    setConfirmLoading(true);

    const promises = data.map(async ({ status, ...row }) => {
      // Remove status for firebase
      try {
        const firebaseData = prepRowForFirebase(row);
        if (row.type === "oneway") {
          await postOneWay(firebaseData);
        } else if (row.type === "twoway") {
          await postTwoWay(firebaseData);
        } else if (row.type === "disposal") {
          await postDisposal(firebaseData);
        } else {
          updatedData.push({ ...row, status: "Invalid Trip Type" });
        }
        updatedData.push({ ...row, status: "Success" });
      } catch (error) {
        updatedData.push({ ...row, status: error.toString() });
      }
    });
    await Promise.all(promises);
    setData(updatedData);
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
