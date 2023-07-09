import React, { useState } from 'react';
import { Button, Modal, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const AddMultipleDrivers = () => {
  const [openModal, setOpenModal] = useState(false);
  const { Dragger } = Upload;
  const props = {
    name: 'file',
    accept:".txt, .csv",
    action: 'https://run.mocky.io/v3/10e28101-2173-486f-a1e1-8d4036e11ff8', //JUST A MOCK ENDPOINT TO POST TO
    headers: {
        'Content-Type': 'text/plain',
        'Access-Control-Allow-Origin': 'https//run.mocky.io'
    },
    onChange(info) {
        if (info.file.status !== 'uploading') {
           let reader = new FileReader();
            reader.onload = (e) => {
               console.log(e.target.result);
            }
            reader.readAsText(info.file.originFileObj);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
        }
      },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
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
        title="Upload CSV of Drivers' Details"
        okText="Submit"
        cancelText="Cancel"
        onCancel={() => {
          setOpenModal(false);
        }}
      >
        <Dragger {...props}>
          <p>
            <UploadOutlined />
          </p>
          <p>Click or drag CSV to upload Driver Details.</p>
        </Dragger>
      </Modal>
    </>
  );
};

export default AddMultipleDrivers;
