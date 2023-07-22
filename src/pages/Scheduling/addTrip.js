import React, { useState } from "react";
import { Button, Modal, Select } from "antd";
import { TripForm } from "./forms.js";
import { PlusCircleOutlined } from "@ant-design/icons";

const AddTrip = ({ updateListOfTripsByDriver }) => {
  const [openModal, setOpenModal] = useState(false);
  const [formValue, setFormValue] = useState("1");

  const handleFormChange = (e) => {
    setFormValue(e);
  };

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusCircleOutlined />}
        onClick={() => {
          setOpenModal(true);
        }}
      >
        Add Trip
      </Button>
      <Modal
        open={openModal}
        width={700}
        destroyOnClose={true}
        title="Add Trip"
        footer={null}
        onCancel={() => {
          setOpenModal(false);
        }}
      >
        <div>
          <Select
            defaultValue="1"
            style={{ width: 150 }}
            onChange={(e) => handleFormChange(e)}
            options={[
              { value: "1", label: "1-Way" },
              { value: "2", label: "2-Way" },
              { value: "3", label: "Disposal/Tour" },
            ]}
          />
          <TripForm
            value={formValue}
            setOpenModal={setOpenModal}
            updateListOfTripsByDriver={updateListOfTripsByDriver}
          />
        </div>
      </Modal>
    </div>
  );
};

export default AddTrip;
