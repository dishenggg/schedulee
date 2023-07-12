import React, { useState } from "react";
import { Button, Modal, Upload, message, Table } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { db } from "../../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import Papa from "papaparse";

const AddMultipleDrivers = ({ updateList }) => {
  const [openModal, setOpenModal] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [data, setData] = useState([]);
  const { Dragger } = Upload;
  const columns = [
    {
      title: "Bus Number",
      dataIndex: "busNumber",
    },
    {
      title: "Driver Name",
      dataIndex: "name",
    },
    {
      title: "Contact Number",
      dataIndex: "contactNumber",
    },
    {
      title: "IC Number",
      dataIndex: "icNumber",
    },
    {
      title: "Local",
      dataIndex: "local",
    },
    {
      title: "Minimum Salary",
      dataIndex: "minSalary",
    },
    {
      title: "Normal Salary",
      dataIndex: "normalSalary",
    },
    {
      title: "Peak Hour Salary",
      dataIndex: "peakHourSalary",
    },
    {
      title: "Status",
      dataIndex: "status",
    },
  ];

  const dataIndex = columns.map((col) => col.dataIndex);

  const parseContent = (content, fileType) => {
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
        const parsedRows = parseContent(content, fileType);
        const driverData = parsedRows.map((row, i) => {
          const driver = {};
          driver["key"] = i;
          dataIndex.forEach((header, index) => {
            if (/salary/i.test(header)) {
              driver[header] = parseFloat(row[index]);
            } else {
              driver[header] = row[index];
            }
          });
          return driver;
        });
        setData(driverData);
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
    setConfirmLoading(true);

    const updatedData = [];
    const dataWithoutStatus = data.map(({ status, ...rest }) => rest); // Remove status for firebase
    const promises = dataWithoutStatus.map(async (row) => {
      try {
        const busNumber = row.busNumber.toUpperCase();
        const driverRef = doc(db, "Bus Drivers", busNumber);
        const driverSnapshot = await getDoc(driverRef);

        if (driverSnapshot.exists()) {
          updatedData.push({
            ...row,
            busNumber,
            status: "Bus Number already exists.",
          });
        } else {
          const updatedValues = {
            ...row,
            busNumber, // Update the busNumber value to the capitalized version
            local: row.local === "1",
          };
          await setDoc(driverRef, updatedValues);
          updatedData.push({ ...row, busNumber, status: "Success" });
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
        Add Multiple Drivers
      </Button>
      <Modal
        open={openModal}
        destroyOnClose={true}
        title="Upload CSV of Drivers' Details"
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
          <p>Click or drag CSV to upload Driver Details.</p>
        </Dragger>
        <Table dataSource={data} columns={columns} />
      </Modal>
    </>
  );
};

export default AddMultipleDrivers;
