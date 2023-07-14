import React, { useState } from "react";
import { Button, Modal, Select } from "antd";
import { TripForm } from "./forms.js";

const AddTrip = () => {
  const [openModal, setOpenModal] = useState(false);
  const [formValue, setFormValue] = useState("1");

  const handleFormChange = (e) => {
    setFormValue(e);
  };

  return (
    <div>
      <Button
        type="primary"
        onClick={() => {
          setOpenModal(true);
        }}
      >
        Add Trip
      </Button>
      <Modal
        open={openModal}
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
              { value: "1", label: "Standard 1-Way" },
              { value: "2", label: "Standard 2-Way" },
              { value: "3", label: "Disposal" },
            ]}
          />
          <TripForm value={formValue} setOpenModal={setOpenModal} />
        </div>
      </Modal>
    </div>
  );
};

export default AddTrip;
