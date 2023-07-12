import React, { useState } from "react";
import { Button, Modal, Upload, message, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { db } from "../../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Papa from "papaparse";

const AddMultipleTrips = ({ updateList }) => {
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
      dataIndex: "date",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
    },
    {
      title: "Source",
      dataIndex: "source",
    },
    {
      title: "Destination",
      dataIndex: "destination",
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
      dataIndex: "date",
    },
    {
      title: "Start Time",
      dataIndex: "startTime",
    },
    {
      title: "Source",
      dataIndex: "source",
    },
    {
      title: "Destination",
      dataIndex: "destination",
    },
    {
      title: "Start Time 2",
      dataIndex: "startTime2",
    },
    {
      title: "Source",
      dataIndex: "source2",
    },
    {
      title: "Destination",
      dataIndex: "destination2",
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
      dataIndex: "date",
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
      title: "Source",
      dataIndex: "source",
    },
    {
      title: "Destination",
      dataIndex: "destination",
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
      dataIndex: "date",
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
      title: "Second Start Time (2 Way)",
      dataIndex: "startTime2",
    },
    {
      title: "Source",
      dataIndex: "source",
    },
    {
      title: "Status",
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
      trip["key"] = i;
      if (row[0] === "oneway") {
        oneWayIndex.forEach((header, index) => {
          trip[header] = row[index];
        });
      } else if (row[0] === "twoway") {
        twoWayIndex.forEach((header, index) => {
          trip[header] = row[index];
        });
      } else if (row[0] === "disposal") {
        disposalIndex.forEach((header, index) => {
          trip[header] = row[index];
        });
      } else {
        displayIndex.forEach((header, index) => {
          trip[header] = row[index];
        });
        trip["status"] = "Trip type is wrong.";
      }
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
    const tripRef = doc(db, "");
    const updatedData = [];

    const postOneWay = async (row) => {
      const updatedValues = {
        ...row,
      };
      await setDoc(tripRef, row);
      updatedData.push({ ...row, status: "Success" });
    };

    const postTwoWay = async (row) => {
      const updatedValues = {
        ...row,
      };
      // post two OneWays
      await setDoc(tripRef, row);
      updatedData.push({ ...row, status: "Success" });
    };

    const postDisposal = async (row) => {
      const updatedValues = {
        ...row,
      };
      await setDoc(tripRef, row);
      updatedData.push({ ...row, status: "Success" });
    };

    setConfirmLoading(true);

    const dataWithoutStatus = data.map(({ status, ...rest }) => rest); // Remove status for firebase
    const promises = dataWithoutStatus.map(async (row) => {
      try {
        if (row.type === "oneway") {
          await postOneWay(row);
        } else if (row.type === "twoway") {
          await postTwoWay(row);
        } else if (row.type === "disposal") {
          await postDisposal(row);
        } else {
          return; // Invalid row
        }
      } catch (error) {
        updatedData.push({ ...row, status: error });
      }
    });
    await Promise.all(promises);
    setData(updatedData);
    updateList();
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
            //onOk();
            alert("OK");
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
