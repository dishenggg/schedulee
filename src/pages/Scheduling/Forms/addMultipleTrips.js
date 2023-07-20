import React, { useState } from "react";
import { Button, Modal, Upload, message, Table } from "antd";
import { UploadOutlined, FileAddOutlined } from "@ant-design/icons";
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

const AddMultipleTrips = ({ drivers, updateListOfTripsByDriver }) => {
  const [openModal, setOpenModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [data, setData] = useState([]);
  const { Dragger } = Upload;
  const renderBuses = (val) => {
    return <span>{val ? val.join(", ") : null}</span>;
  };

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
      dataIndex: "numPax",
    },
    {
      title: "No. Bus",
      dataIndex: "numBus",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
    },
    {
      title: "buses",
      dataIndex: "bus",
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
      dataIndex: "numPax",
    },
    {
      title: "No. Bus",
      dataIndex: "numBus",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
    },
    {
      title: "buses",
      dataIndex: "bus",
    },
    {
      title: "Start Time 2",
      dataIndex: "startTime2",
    },
    {
      title: "buses 2",
      dataIndex: "bus2",
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
      title: "Trip Description",
      dataIndex: "tripDescription",
    },
    {
      title: "skip",
      dataIndex: "skip",
    },
    {
      title: "No. Pax",
      dataIndex: "numPax",
    },
    {
      title: "No. Bus",
      dataIndex: "numBus",
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
      title: "buses",
      dataIndex: "bus",
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
      dataIndex: "numPax",
    },
    {
      title: "No. Bus",
      dataIndex: "numBus",
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
        if (header === "skip") return;
        if (header === "bus" || header === "bus2") {
          if (row[index] === "" || !row[index]) {
            trip[header] = [];
          } else {
            trip[header] = row[index].split(",");
          }
          return;
        }
        if (header === "numBus" || header === "numPax") {
          trip[header] = parseInt(row[index]);
          return;
        }
        trip[header] = row[index];
      });
      trip.numBusAssigned = trip.bus.length;
      const numBusAssigned2 = trip.bus2?.length;

      if (trip.numBusAssigned > trip.numBus || numBusAssigned2 > trip.numBus) {
        trip.status = "You have more buses assigned than required.";
      }
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

  const postToFirebase = async () => {
    const updatedData = [];

    const postOneWay = async ({ key, type, tripDate, ...row }) => {
      const tripRef = collection(db, "Dates", tripDate, "trips");
      const concatTrips = `${row.pickUpPoint} --> ${row.dropOffPoint}`;
      const updatedValues = {
        ...row,
        endTime: row.startTime,
        tripDescription: concatTrips,
        type: "standard",
      };
      await addDoc(tripRef, updatedValues);
    };

    const postTwoWay = async ({ key, type, tripDate, ...row }) => {
      // post two OneWays
      const tripRef = collection(db, "Dates", tripDate, "trips");
      const batch = writeBatch(db);

      const trip1 = { ...row };
      const trip2 = { ...row };

      trip2.startTime = trip2.startTime2; // Set start time of return trip
      trip2.bus = trip2.bus2;

      const temp = trip2.pickUpPoint; // Swap pickup point and dropoff point
      trip2.pickUpPoint = trip2.dropOffPoint;
      trip2.dropOffPoint = temp;

      const documentsToAdd = [trip1, trip2];

      documentsToAdd.forEach((docData) => {
        delete docData.startTime2;
        delete docData.bus2;

        const concatTrips = `${docData.pickUpPoint} --> ${docData.dropOffPoint}`;
        docData.endTime = docData.startTime;
        docData.tripDescription = concatTrips;
        docData.type = "standard";

        const newDocRef = doc(tripRef);
        batch.set(newDocRef, docData);
      });

      await batch.commit();
    };

    const postDisposal = async ({ key, type, tripDate, ...row }) => {
      const tripRef = collection(db, "Dates", tripDate, "trips");
      const updatedValues = {
        ...row,
        type: "disposal",
      };
      await addDoc(tripRef, updatedValues);
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
      try {
        if (status) {
          throw status;
        }
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
    updateListOfTripsByDriver();
    setConfirmLoading(false);
    setFormSubmitted(true);
  };

  const onOk = (e) => {
    e.preventDefault();
    if (formSubmitted) {
      setOpenModal(false);
      setFormSubmitted(false);
      setData([]);
    } else {
      postToFirebase();
    }
  };

  const onCancel = () => {
    setOpenModal(false);
    setData([]);
  };
  return (
    <>
      <Button
        type="primary"
        icon={<FileAddOutlined />}
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
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        onOk={onOk}
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
